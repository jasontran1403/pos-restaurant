import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { toast } from "react-toastify";

export default function AppMenu({ show, onClose }) {
    const [menuItems, setMenuItems] = useState([]);
    const [processedMenu, setProcessedMenu] = useState([]); // New state for processed menu
    const [quantities, setQuantities] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const saveTimeouts = useRef({});
    const listContainerRef = useRef(null);

    // Variant modal states
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedBurger, setSelectedBurger] = useState(0);
    const [selectedSausages, setSelectedSausages] = useState([]);
    const [sausageCounts, setSausageCounts] = useState([0, 0, 0]);

    // Hardcoded options
    const sausages = ["Cheddar Cheese Sausages", "Garlic Sausages", "Thueringer"];
    const burgers = ["Hamburger", "Chicken Burger"];

    const handleSaveOrder = async (platform) => {
        const listItem = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = menuItems.find(m => m.id === parseInt(id)); // Đổi từ processedMenu sang menuItems
                return {
                    productId: parseInt(id),
                    quantity: qty,
                    variant: item?.variant || 0
                };
            });

        if (listItem.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 món trước khi lưu đơn hàng.");
            return;
        }

        if (!localStorage.getItem("shiftId")) {
            toast.error("Vui lòng mở ca trước khi lưu đơn hàng.");
            return;
        }

        const billRequest = {
            shiftId: localStorage.getItem("shiftId"),
            orderId: 0,
            source: 0,
            platform: platform,
            status: "bank",
            note: "",
            customerAmount: 0,
            payback: 0,
            listItem,
        };

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
                        ![
                            "Bánh mỳ ổ",
                            "Bánh mỳ hotdogs",
                            "Bánh mỳ hamburger",
                            "Salads mix nhỏ",
                            "Nhân burger Tôm",
                            "Beef Snail sausages",
                            "Khoai Thụy Sĩ",
                            "Đạo xúc xích",
                            "Burger nhân tôm",
                            "Combo OT",
                            "Hotdogs & Coke"
                        ].includes(item.name?.trim())
                );
                setMenuItems(filtered);
            })
            .catch((error) => {
                console.error(error);
                toast.error("Không thể tải danh sách sản phẩm");
            });
    };

    // Process menu to handle variants
    useEffect(() => {
        const processMenu = () => {
            const groups = {};
            menuItems.forEach(item => {
                const key = item.name;
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            });

            const processed = [];
            Object.keys(groups).forEach(name => {
                const group = groups[name].sort((a, b) => a.variant - b.variant);
                let rep;
                const isMultiVariant = group.length > 1 &&
                    (name === "Combo 2 chúng mình" ||
                        name === "Combo Chúng mình mập ú" ||
                        name === "Đạo xúc xích");

                if (!isMultiVariant) {
                    rep = group[0];
                } else {
                    rep = { ...group[0], hasVariants: true, allVariants: group };
                }
                processed.push(rep);
            });

            setProcessedMenu(processed);

            // Initialize quantities for processed menu
            const initQty = {};
            processed.forEach((i) => (initQty[i.id] = 0));
            setQuantities(initQty);
        };

        if (menuItems.length > 0) processMenu();
    }, [menuItems]);

    useEffect(() => {
        if (show) fetchMenuItems();
    }, [show]);

    if (!show) return null;

    const scheduleSave = (id, qty) => {
        if (saveTimeouts.current[id]) clearTimeout(saveTimeouts.current[id]);
        saveTimeouts.current[id] = setTimeout(() => {
            console.log(`Saving qty ${qty} for item ID ${id}`);
        }, 300);
    };

    const handleIncrease = (item) => {
        // Check if item has variants
        if (item.hasVariants) {
            setSelectedItem(item);
            setShowVariantModal(true);
            return;
        }

        setQuantities((prev) => {
            const newVal = (prev[item.id] || 0) + 1;
            const updated = { ...prev, [item.id]: newVal };
            scheduleSave(item.id, newVal);

            setTimeout(() => {
                if (listContainerRef.current) {
                    listContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }, 100);

            return updated;
        });
    };

    const handleDecrease = (id) => {
        setQuantities((prev) => {
            const newVal = Math.max((prev[id] || 0) - 1, 0);
            const updated = { ...prev, [id]: newVal };
            scheduleSave(id, newVal);

            setTimeout(() => {
                if (listContainerRef.current) {
                    listContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }, 100);

            return updated;
        });
    };

    // Function to adjust sausage counts for Đạo xúc xích
    const adjustSausageCount = (index, delta) => {
        setSausageCounts((prev) => {
            const newCounts = [...prev];
            const currentTotal = prev.reduce((a, b) => a + b, 0);
            const newCount = newCounts[index] + delta;
            if (newCount < 0 || currentTotal + delta > 3) {
                return prev;
            }
            newCounts[index] = newCount;
            return newCounts;
        });
    };

    // Handler for variant confirmation
    const handleConfirmVariant = () => {
        if (!selectedItem) return;
        let itemToAdd;
        const name = selectedItem.name;

        if (name === "Combo 2 chúng mình") {
            if (!selectedVariant) {
                toast.error("Vui lòng chọn một loại xúc xích.");
                return;
            }
            itemToAdd = selectedItem.allVariants.find((v) => v.variant === selectedVariant);
        } else if (name === "Combo Chúng mình mập ú") {
            if (selectedSausages.length !== 2) {
                toast.error("Vui lòng chọn đúng 2 loại xúc xích.");
                return;
            }
            const sortedSaus = [...selectedSausages].sort((a, b) => a - b);
            let pairIndex;
            if (sortedSaus[0] === 0 && sortedSaus[1] === 1) pairIndex = 1;
            else if (sortedSaus[0] === 0 && sortedSaus[1] === 2) pairIndex = 2;
            else if (sortedSaus[0] === 1 && sortedSaus[1] === 2) pairIndex = 3;
            else return toast.error("Lỗi chọn xúc xích.");
            const v = pairIndex + (selectedBurger * 3);
            itemToAdd = selectedItem.allVariants.find((vv) => vv.variant === v);
        } else if (name === "Đạo xúc xích") {
            const total = sausageCounts.reduce((a, b) => a + b, 0);
            if (total !== 3) {
                toast.error("Vui lòng chọn đúng 3 xúc xích.");
                return;
            }
            const [c0, c1, c2] = sausageCounts;
            let v;
            if (c0 === 3 && c1 === 0 && c2 === 0) v = 1;
            else if (c0 === 0 && c1 === 3 && c2 === 0) v = 2;
            else if (c0 === 0 && c1 === 0 && c2 === 3) v = 3;
            else if (c0 === 2 && c1 === 1 && c2 === 0) v = 4;
            else if (c0 === 2 && c1 === 0 && c2 === 1) v = 5;
            else if (c0 === 1 && c1 === 2 && c2 === 0) v = 6;
            else if (c0 === 0 && c1 === 2 && c2 === 1) v = 7;
            else if (c0 === 1 && c1 === 0 && c2 === 2) v = 8;
            else if (c0 === 0 && c1 === 1 && c2 === 2) v = 9;
            else if (c0 === 1 && c1 === 1 && c2 === 1) v = 10;
            else {
                toast.error("Lựa chọn không hợp lệ.");
                return;
            }
            itemToAdd = selectedItem.allVariants.find((vv) => vv.variant === v);
        }

        if (itemToAdd) {
            setQuantities((prev) => {
                const newVal = (prev[itemToAdd.id] || 0) + 1;
                return { ...prev, [itemToAdd.id]: newVal };
            });
            setShowVariantModal(false);
            setSelectedItem(null);
            setSelectedVariant(null);
            setSelectedBurger(0);
            setSelectedSausages([]);
            setSausageCounts([0, 0, 0]);
        }
    };

    // Calculate total quantity by name (for display badge)
    const quantityByName = {};
    processedMenu.forEach(item => {
        if (item.hasVariants) {
            // Sum all variants
            let total = 0;
            item.allVariants.forEach(v => {
                total += quantities[v.id] || 0;
            });
            quantityByName[item.name] = total;
        } else {
            quantityByName[item.name] = quantities[item.id] || 0;
        }
    });

    const filteredItems = processedMenu
        .filter((item) =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
        .sort((a, b) => {
            const aActive = quantityByName[a.name] > 0;
            const bActive = quantityByName[b.name] > 0;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return 0;
        });

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm pt-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative p-4 bg-white/95 rounded-xl w-full max-w-lg mx-2 shadow-xl flex flex-col max-h-[70vh]"
                        initial={{ scale: 0.9, y: 40 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 40 }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition text-lg w-8 h-8 flex items-center justify-center"
                            title="Đóng"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            Danh sách sản phẩm
                        </h2>

                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Tìm món theo tên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                        </div>

                        <div
                            ref={listContainerRef}
                            className="space-y-2 overflow-y-auto rounded-lg p-2 max-h-[30vh]"
                        >
                            {filteredItems
                                .filter(item => !item.name.includes(" - 500gr"))
                                .map((item) => {
                                    const qty = quantityByName[item.name] || 0;
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
                                            <div className="flex-shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                                    {item.name}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        if (item.hasVariants) {
                                                            // Find any variant with qty > 0 and decrease it
                                                            const variantWithQty = item.allVariants.find(v => (quantities[v.id] || 0) > 0);
                                                            if (variantWithQty) {
                                                                handleDecrease(variantWithQty.id);
                                                            }
                                                        } else {
                                                            handleDecrease(item.id);
                                                        }
                                                    }}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3 h-3 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                    </svg>
                                                </button>

                                                <div className={`w-7 h-6 sm:w-9 sm:h-8 flex items-center justify-center border-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${isActive
                                                    ? "border-green-500 bg-white text-green-600"
                                                    : "border-gray-300 bg-white text-gray-600"
                                                    }`}>
                                                    {qty}
                                                </div>

                                                <button
                                                    onClick={() => handleIncrease(item)}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                                >
                                                    <svg className="w-3 h-3 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                            <button
                                className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2"
                                onClick={() => handleSaveOrder("Grab")}
                            >
                                <span>Save GrabFood</span>
                            </button>
                            <button
                                className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow font-medium transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2"
                                onClick={() => handleSaveOrder("Shopee")}
                            >
                                <span>Save ShopeeFood</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Variant Selection Modal */}
                    {showVariantModal && selectedItem && (
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => {
                                setShowVariantModal(false);
                                setSelectedItem(null);
                                setSelectedVariant(null);
                                setSelectedBurger(0);
                                setSelectedSausages([]);
                                setSausageCounts([0, 0, 0]);
                            }}
                        >
                            <motion.div
                                className="bg-white p-6 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-bold mb-4 text-center">{selectedItem.name}</h3>
                                <div className="space-y-4">
                                    {selectedItem.name === "Combo 2 chúng mình" ? (
                                        <div>
                                            <p className="text-sm mb-3">Chọn 1 loại xúc xích:</p>
                                            {sausages.map((saus, index) => (
                                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="variant"
                                                        value={index + 1}
                                                        checked={selectedVariant === index + 1}
                                                        onChange={(e) => setSelectedVariant(parseInt(e.target.value))}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{saus}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ) : selectedItem.name === "Combo Chúng mình mập ú" ? (
                                        <div>
                                            <p className="text-sm mb-3">Chọn loại burger:</p>
                                            <div className="space-y-2 mb-4">
                                                {burgers.map((burger, index) => (
                                                    <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="burger"
                                                            checked={selectedBurger === index}
                                                            onChange={() => setSelectedBurger(index)}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{burger}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-sm mb-3">Chọn 2 loại xúc xích:</p>
                                            <div className="space-y-2">
                                                {sausages.map((saus, index) => (
                                                    <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSausages.includes(index)}
                                                            onChange={(e) => {
                                                                const newSel = e.target.checked
                                                                    ? [...selectedSausages, index]
                                                                    : selectedSausages.filter(i => i !== index);
                                                                if (newSel.length <= 2) setSelectedSausages(newSel);
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm">{saus}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ) : selectedItem.name === "Đạo xúc xích" ? (
                                        <div>
                                            <p className="text-sm mb-3">Chọn số lượng cho mỗi loại xúc xích (tổng cộng 3):</p>
                                            <div className="space-y-3">
                                                {sausages.map((saus, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <span className="text-sm w-32">{saus}:</span>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => adjustSausageCount(index, -1)}
                                                                className="px-2 py-1 bg-gray-300 rounded text-sm"
                                                                disabled={sausageCounts[index] === 0}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold">{sausageCounts[index]}</span>
                                                            <button
                                                                onClick={() => adjustSausageCount(index, 1)}
                                                                className="px-2 py-1 bg-gray-300 rounded text-sm"
                                                                disabled={sausageCounts.reduce((a, b) => a + b, 0) === 3}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="text-center text-sm font-bold mt-2">
                                                    Tổng: {sausageCounts.reduce((a, b) => a + b, 0)} / 3
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex justify-end space-x-2 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowVariantModal(false);
                                            setSelectedItem(null);
                                            setSelectedVariant(null);
                                            setSelectedBurger(0);
                                            setSelectedSausages([]);
                                            setSausageCounts([0, 0, 0]);
                                        }}
                                        className="px-4 py-2 bg-gray-300 rounded"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleConfirmVariant}
                                        className="px-4 py-2 bg-blue-600 text-white rounded"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}