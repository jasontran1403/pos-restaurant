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
                        !["Hotdogs & Coke", "Bánh mỳ hotdogs", "Bánh mỳ hamburger", "Combo OT", "Salads mix nhỏ"].includes(
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
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition text-lg w-8 h-8 flex items-center justify-center"
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
                            {filteredItems
                                .filter(item => !item.name.includes(" - 500gr"))
                                .map((item) => {
                                    const qty = quantities[item.id] || 0;
                                    const isActive = qty > 0;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex items-center gap-3 border rounded-lg p-2 transition ${isActive
                                                ? "bg-green-50 border-green-400 shadow-md"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                                }`}
                                        >
                                            {/* Ảnh thumbnail */}
                                            <div className="flex-shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tên món - chiếm không gian còn lại */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                                    {item.name}
                                                </div>
                                            </div>

                                            {/* Bộ chọn số lượng - thiết kế đẹp hơn */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDecrease(item.id)}
                                                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                    </svg>
                                                </button>

                                                <div className={`w-10 h-8 sm:w-12 sm:h-9 flex items-center justify-center border-2 rounded-lg font-semibold text-sm transition-all ${isActive
                                                    ? "border-green-500 bg-white text-green-600"
                                                    : "border-gray-300 bg-white text-gray-600"
                                                    }`}>
                                                    {qty}
                                                </div>

                                                <button
                                                    onClick={() => handleIncrease(item.id)}
                                                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>

                        {/* --- Footer - responsive cho nút --- */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                            <button
                                className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                onClick={() => handleSaveOrder("Grab")}
                            >
                                <span>Save GrabFood</span>
                            </button>
                            <button
                                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                onClick={() => handleSaveOrder("Shopee")}
                            >
                                <span>Save ShopeeFood</span>
                            </button>
                            <button
                                className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg shadow font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                onClick={() => handleSaveOrder("Be")}
                            >
                                <span>Save BeFood</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}