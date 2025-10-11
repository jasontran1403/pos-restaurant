import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { toast } from "react-toastify";
import { bill } from "../../assets";

export default function AppMenu({ show, onClose }) {
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const saveTimeouts = useRef({}); // lưu debounce cho từng món

    const handleSaveOrder = async (platform) => {
        // Tạo danh sách item có số lượng > 0
        const listItem = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({
                productId: parseInt(id),
                quantity: qty,
            }));

        if (listItem.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 món trước khi lưu đơn hàng.");
            return;
        }

        if (!localStorage.getItem("shiftId")) {
            toast.error("Vui lòng mở ca trước khi lưu đơn hàng.");
            return;
        }

        const billRequest = {
            shiftId: localStorage.getItem("shiftId"), // 👉 bạn thay bằng shift thực tế
            orderId: 0, // 0 nghĩa là đơn mới, backend sẽ tự tạo
            source: 0,
            platform: platform,
            status: "bank", // hoặc "cash" / "bank"
            note: "",
            customerAmount: 0,
            payback: 0,
            listItem,
        };

        console.log(billRequest);
        try {
            const res = await Axios.post(`${API_ENDPOINT}shift/save-app-order`, billRequest, {
                headers: { "ngrok-skip-browser-warning": "69420" },
            });

            toast.success(res.data || `Lưu đơn hàng ${platform} thành công!`);
        } catch (error) {
            console.error("Lỗi khi lưu đơn:", error);
            toast.error("Không thể lưu đơn hàng. Vui lòng thử lại.");
        }
    };


    const fetchMenuItems = () => {
        Axios.get(`${API_ENDPOINT}shift/menu/app-menu`, {
            headers: { "ngrok-skip-browser-warning": "69420" },
        })
            .then((res) => {
                const filtered = res.data.filter(
                    (item) =>
                        !["Hotdogs & Coke", "Bánh mỳ hotdogs", "Bánh mỳ hamburger"].includes(
                            item.name?.trim()
                        )
                );
                setMenuItems(filtered);

                const initQty = {};
                filtered.forEach((i) => (initQty[i.id] = 0));
                setQuantities(initQty);
            })
            .catch((error) => {
                console.error(error);
                toast.error("Không thể tải danh sách sản phẩm");
            });
    };

    useEffect(() => {
        if (show) fetchMenuItems();
    }, [show]);

    if (!show) return null;

    const scheduleSave = (id, qty) => {
        if (saveTimeouts.current[id]) clearTimeout(saveTimeouts.current[id]);
        saveTimeouts.current[id] = setTimeout(() => {
            console.log(`Saving qty ${qty} for item ID ${id}`);
            // Axios.post(`${API_ENDPOINT}menu/save-qty`, { id, qty })
        }, 300);
    };


    // --- Debounce save ---
    const handleIncrease = (id) => {
        setQuantities((prev) => {
            const newVal = (prev[id] || 0) + 1;
            const updated = { ...prev, [id]: newVal };
            scheduleSave(id, newVal);
            return updated;
        });
    };

    const handleDecrease = (id) => {
        setQuantities((prev) => {
            const newVal = Math.max((prev[id] || 0) - 1, 0);
            const updated = { ...prev, [id]: newVal };
            scheduleSave(id, newVal);
            return updated;
        });
    };

    const handleChange = (id, value) => {
        const cleanValue = value.replace(/\D/g, "");
        const num = cleanValue === "" ? 0 : parseInt(cleanValue);
        setQuantities((prev) => {
            const updated = { ...prev, [id]: num };
            scheduleSave(id, num);
            return updated;
        });
    };

    // --- Filter + Sort ---
    const filteredItems = menuItems
        .filter((item) =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .sort((a, b) => {
            const aActive = (quantities[a.id] || 0) > 0;
            const bActive = (quantities[b.id] || 0) > 0;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return 0;
        });

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative p-4 bg-white/95 rounded-xl w-full max-w-lg mx-2 shadow-xl flex flex-col"
                        initial={{ scale: 0.9, y: 40 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 40 }}
                    >
                        {/* --- Nút đóng X --- */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
                            title="Đóng"
                        >
                            ✕
                        </button>

                        {/* --- Tiêu đề --- */}
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            Danh sách sản phẩm
                        </h2>

                        {/* --- Ô tìm kiếm --- */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Tìm món theo tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                        </div>

                        {/* --- Danh sách món --- */}
                        <div className="space-y-2 overflow-y-auto rounded-lg p-2 max-h-[40vh]">
                            {filteredItems.map((item) => {
                                const qty = quantities[item.id] || 0;
                                const isActive = qty > 0;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-center gap-3 border rounded-lg p-2 transition ${isActive
                                            ? "bg-green-50 border-green-400 shadow-md scale-[1.02]"
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        {/* Ảnh thumbnail */}
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                No Img
                                            </div>
                                        )}

                                        {/* Tên món */}
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800 truncate">
                                                {item.name}
                                            </div>
                                        </div>

                                        {/* Bộ chọn số lượng */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDecrease(item.id)}
                                                className="w-9 h-9 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded transition"
                                            >
                                                −
                                            </button>

                                            <input
                                                type="text"
                                                value={qty}
                                                onChange={(e) =>
                                                    handleChange(item.id, e.target.value)
                                                }
                                                className={`w-12 h-9 text-center border rounded-md text-sm font-medium flex items-center justify-center focus:outline-none transition ${isActive
                                                    ? "border-green-500 bg-white text-gray-800"
                                                    : "border-gray-300 bg-white text-gray-600"
                                                    }`}
                                            />

                                            <button
                                                onClick={() => handleIncrease(item.id)}
                                                className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded transition"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* --- Footer --- */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow font-medium transition"
                                onClick={() => handleSaveOrder("Shopee")}
                            >
                                Save ShopeeFood
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-medium transition"
                                onClick={() => handleSaveOrder("Be")}
                            >
                                Save BeFood
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
