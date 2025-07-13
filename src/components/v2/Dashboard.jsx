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
  const isMobile = useMediaQuery({ maxWidth: 768 });

  /* ------------------ STATE ------------------ */
  const { accessToken } = useAccessToken();
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null);
  const cartControls = useAnimation(); // For cart shake animation

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
  };

  const actionButtons = [
    { text: "Bank", color: "bg-blue-600", onClick: handleBank },
    { text: "Cash", color: "bg-yellow-600", onClick: handleCash },
    { text: "Save", color: "bg-green-600", onClick: handleSave },
    { text: "Cancel", color: "bg-orange-600", onClick: handleClearCart },
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

    setCart(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, qty: item.qty + 1 }
        : item
    ));
  };

  const handleDecrease = (itemId) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem.qty <= 1) {
        return prev.filter(item => item.id !== itemId);
      }
      return prev.map(item =>
        item.id === itemId
          ? { ...item, qty: item.qty - 1 }
          : item
      );
    });
  };

  const roundUpToThousand = (price) => {
    return Math.ceil(price / 1000) * 1000;
  };

  const getDiscountedPrice = (item) => {
    if (item.type > 0) {
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

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="animation-fadeIn relative">
      {/* Cart Button with Glassmorphism and Badge Overlay */}
      <motion.div
        className="fixed top-52 right-4 z-10"
        animate={cartControls}
      >
        <button
          onClick={scrollToBottom}
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

      {!loading && (
        <div className="flex flex-col gap-4 w-[95svw] mx-auto pb-[50px]">
          {/* search */}
          <div className="relative w-full mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm món…"
              className="w-full px-3 py-2 pr-9 rounded bg-white/10 text-white border border-white/20 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* slider */}
          <motion.div
            ref={sliderRef}
            className="overflow-hidden"
            style={{
              height: isMobile ? 'fit-content' : 'fit-content',
              overflowY: 'hidden'
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
              {/* Hotdogs */}
              <motion.div
                className="flex items-center gap-4 w-full bg-white/5 backdrop-blur-md rounded-xl p-4"
              >
                <div className="w-1/3">
                  <img
                    src="../icons/hotdog.png"
                    alt="Hotdogs"
                    className="w-full h-30 rounded-lg object-cover"
                  />
                </div>
                <div className="w-2/3 flex flex-col gap-2">
                  <motion.div
                    onClick={() => handleAdd({ id: 1, name: "German Hotdogs", price: 25000, image: "", category: "Hotdogs" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 1 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 1 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">German Hotdogs</p>
                      <p className="text-green-400 font-medium">{formatCurrency(25000)}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    onClick={() => handleAdd({ id: 2, name: "Mozzarella Hotdogs", price: 35000, image: "", category: "Hotdogs" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 2 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 2 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Mozzarella Hotdogs</p>
                      <p className="text-green-400 font-medium">{formatCurrency(35000)}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Hamburgers */}
              <motion.div
                className="flex items-center gap-4 w-full bg-white/5 backdrop-blur-md rounded-xl p-4"
              >
                <div className="w-2/3 flex flex-col gap-2">
                  <motion.div
                    onClick={() => handleAdd({ id: 3, name: "Hamburger", price: 45000, image: "", category: "Hamburgers" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 3 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 3 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Hamburger</p>
                      <p className="text-green-400 font-medium">{formatCurrency(45000)}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    onClick={() => handleAdd({ id: 4, name: "Double Cheese Burger", price: 60000, image: "", category: "Hamburgers" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 4 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 4 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Double Cheese Burger</p>
                      <p className="text-green-400 font-medium">{formatCurrency(60000)}</p>
                    </div>
                  </motion.div>
                </div>
                <div className="w-1/3">
                  <img
                    src="../icons/hamber.png"
                    alt="Hamburgers"
                    className="w-full h-30 rounded-lg object-cover"
                  />
                </div>
              </motion.div>

              {/* Sausages */}
              <motion.div
                className="flex items-center gap-4 w-full bg-white/5 backdrop-blur-md rounded-xl p-4"
              >
                <div className="w-1/3">
                  <img
                    src="../icons/sausage.png"
                    alt="Sausages"
                    className="w-full h-30 rounded-lg object-cover"
                  />
                </div>
                <div className="w-2/3 flex flex-col gap-2">
                  <motion.div
                    onClick={() => handleAdd({ id: 5, name: "Garlic Sausage", price: 45000, image: "", category: "Sausages" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 5 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 5 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Garlic Sausage</p>
                      <p className="text-green-400 font-medium">{formatCurrency(45000)}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    onClick={() => handleAdd({ id: 6, name: "Cheddar Sausage", price: 45000, image: "", category: "Sausages" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 6 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 6 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Cheddar Sausage</p>
                      <p className="text-green-400 font-medium">{formatCurrency(45000)}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    onClick={() => handleAdd({ id: 7, name: "Curry Wurst", price: 45000, image: "", category: "Sausages" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 7 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 7 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Curry Wurst</p>
                      <p className="text-green-400 font-medium">{formatCurrency(45000)}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Pasta */}
              <motion.div
                className="flex items-center gap-4 w-full bg-white/5 backdrop-blur-md rounded-xl p-4"
              >
                <div className="w-2/3 flex flex-col gap-2">
                  <motion.div
                    onClick={() => handleAdd({ id: 8, name: "Italian Lasagna", price: 99000, image: "", category: "Pasta" })}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${focusedItem === 8 ? 'ring-2 ring-green-500' : ''}`}
                    animate={focusedItem === 8 ? { y: [-10, 0, -5, 0], transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] } } : {}}
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold">Italian Lasagna</p>
                      <p className="text-green-400 font-medium">{formatCurrency(99000)}</p>
                    </div>
                  </motion.div>
                </div>
                <div className="w-1/3">
                  <img
                    src="../icons/lasanag.png"
                    alt="Pasta"
                    className="w-full h-30 rounded-lg object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* cart panel */}
          <div className="p-4 mt-6 bg-white/5 backdrop-blur-md rounded-xl">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Chưa có món.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* list */}
                <div>
                  <motion.ul layout className="flex flex-col gap-3">
                    {cart.map((c) => (
                      <motion.li
                        key={c.id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className="flex justify-between items-center"
                      >
                        <span className="break-words max-w-[65%]">
                          {c.name} × {c.qty}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">{formatCurrency(c.qty * c.price)}</span>
                          <button
                            onClick={() => handleDecrease(c.id)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleIncrease(c.id)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
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
                    ))}
                  </motion.ul>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-6 w-full min-w-0">
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
                            <span className="flex-1 min-w-0 truncate pr-2">{label}</span>
                            <span className={`flex-shrink-0 whitespace-nowrap ${bold ? "text-green-400" : ""}`}>
                              {formatCurrency(val)}
                            </span>
                          </div>
                        ))}

                        <div className="w-full flex justify-center gap-4 mt-6 flex-wrap">
                          {actionButtons.map(({ text, color, onClick }) => (
                            <button
                              key={text}
                              className={`w-24 px-3 py-2 ${color} hover:brightness-110 text-white rounded`}
                              onClick={onClick}
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;