import Axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { API_ENDPOINT, FILE_ENDPOINT } from "../constants";
import SockJS from "sockjs-client";

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [imgUrl, setImgUrl] = useState("");
    const messagesEndRef = useRef(null);

    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    const toggleChatbox = () => setIsOpen(!isOpen);
    const [walletAddress] = useState(localStorage.getItem("walletAddress"));

    useEffect(() => {
        const socket = new SockJS(`${FILE_ENDPOINT}/chat`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/user/${walletAddress}/private`, (message) => {
                    const chatMessage = JSON.parse(message.body);

                    // Kiểm tra nếu tin nhắn là của người dùng hiện tại
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { ...chatMessage, sender: "Server" }, // Đánh dấu tin nhắn từ server
                    ]);
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
        });

        setStompClient(client);
        client.activate(); // Mở kết nối

        return () => {
            client.deactivate(); // Đóng kết nối khi component unmount
        };
    }, []);


    const handleSend = () => {
        const localTime = new Date(Date.now()); // Thời gian local

        // Định dạng thời gian theo định dạng "yyyy-MM-dd'T'HH:mm:ss"
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0, nên cần cộng thêm 1
        const day = String(localTime.getDate()).padStart(2, '0');
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        const seconds = String(localTime.getSeconds()).padStart(2, '0');

        const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        if (input.trim() || selectedImage) {
            const newMessage = {
                content: input.trim(),
                sender: walletAddress,
                recipient: "admin",  // Người nhận cụ thể
                timestamp: formattedTime,  // Thời gian theo múi giờ của bạn
                imageUrl: imgUrl || null, // Gửi đường dẫn ảnh
            };

            if (stompClient && connected) {
                stompClient.publish({
                    destination: "/app/private-message",  // Endpoint gửi tin nhắn riêng
                    body: JSON.stringify(newMessage),
                });
            }

            // Thêm tin nhắn vào cuối mảng `messages`
            setMessages((prevMessages) => [
                ...prevMessages,
                { ...newMessage, sender: "User" }, // Tin nhắn gửi từ người dùng
            ]);

            setInput("");
            setSelectedImage(null);
            setImgUrl("");
            setTimeout(() => scrollToBottom(), 100); // Đảm bảo cuộn xuống dưới cùng
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.type.startsWith("image/")) {
            const formData = new FormData();
            formData.append("file", file); // Thêm file vào form data

            // Cấu hình request
            const config = {
                method: "post",
                url: `${API_ENDPOINT}upload/upload-image`, // Endpoint API
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`, // Nếu cần token
                    "ngrok-skip-browser-warning": "69420",
                },
                data: formData,
            };

            // Gửi request upload ảnh
            Axios.request(config)
                .then((response) => {
                    // Nếu thành công, set đường dẫn ảnh trả về từ server
                    setImgUrl(response.data); // Đường dẫn ảnh từ server
                })
                .catch((error) => {
                    console.error("Upload failed:", error);
                });
        }
    };


    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom(); // Mỗi khi `messages` thay đổi, cuộn xuống dưới
    }, [messages, isOpen]);

    return (
        <div className="chatbox-container">
            {!isOpen && (
                <div className="chatbox-icon" onClick={toggleChatbox}>
                    💬
                </div>
            )}
            {isOpen && (
                <div className="chatbox">
                    <div className="chatbox-header">
                        <div className="chatbox-header-title">
                            <h3>Chat with us</h3>
                            <p>We're here to help you!</p>
                        </div>
                        <button className="chatbox-close" onClick={toggleChatbox}>
                            ✖
                        </button>
                    </div>
                    <div className="chatbox-body">
                        {messages.map((msg, index) => (
                            <div className={`chat-message ${(msg.sender === walletAddress || msg.sender === "User") ? "sent" : "received"}`} key={index}>
                                {msg.imageUrl && <img src={`${FILE_ENDPOINT}${msg.imageUrl}`} alt="User upload" className="w-32 h-auto rounded-md" />}
                                {msg.content && <p>{msg.content}</p>}
                                <small className="chat-message-timestamp">{msg.timestamp}</small>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chatbox-footer flex items-center gap-2 p-2 border-t bg-gray-100">
                        {/* Input box */}
                        <input
                            className="flex-1 p-2 border rounded-md"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write a message..."
                        />

                        {/* File button */}
                        <button className="chatbox-file-button flex items-center justify-center p-2 bg-gray-200 rounded-md">
                            <label htmlFor="file-input" className="cursor-pointer">
                                📎
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </button>

                        {/* Send button */}
                        <button
                            className="chatbox-send flex items-center justify-center p-2 bg-blue-500 text-white rounded-md"
                            onClick={handleSend}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>

                    {selectedImage && (
                        <div className="chatbox-preview">
                            <p>Preview:</p>
                            <img src={selectedImage} alt="Preview" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chatbox;
