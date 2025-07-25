import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccessToken } from "../AccessTokenContext";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { motion, useAnimation } from "framer-motion";
import { toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";

const Dashboard = ({ tradingItemView, enableShift, resetNav }) => {
  const controls = useAnimation();
  const cartControls = useAnimation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [note, setNote] = useState(""); // Add this with other state declarations

  /* ------------------ STATE ------------------ */
  const { accessToken } = useAccessToken();
  const [menu, setMenu] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const cartRef = useRef(cart); // Ref to track latest cart state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [longPressItemId, setLongPressItemId] = useState(null); // Track long-press item
  const [isLongPressActive, setIsLongPressActive] = useState(false); // Track animation state
  const [longPressedItemId, setLongPressedItemId] = useState(null); // Track the ID of the item that was long-pressed
  const [showCashForm, setShowCashForm] = useState(false); // Track cash form visibility
  const [cashReceived, setCashReceived] = useState(""); // Track cash received input
  const [isSubmitting, setIsSubmitting] = useState(false); // Track API submission status
  const longPressTimer = useRef(null); // Timer for long-press
  const itemRefs = useRef({}); // Store refs for each item to attach event listeners
  const touchStartPos = useRef(null); // Track touch start position

  /* ----- swipe ----- */
  const sliderRef = useRef(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    let config = {
      method: 'get',
      url: `${API_ENDPOINT}shift/is-first-shift/${localStorage.getItem("workerId")}`,
      headers: {
        "ngrok-skip-browser-warning": "69420",
      }
    };

    Axios.request(config)
      .then((response) => {
        localStorage.setItem("isFirstShift", response.data);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  // Update cartRef whenever cart changes
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

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
      })
      .catch((error) => {
        Swal.fire({
          title: "Không thể tải đơn hàng",
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
        });
      });
  }, []);

  const formatCurrency = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  /* ------------------ FETCH MENU ------------------ */
  useEffect(() => {
    if (loading) return;
    setLoading(true);

    const newHome = localStorage.getItem("newHome");

    let menuType;
    if (newHome == 0) {
      menuType = tradingItemView === 4 ? 100 : (tradingItemView - 1) * 10;
    } else {
      menuType = tradingItemView === 1 ? 1 : 2;
    }

    let url = "";

    if (newHome === "1") {
      url = `${API_ENDPOINT}shift/ff-menu/0/${menuType}`;
    } else {
      url = `${API_ENDPOINT}shift/menu/${menuType}`;
    }

    Axios.get(url, {
      headers: { "ngrok-skip-browser-warning": "69420" },
    })
      .then((res) => {
        // Filter out items marked as ingredients
        const filteredMenu = res.data.filter((item) => (item.name !== "Bánh mỳ hotdogs" && item.name !== "Bánh mỳ hamburger"));
        setMenu(filteredMenu);
      })
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

  const buildPayload = (status, cashReceived = 0) => {
    const total = cart.reduce((s, i) => s + i.qty * getDiscountedPrice(i), 0);
    const payback = Math.max(0, (parseFloat(cashReceived) || 0) - total);

    return {
      shiftId: localStorage.getItem("shiftId") || 0,
      orderId: localStorage.getItem("orderId") || 0,
      status,
      source: localStorage.getItem("newHome") == 0 ? 0 : 1,
      note, // Include the note in payload
      customerAmount: parseFloat(cashReceived) || 0,
      payback,
      listItem: cart.map(({ id, qty }) => ({
        productId: id,
        quantity: qty,
      })),
    };
  };

  const submitBill = (status, successMsg, cashReceived = 0) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Set loading state

    const payload = buildPayload(status, cashReceived);

    Axios.post(`${API_ENDPOINT}shift/save-bill`, payload, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((response) => {
        if (response.data === "Lưu đơn hàng thành công") {
          Swal.fire({
            title: response.data,
            icon: "success",
            timer: 2400,
            showConfirmButton: false,
            timerProgressBar: true,
          });
          handleClearCart();
          setShowCashForm(false);
          setCashReceived("");
          resetNav();
        } else {
          Swal.fire({
            title: response.data,
            icon: "error",
            timer: 2400,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        }
      })
      .catch((e) => {
        Swal.fire({
          title: "Đã xảy ra lỗi!",
          icon: "error",
          timer: 2400,
          showConfirmButton: false,
        });
      })
      .finally(() => {
        setIsSubmitting(false); // Reset loading state
      });
  };

  const handleBank = () =>
    submitBill("bank", "Tạo đơn hàng thành công, thanh toán Chuyển Khoản!");

  const handleCash = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống, không thể thanh toán.");
      return;
    }
    setShowCashForm(true); // Show cash form
  };

  const handleCashSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent submission if already in progress

    const cash = parseFloat(cashReceived);
    const total = cart.reduce((s, i) => s + i.qty * getDiscountedPrice(i), 0);

    if (isNaN(cash) || cash < total) {
      toast.error("Số tiền nhận không hợp lệ hoặc không đủ.");
      return;
    }

    submitBill("cash", "Tạo đơn hàng thành công, thanh toán Tiền Mặt!", cash);
    setNote(""); // Reset note after submission
  };

  const handleSave = () =>
    submitBill("pending", "Lưu đơn hàng thành công!");

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    localStorage.removeItem("orderId");
    setShowCartPopup(false);
    setShowCashForm(false);
    setCashReceived("");
    setNote(""); // Reset note when clearing cart
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
      disabled: isSubmitting, // Disable during submission
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
      disabled: isSubmitting, // Disable during submission
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
            d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3"
          />
        </svg>
      ),
      color: "bg-green-600",
      onClick: handleSave,
      title: "Save",
      disabled: isSubmitting, // Disable during submission
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
      disabled: isSubmitting, // Disable during submission
    },
  ];

  /* ------------------ CART ACTIONS ------------------ */
  const handleAdd = (item) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thêm sản phẩm.");
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((c) => String(c.id) === String(item.id));
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      }
      const updatedCart = [...prev, { ...item, qty: 1 }];
      return updatedCart;
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
        String(item.id) === String(itemId) ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrease = (itemId) => {
    if (!enableShift) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi thao tác.");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => String(item.id) === String(itemId));
      if (existingItem.qty <= 1) {
        const updatedCart = prev.filter((item) => String(item.id) !== String(itemId));
        return updatedCart;
      }
      const updatedCart = prev.map((item) =>
        String(item.id) === String(itemId) ? { ...item, qty: item.qty - 1 } : item
      );
      return updatedCart;
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
    setCart((prev) => {
      const updatedCart = prev.filter((c) => String(c.id) !== String(itemId));
      return updatedCart;
    });
  };

  /* ------------------ LONG-PRESS HANDLING ------------------ */
  const startLongPress = (itemId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    // Normalize itemId to string for consistent comparison
    const normalizedItemId = String(itemId);
    // Use cartRef to get the latest cart state
    const itemInCart = cartRef.current.some((item) => String(item.id) === normalizedItemId);
    if (!itemInCart) {
      return;
    }
    if (longPressTimer.current) {
      return;
    }

    touchStartPos.current = {
      x: e.touches ? e.touches[0].clientX : e.clientX,
      y: e.touches ? e.touches[0].clientY : e.clientY,
    }; // Store touch start position
    longPressTimer.current = setTimeout(() => {
      setLongPressItemId(normalizedItemId);
      setIsLongPressActive(true);
      setLongPressedItemId(normalizedItemId); // Set the ID of the long-pressed item
      handleRemove(normalizedItemId);
      longPressTimer.current = null; // Clear timer after triggering
      setTimeout(() => {
        setLongPressItemId(null);
        setIsLongPressActive(false);
      }, 300); // Clear animation after shake
    }, 1200); // 1200ms for long-press
  };

  const cancelLongPress = (e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressItemId(null);
    setIsLongPressActive(false);
    setTimeout(() => setLongPressedItemId(null), 100); // Reset long-pressed item ID
    touchStartPos.current = null; // Clear touch start position
  };

  /* ------------------ EVENT LISTENER SETUP FOR TOUCH/CONTEXT ------------------ */
  useEffect(() => {
    const handleTouchStart = (itemId) => (e) => {
      startLongPress(itemId, e);
    };

    const handleTouchEnd = (e) => {
      cancelLongPress(e);
    };

    const handleTouchMove = (e) => {
      if (!touchStartPos.current) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - touchStartPos.current.x);
      const deltaY = Math.abs(currentY - touchStartPos.current.y);
      // Ignore small movements (increased to 15 pixels)
      if (deltaX > 15 || deltaY > 15) {
        cancelLongPress(e);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault(); // Prevent context menu
      e.stopPropagation(); // Prevent event bubbling
    };

    // Attach event listeners to each item's ref
    const attachListeners = () => {
      Object.keys(itemRefs.current).forEach((itemId) => {
        const itemElement = itemRefs.current[itemId];
        if (itemElement) {
          itemElement.addEventListener("touchstart", handleTouchStart(itemId), { passive: false });
          itemElement.addEventListener("touchend", handleTouchEnd, { passive: true });
          itemElement.addEventListener("touchmove", handleTouchMove, { passive: true });
          itemElement.addEventListener("contextmenu", handleContextMenu, { passive: false });
          itemElement.addEventListener("mousedown", handleTouchStart(itemId), { passive: false });
          itemElement.addEventListener("mouseup", handleTouchEnd, { passive: true });
          itemElement.addEventListener("mouseleave", handleTouchEnd, { passive: true });
        }
      });
    };

    // Cleanup event listeners
    const cleanupListeners = () => {
      Object.keys(itemRefs.current).forEach((itemId) => {
        const itemElement = itemRefs.current[itemId];
        if (itemElement) {
          itemElement.removeEventListener("touchstart", handleTouchStart(itemId), { passive: false });
          itemElement.removeEventListener("touchend", handleTouchEnd, { passive: true });
          itemElement.removeEventListener("touchmove", handleTouchMove, { passive: true });
          itemElement.removeEventListener("contextmenu", handleContextMenu, { passive: false });
          itemElement.removeEventListener("mousedown", handleTouchStart(itemId), { passive: false });
          itemElement.removeEventListener("mouseup", handleTouchEnd, { passive: true });
          itemElement.removeEventListener("mouseleave", handleTouchEnd, { passive: true });
        }
      });
    };

    // Attach listeners initially and re-attach when filteredMenu changes
    attachListeners();
    return cleanupListeners;
  }, [filteredMenu]); // Depend on filteredMenu to update refs

  /* ------------------ CART ICON ANIMATION ------------------ */
  useEffect(() => {
    cartControls.start({
      top: window.innerHeight - 150, // Always position 100px above the bottom
      transition: { type: "spring", stiffness: 300, damping: 20 },
    });
  }, [cartControls]);

  /* ------------------ RENDER ------------------ */
  return (
    <div className="animation-fadeIn relative">
      {/* Draggable Cart Button with Glassmorphism and Badge Overlay */}
      <motion.div
        className="fixed right-4 z-[1000]"
        animate={cartControls}
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
          className="fixed max-h-[65svh] mt-[120px] inset-0 flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="p-2 bg-white/95 backdrop-blur-md rounded-xl max-w-lg w-full mx-2 h-full overflow-y-auto flex flex-col"
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
                <div className="flex-grow max-h-[36vh] overflow-y-auto scrollbar-hide">
                  <motion.ul layout className="flex flex-col gap-3">
                    {cart.map((c, index) => (
                      <React.Fragment key={c.id}>
                        <motion.li
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="flex justify-between items-center pb Lillll

                          pb-3 border-b border-black/10 last:border-b-0"
                        >
                          <span className="break-words max-w-[30%] text-[14px] text-black">
                            {c.name} × {c.qty}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-black text-[14px]">
                              {formatCurrency(c.qty * getDiscountedPrice(c))}
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
                  {/* Always visible note input */}
                  <div className="mb-4">
                    <label className="text-sm text-black">Ghi chú:</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Nhập ghi chú (nếu có)"
                      className="w-full p-2 border rounded text-black text-sm mt-1"
                    />
                  </div>

                  {(() => {
                    const subtotal = cart.reduce((s, i) => s + i.qty * getDiscountedPrice(i), 0);
                    const vat = 0;
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
                              className={`flex-shrink-0 whitespace-nowrap ${bold ? "text-black" : "text-black"}`}
                            >
                              {formatCurrency(val)}
                            </span>
                          </div>
                        ))}

                        {/* Cash payment form (shown only when cash payment is selected) */}
                        {showCashForm && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <div className="mb-3">
                              <label className="text-sm text-black block mb-1">Số tiền nhận:</label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={cashReceived}
                                  onChange={(e) => setCashReceived(e.target.value)}
                                  placeholder="Nhập số tiền"
                                  className="flex-1 p-2 border rounded text-black text-sm"
                                  min="0"
                                  step="1000"
                                />
                                <button
                                  onClick={() => {
                                    setCashReceived(total);
                                  }}
                                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded whitespace-nowrap"
                                  disabled={isSubmitting}
                                >
                                  Thanh toán đủ
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="text-sm text-black">Tiền trả lại:</label>
                              <span className="text-sm text-black block">
                                {formatCurrency(
                                  Math.max(0, (parseFloat(cashReceived) || 0) - total)
                                )}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleCashSubmit}
                                className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                                disabled={isSubmitting} // Disable during submission
                              >
                                Xác nhận thanh toán
                              </button>
                              <button
                                onClick={() => {
                                  setShowCashForm(false);
                                  setCashReceived("");
                                }}
                                className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                                disabled={isSubmitting}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons (shown when cash form is not visible) */}
                        {!showCashForm && (
                          <div className="w-full flex justify-center gap-4 mt-4 flex-wrap">
                            {actionButtons.map(({ icon, color, onClick, title, disabled }) => (
                              <button
                                key={title}
                                className={`w-10 h-10 ${color} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"} text-white rounded-full flex items-center justify-center`}
                                onClick={onClick}
                                title={title}
                                disabled={disabled} // Apply disabled state
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        )}
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
                    ref={(el) => (itemRefs.current[item.id] = el)} // Attach ref to each item
                    className={`cursor-pointer relative no-select ${isLongPressActive && longPressItemId === String(item.id) ? "border-2 border-red-500" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click event bubbling
                      if (longPressedItemId === String(item.id)) {
                        return;
                      }
                      handleAdd(item);
                    }}
                    onMouseDown={(e) => startLongPress(item.id, e)}
                    onMouseUp={(e) => cancelLongPress(e)}
                    onMouseLeave={(e) => cancelLongPress(e)}
                    animate={
                      focusedItem === item.id
                        ? {
                          y: [-10, 0, -5, 0],
                          transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] },
                        }
                        : isLongPressActive && longPressItemId === String(item.id)
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
                      className="w-full h-[80px] object-cover rounded-lg pointer-events-none"
                      draggable={false} // Prevent image dragging
                    />
                    <p className="text-center text-white text-[10px] font-bold pointer-events-none">
                      {item.name}
                    </p>
                    {item.type > 0 && item.type <= 100 ? (
                      <div className="text-center pointer-events-none">
                        <p className="text-green-400 text-[8px] pointer-events-none">
                          {formatCurrency(getDiscountedPrice(item))}
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-green-400 text-[8px] pointer-events-none">
                        {formatCurrency(item.price)}
                      </p>
                    )}
                    {cartQtyMap[item.id] > 0 && (
                      <motion.span
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs pointer-events-none"
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