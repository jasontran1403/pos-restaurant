import React, { useState, useEffect } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import {
  Trash2,        // Delete
  Pencil,        // Edit
  DollarSign,    // Cash
  CreditCard     // Bank
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 4;

const PendingOrder = ({ handleTabClick }) => {
  const [listOrders, setListOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  function fetchOrders() {
    Axios.get(`${API_ENDPOINT}shift/order-pending`, {
      params: {
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
        shiftId: localStorage.getItem("shiftId"),
        search: searchTerm,
      },
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((res) => {
        setListOrders(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(console.error);
  }

  const fetchOrderDetails = (orderId) => {
    setIsLoadingDetails(true);
    Axios.get(`${API_ENDPOINT}shift/edit-bill/${orderId}`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((res) => {
        setOrderDetails(res.data);
      })
      .catch((error) => {
        Swal.fire({
          title: "Không thể tải đơn hàng",
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
        });
      })
      .finally(() => setIsLoadingDetails(false));
  };

  const formatNumber = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(parseFloat(n));

  const handleDelete = (orderId) => {
    Swal.fire({
      title: "Xác nhận xóa đơn hàng?",
      text: `Bạn muốn xóa đơn hàng #${orderId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        Axios.get(`${API_ENDPOINT}shift/clear-bill/${orderId}`)
          .then(() => {
            // Reset expanded order before fetching new orders
            setExpandedOrder(null);
            setOrderDetails(null);
            fetchOrders();
            Swal.fire({
              title: "Xóa đơn hàng thành công!",
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
              timerProgressBar: true,
            });
          })
          .catch(() => {
            Swal.fire({
              title: "Đã xảy ra lỗi!",
              icon: "error",
              timer: 1200,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  const handleToggleStatus = (orderId, status) => {
    Swal.fire({
      title: "Xác nhận chuyển trạng thái đơn hàng?",
      text: `Bạn muốn chuyển trạng thái đơn hàng thành đã thanh toán bằng phương thức ${status === "BANK" ? "Chuyển khoản" : "Tiền mặt"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        Axios.get(`${API_ENDPOINT}shift/confirm-bill/${orderId}/${status}`)
          .then(() => {
            // Reset expanded order before fetching new orders
            setExpandedOrder(null);
            setOrderDetails(null);
            fetchOrders();
            Swal.fire({
              title: "Chuyển trạng thái đơn hàng thành công!",
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
              timerProgressBar: true,
            });
          })
          .catch(() => {
            Swal.fire({
              title: "Đã xảy ra lỗi!",
              icon: "error",
              timer: 1200,
              showConfirmButton: false,
            });
          });
      }
    });
  };

  const handleEdit = (orderId) => {
    localStorage.setItem("orderId", orderId);
    handleTabClick("Trading");
  };

  const handleOrderClick = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setOrderDetails(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        when: "afterChildren",
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm theo mã đơn…"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-[95svw] sm:w-80 mx-auto block px-3 py-2 rounded-lg bg-white/20 backdrop-blur placeholder-white/70 text-white focus:outline-none"
      />

      {/* LIST */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {listOrders.map((order) => (
          <AnimatePresence key={order.orderId}>
            {/* Only show the card if it's expanded or no card is expanded */}
            {(!expandedOrder || expandedOrder === order.orderId) && (
              <motion.div
                className={`w-[95svw] sm:w-full backdrop-blur-md rounded-2xl shadow-md p-2 grid grid-cols-3 items-start
                           border border-white/10 cursor-pointer
                           ${expandedOrder === order.orderId ? "bg-[#76807A]/80 col-span-full" : "bg-[#76807A80]/50"}`}
                onClick={() => handleOrderClick(order.orderId)}
                initial={{ scale: 1 }}
                animate={{
                  scale: expandedOrder === order.orderId ? 1 : 1,
                  width: expandedOrder === order.orderId ? "100%" : "auto"
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                layout
              >
                {/* TIME */}
                <div className="text-left text-xs text-white/80 leading-tight">
                  <div>
                    {new Date(order.createdAt * 1000).toLocaleTimeString("vi-VN")}
                  </div>
                  <div>
                    {new Date(order.createdAt * 1000).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </div>
                </div>

                {/* CENTER */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    Đơn #{order.orderId}
                  </div>
                  <div className="text-green-200 text-sm">
                    {formatNumber(order.totalAmount)} đ
                  </div>
                </div>

                {/* STATUS + TOGGLE */}
                <div className="text-right flex flex-col items-end gap-2 mt-2">
                  {/* ICONS */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(order.orderId);
                      }}
                      className="text-white hover:text-yellow-400 transition"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(order.orderId);
                      }}
                      className="text-white hover:text-red-500 transition"
                      title="Xoá"
                    >
                      <Trash2 size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(order.orderId, "CASH");
                      }}
                      className="text-white hover:text-green-300 transition"
                      title="Chuyển về CASH"
                    >
                      <DollarSign size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(order.orderId, "BANK");
                      }}
                      className="text-white hover:text-blue-300 transition"
                      title="Chuyển về BANK"
                    >
                      <CreditCard size={18} />
                    </button>
                  </div>
                </div>

                {/* ORDER DETAILS (EXPANDABLE) */}
                {expandedOrder === order.orderId && (
                  <motion.div
                    className="col-span-3 mt-4 bg-white/10 rounded-lg overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="max-h-[40vh] overflow-y-auto p-2">
                      {isLoadingDetails ? (
                        <div className="flex justify-center py-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {orderDetails?.map((item) => (
                            <motion.div
                              key={item.id}
                              className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0"
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                            >
                              <span className="text-white">{item.name} × {item.qty}</span>
                              <span className="text-green-200">
                                {formatNumber(item.price * item.qty)} đ
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* PAGINATION */}
      {!expandedOrder && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-white/20 text-white disabled:opacity-30"
          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 rounded ${p === currentPage
                ? "bg-white text-black font-semibold"
                : "bg-white/20 text-white"
                }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-white/20 text-white disabled:opacity-30"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingOrder;