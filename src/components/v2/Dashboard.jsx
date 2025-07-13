import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccessToken } from "../AccessTokenContext";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { motion, useAnimation } from "framer-motion";
import { toast } from "react-toastify";
import { useMediaQuery } from "react-responsive"; // Thêm hook này
import bestSeller from "../../assets/icons/best-seller.png"; // Giả sử bạn có hình ảnh này
import newMenu from "../../assets/icons/new-menu.png"; // Giả sử bạn có hình ảnh này

const Dashboard = ({ tradingItemView, enableShift }) => {
  const controls = useAnimation();
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Thêm kiểm tra mobile

  /* ------------------ STATE ------------------ */
  const { accessToken } = useAccessToken();
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ----- swipe ----- */
  const sliderRef = useRef(null);
  const [dragLimit, setDragLimit] = useState(0);

  /* ----- popup ----- */
  const [activeItem, setActiveItem] = useState(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!activeItem) return;
      const card = document.getElementById(`card-${activeItem}`);
      if (card && !card.contains(e.target)) {
        setActiveItem(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeItem]);

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

  // Cập nhật drag limit và reset position khi filteredMenu thay đổi
  useEffect(() => {
    const updateSlider = () => {
      if (!sliderRef.current) return;

      // Tính toán lại drag limit
      const newLimit = sliderRef.current.scrollWidth - sliderRef.current.offsetWidth;
      setDragLimit(Math.max(0, newLimit));

      // Reset vị trí slider với animation
      controls.start({ x: 0 }, { type: "spring", stiffness: 500, damping: 30 });
    };

    // Sử dụng setTimeout để đảm bảo DOM đã cập nhật
    const timer = setTimeout(updateSlider, 50);
    return () => clearTimeout(timer);
  }, [filteredMenu, controls]);

  // Reset khi search thay đổi
  useEffect(() => {
    setActiveItem(null);
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

  /* ---------- Gọi cho từng nút ---------- */
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
  const handleAdd = (item, qty) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thêm sản phẩm.");
      return;
    }

    qty = Number(qty || 1);
    if (!qty || qty <= 0) return toast.error("Nhập số hợp lệ");

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === item.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += qty;
        return updated;
      }
      return [...prev, { ...item, qty }];
    });
    setQuantities((q) => ({ ...q, [item.id]: "" }));
    setActiveItem(null);
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

  // Tính giá sau giảm (đã làm tròn)
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

  /* ------------------ RENDER ------------------ */
  return (
    <div className="animation-fadeIn">
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
              className={`${isMobile ? 'flex flex-col gap-3' : 'flex gap-4'}`}
              drag={!isMobile ? "x" : false}
              dragConstraints={!isMobile ? { left: -dragLimit, right: 0 } : undefined}
              dragElastic={!isMobile ? 0.05 : undefined}
              animate={controls}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {filteredMenu.map((item) => {
                const inCart = cartQtyMap[item.id] ?? 0;
                const remain = item.stocks - inCart;
                const isActive = activeItem === item.id;
                const discountPrice = item.type > 0
                  ? Math.ceil(item.price * (100 - item.type) / 100 / 1000) * 1000
                  : item.price;

                return (
                  <motion.div
                    id={`card-${item.id}`}
                    key={item.id}
                    onClick={() => setActiveItem(isActive ? null : item.id)}
                    className={`relative w-full flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl transition-all ${isActive ? "ring-2 ring-green-500" : ""
                      }`}
                  >
                    {/* Cột 1: Hình ảnh */}
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />

                      {/* Badge giảm giá hình tròn */}
                      {item.type > 0 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">-{item.type}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cột 2: Thông tin sản phẩm */}
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{item.name}</p>

                      <div className="flex items-center gap-2">
                        {item.type > 0 ? (
                          <>
                            <p className="text-gray-400 line-through text-sm">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-green-400 font-medium">
                              {formatCurrency(discountPrice)}
                            </p>
                          </>
                        ) : (
                          <p className="text-green-400 font-medium">
                            {formatCurrency(item.price)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cột 3: Badge hình ảnh New/Best Seller */}
                    <div className="flex flex-col items-end">
                      {item.bestSeller && (
                        <img
                          src={bestSeller}
                          alt="Best Seller"
                          className="w-16 h-16 object-contain"
                        />
                      )}
                      {!item.bestSeller && item.new && (
                        <img
                          src={newMenu}
                          alt="New"
                          className="w-16 h-16 object-contain"
                        />
                      )}
                    </div>

                    {isActive && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center p-4 rounded-xl z-10"
                      >
                        <input
                          type="number"
                          min={1}
                          max={remain}
                          value={quantities[item.id] || ""}
                          onChange={(e) => setQuantities({ ...quantities, [item.id]: e.target.value })}
                          placeholder="SL"
                          className="w-20 mb-2 px-2 py-1 text-center rounded bg-white/10 text-white border border-white/20 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAdd(item, quantities[item.id] || 1)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                        >
                          Xác nhận
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
                            className={`flex items-center w-full min-w-0 justify-between ${bold ? "font-semibold" : ""
                              }`}
                          >
                            <span className="flex-1 min-w-0 truncate pr-2">{label}</span>
                            <span className={`flex-shrink-0 whitespace-nowrap ${bold ? "text-green-400" : ""
                              }`}>
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