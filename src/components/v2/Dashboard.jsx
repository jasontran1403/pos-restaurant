import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccessToken } from "../AccessTokenContext";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { motion, useAnimation } from "framer-motion";
import { toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";

const Dashboard = ({ tradingItemView, enableShift }) => {
  const controls = useAnimation();
  const cartControls = useAnimation();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  /* ------------------ STATE ------------------ */
  const { accessToken } = useAccessToken();
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [longPressItemId, setLongPressItemId] = useState(null); // Track long-press item
  const [isLongPressActive, setIsLongPressActive] = useState(false); // Track animation state
  const [hasLongPressed, setHasLongPressed] = useState(false); // Track if long-press occurred
  const longPressTimer = useRef(null); // Timer for long-press

  /* ----- swipe ----- */
  const sliderRef = useRef(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    const orderId = localStorage.getItem("orderId");

    if (!orderId) return;

    Axios.get(`${API_ENDPOINT}shift/edit-bill/${orderId}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((res) => {
        setCart(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        Swal.fire({
          title: "Không thể tải đơn hàng",
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
        });
      });
  }, [localStorage.getItem("orderId")]);

  const formatCurrency = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  /* ------------------ FETCH MENU ------------------ */
  useEffect(() => {
    if (loading) return;
    setLoading(true);

    const menuType = tradingItemView === 4 ? 25 : (tradingItemView - 1) * 10;
    Axios.get(`${API_ENDPOINT}shift/menu/${menuType}`, {
      headers: { "ngrok-skip-browser-warning": "69420" },
    })
      .then((res) => setMenu(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken, tradingItemView]);

  /* ------------------ FILTER + DRAG LIMIT ------------------ */
  const filteredMenu = useMemo(
    () => menu.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [menu, search]
  );

  useEffect(() => {
    const updateSlider = () => {
      if (!sliderRef.current) return;

      const newLimit = sliderRef.current.scrollWidth - sliderRef.current.offsetWidth;
      setDragLimit(Math.max(0, newLimit));

      controls.start({ x: 0 }, { type: "spring", stiffness: 500, damping: 30 });
    };

    const timer = setTimeout(updateSlider, 50);
    return () => clearTimeout(timer);
  }, [filteredMenu, controls]);

  useEffect(() => {
    controls.start({ x: 0 }, { type: "spring", stiffness: 500, damping: 30 });
  }, [search, controls]);

  /* ------------------ CART MAP (đã chọn) ------------------ */
  const cartQtyMap = useMemo(() => {
    const m = {};
    cart.forEach(({ id, qty }) => (m[id] = qty));
    return m;
  }, [cart]);

  const buildPayload = (status) => ({
    shiftId: localStorage.getItem("shiftId") || 0,
    orderId: localStorage.getItem("orderId") || 0,
    status,
    listItem: cart.map(({ id, qty }) => ({
      productId: id,
      quantity: qty,
    })),
  });

  const submitBill = (status, successMsg) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    Axios.post(`${API_ENDPOINT}shift/save-bill`, buildPayload(status), {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then(() => {
        Swal.fire({
          title: successMsg,
          icon: "success",
          timer: 2400,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        handleClearCart();
      })
      .catch((e) => {
        console.log(e);
        Swal.fire({
          title: "Đã xảy ra lỗi!",
          icon: "error",
          timer: 2400,
          showConfirmButton: false,
        });
      });
  };

  const handleBank = () =>
    submitBill("bank", "Tạo đơn hàng thành công, thanh toán Chuyển Khoản!");

  const handleCash = () =>
    submitBill("cash", "Tạo đơn hàng thành công, thanh toán Tiền Mặt!");

  const handleSave = () =>
    submitBill("pending", "Lưu đơn hàng thành công!");

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    localStorage.removeItem("orderId");
    setShowCartPopup(false);
  };

  const actionButtons = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      color: "bg-blue-600",
      onClick: handleBank,
      title: "Bank",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-yellow-600",
      onClick: handleCash,
      title: "Cash",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 Pesh w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"
          />
        </svg>
      ),
      color: "bg-green-600",
      onClick: handleSave,
      title: "Save",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      color: "bg-orange-600",
      onClick: handleClearCart,
      title: "Clear",
    },
  ];

  /* ------------------ CART ACTIONS ------------------ */
  const handleAdd = (item) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thêm sản phẩm.");
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === item.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setFocusedItem(item.id);
    setTimeout(() => setFocusedItem(null), 1000); // Hide focus border after 1s
    cartControls.start({
      x: [0, -5, 5, -5, 0],
      transition: { duration: 0.3 },
    }); // Shake animation
  };

  const handleIncrease = (itemId) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrease = (itemId) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === itemId);
      if (existingItem.qty <= 1) {
        return prev.filter((item) => item.id !== itemId);
      }
      return prev.map((item) =>
        item.id === itemId ? { ...item, qty: item.qty - 1 } : item
      );
    });
  };

  const roundUpToThousand = (price) => {
    return Math.ceil(price / 1000) * 1000;
  };

  const getDiscountedPrice = (item) => {
    if (item.type > 0 && item.type <= 100) {
      const discountAmount = item.price * (item.type / 100);
      const discountedPrice = item.price - discountAmount;
      return roundUpToThousand(discountedPrice);
    }
    return item.price;
  };

  const handleRemove = (itemId) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi xử lý giỏ hàng.");
      return;
    }

    setCart((prev) => prev.filter((c) => c.id !== itemId));
  };

  /* ------------------ LONG-PRESS HANDLING ------------------ */
  const startLongPress = (itemId, e) => {
    if (!cartQtyMap[itemId] || longPressTimer.current) return; // Chỉ bắt đầu nếu mục trong giỏ và không có timer
    if (isMobile) {
      e.preventDefault(); // Ngăn menu ngữ cảnh trên di động
      e.stopPropagation(); // Ngăn sự kiện lan truyền
    }
    longPressTimer.current = setTimeout(() => {
      setLongPressItemId(itemId);
      setIsLongPressActive(true);
      setHasLongPressed(true); // Set flag to indicate long-press occurred
      handleRemove(itemId);
      setTimeout(() => {
        setLongPressItemId(null);
        setIsLongPressActive(false);
      }, 300); // Xóa animation sau khi lắc
    }, 1000); // 1000ms cho nhấn giữ
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressItemId(null);
    setIsLongPressActive(false);
    setTimeout(() => setHasLongPressed(false), 100); // Reset flag after a short delay
  };

  /* ------------------ CART ICON ANIMATION ------------------ */
  useEffect(() => {
    cartControls.start({
      top: window.innerHeight - 100, // Always position 100px above the bottom
      transition: { type: "spring", stiffness: 300, damping: 20 },
    });
  }, [cartControls]);

  /* ------------------ RENDER ------------------ */
  return (
    <div className="animation-fadeIn relative">
      {/* Draggable Cart Button with Glassmorphism and Badge Overlay */}
      <motion.div
        className="fixed right-4 z-[1000]" // Highest z-index to ensure it's on top
        animate={cartControls}
        drag
        dragMomentum={false}
        dragConstraints={{
          left: -window.innerWidth + 60,
          right: 0,
          top: showCartPopup ? window.innerHeight - 100 : 0, // Allow dragging to top when popup is closed
          bottom: showCartPopup ? window.innerHeight - 100 : window.innerHeight - 100,
        }}
      >
        <button
          onClick={() => setShowCartPopup(!showCartPopup)}
          className="bg-white/10 backdrop-blur-md text-white rounded-full flex items-center gap-2 p-2 relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <motion.span
            className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1"
            animate={{ y: [0, -5, 0], transition: { duration: 0.3 } }}
            onAnimationComplete={() => cartControls.set({ x: 0 })}
          >
            {cart.reduce((sum, item) => sum + item.qty, 0)}
          </motion.span>
        </button>
      </motion.div>

      {/* Cart Popup */}
      {showCartPopup && (
        <motion.div
          className="fixed max-h-[65svh] mt-[130px] inset-0 bg-black/50 flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="p-2 bg-white/80 backdrop-blur-md rounded-xl max-w-lg w-full mx-2 h-full overflow-y-auto flex flex-col"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            {cart.length === 0 ? (
              <p
                className="text-sm text-center text-black italic flex-grow"
                onClick={() => setShowCartPopup(false)}
              >
                Chưa có món.
              </p>
            ) : (
              <div className="flex flex-col flex-grow">
                <div className="flex-grow max-h-[34vh] overflow-y-auto scrollbar-hide">
                  <motion.ul layout className="flex flex-col gap-3">
                    {cart.map((c, index) => (
                      <React.Fragment key={c.id}>
                        <motion.li
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="flex justify-between items-center pb-3 border-b border-black/10 last:border-b-0"
                        >
                          <span className="break-words max-w-[30%] text-[14px] text-black">
                            {c.name} × {c.qty}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-green-400 text-[14px]">
                              {formatCurrency(c.qty * c.price)}
                            </span>
                            <button
                              onClick={() => handleDecrease(c.id)}
                              className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleIncrease(c.id)}
                              className="text-sm bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleRemove(c.id)}
                              className="text-sm bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                            >
                              x
                            </button>
                          </div>
                        </motion.li>
                        {index < cart.length - 1 && (
                          <hr className="border-t border-black/10" />
                        )}
                      </React.Fragment>
                    ))}
                  </motion.ul>
                </div>
                <div className="border-t border-black/10 pt-4 mt-4">
                  {(() => {
                    const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
                    const vat = subtotal * 0.1;
                    const total = subtotal + vat;

                    return (
                      <>
                        {[
                          ["Tạm tính:", subtotal],
                          ["VAT 10%:", vat],
                          ["Tổng cộng:", total, true],
                        ].map(([label, val, bold]) => (
                          <div
                            key={label}
                            className={`flex items-center w-full min-w-0 justify-between ${bold ? "font-semibold" : ""}`}
                          >
                            <span className="flex-1 min-w-0 truncate pr-2 text-black">
                              {label}
                            </span>
                            <span
                              className={`flex-shrink-0 whitespace-nowrap ${bold ? "text-green-400" : "text-black"}`}
                            >
                              {formatCurrency(val)}
                            </span>
                          </div>
                        ))}
                        <div className="w-full flex justify-center gap-4 mt-2 flex-wrap">
                          {actionButtons.map(({ icon, color, onClick, title }) => (
                            <button
                              key={title}
                              className={`w-10 h-10 ${color} hover:brightness-110 text-white rounded-full flex items-center justify-center`}
                              onClick={onClick}
                              title={title}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4 w-[95svw] mx-auto">
          {/* slider */}
          <motion.div
            ref={sliderRef}
            className="overflow-hidden"
            style={{
              height: isMobile ? "fit-content" : "fit-content",
              overflowY: isMobile ? "auto" : "hidden",
            }}
          >
            <motion.div
              className="flex flex-col gap-4"
              drag={!isMobile ? "x" : false}
              dragConstraints={!isMobile ? { left: -dragLimit, right: 0 } : undefined}
              dragElastic={!isMobile ? 0.05 : undefined}
              animate={controls}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="grid grid-cols-3 gap-4">
                {filteredMenu.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`cursor-pointer relative no-select no-touch ${
                      isLongPressActive && longPressItemId === item.id ? "border-2 border-red-500" : ""
                    }`}
                    onClick={() => {
                      if (hasLongPressed) return; // Prevent adding to cart if long-press occurred
                      handleAdd(item);
                    }}
                    onMouseDown={() => startLongPress(item.id)}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={(e) => startLongPress(item.id, e)}
                    onTouchEnd={cancelLongPress}
                    onContextMenu={(e) => e.preventDefault()} // Ngăn menu ngữ cảnh
                    onTouchMove={(e) => e.preventDefault()} // Ngăn các hành vi cảm ứng khác
                    animate={
                      focusedItem === item.id
                        ? {
                            y: [-10, 0, -5, 0],
                            transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] },
                          }
                        : isLongPressActive && longPressItemId === item.id
                        ? {
                            x: [-5, 5, -5, 5, 0],
                            transition: { duration: 0.3, repeat: 1 },
                          }
                        : {}
                    }
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-[80px] object-cover rounded-lg no-select no-touch pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()} // Ngăn menu ngữ cảnh
                      onTouchStart={(e) => e.preventDefault()} // Ngăn hành vi mặc định trên di động
                      onTouchMove={(e) => e.preventDefault()} // Ngăn các hành vi cảm ứng khác
                      draggable={false} // Ngăn kéo thả ảnh
                    />
                    <p className="text-center text-white text-[10px] font-bold no-select no-touch">
                      {item.name}
                    </p>
                    {item.type > 0 && item.type <= 100 ? (
                      <div className="text-center no-select no-touch">
                        <p className="text-green-400 text-[8px] no-select no-touch">
                          {formatCurrency(getDiscountedPrice(item))}
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-green-400 text-[8px] no-select no-touch">
                        {formatCurrency(item.price)}
                      </p>
                    )}
                    {cartQtyMap[item.id] > 0 && (
                      <motion.span
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs no-select no-touch"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {cartQtyMap[item.id]}
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;