import React, { useState, useEffect } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify"; // Assuming you use react-toastify for toasts

const ITEMS_PER_PAGE = 4;

const CompleteOrder = () => {
  const [listOrders, setListOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "import" or "destroy"
  const [menuItems, setMenuItems] = useState([]);
  const [stockQuantities, setStockQuantities] = useState({});

  /* ----------- Lấy dữ liệu ----------- */
  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, [currentPage, searchTerm]);

  function fetchOrders() {
    Axios.get(`${API_ENDPOINT}shift/order-completed`, {
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

  const fetchMenuItems = () => {
    Axios.get(`${API_ENDPOINT}shift/menu/0`, {
      headers: { "ngrok-skip-browser-warning": "69420" },
    })
      .then((res) => {
        setMenuItems(res.data);
        const initialQuantities = {};
        res.data.forEach((item) => {
          initialQuantities[item.id] = { quantityStocks: 0, quantityPackages: 0 };
        });
        setStockQuantities(initialQuantities);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Không thể tải danh sách sản phẩm");
      });
  };

  /* ----------- Fetch Order Details ----------- */
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

  /* ----------- Helpers ----------- */
  const formatNumber = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(parseFloat(n));

  const toggleStatus = (orderId, currentStatus) => {
    const newStatus = currentStatus === "BANK" ? "CASH" : "BANK";
    Swal.fire({
      title: "Xác nhận thay đổi trạng thái?",
      text: `Bạn muốn chuyển sang ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        Axios.get(`${API_ENDPOINT}shift/toggle-bill/${orderId}`)
          .then(() => {
            fetchOrders();
            Swal.fire({
              title: "Cập nhật thành công!",
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
              timerProgressBar: true,
            });
          })
          .catch(() =>
            Swal.fire({
              title: "Đã xảy ra lỗi!",
              icon: "error",
              timer: 1200,
              showConfirmButton: false,
            })
          );
      }
    });
  };

  /* ----------- Handle Expand/Collapse ----------- */
  const handleOrderClick = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setOrderDetails(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId);
    }
  };

  /* ----------- Download Report ----------- */
  const handleDownloadReport = () => {
    Axios.get(`${API_ENDPOINT}shift/download-report`, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        Swal.fire({
          title: "Không thể tải báo cáo",
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
        });
      });
  };

  /* ----------- Handle Stock Quantity Change ----------- */
  const handleStockQuantityChange = (itemId, type, value) => {
    setStockQuantities((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type]: Math.max(0, parseInt(value) || 0),
      },
    }));
  };

  /* ----------- Handle Import/Destroy Submit ----------- */
  const handleSubmitStock = () => {
    if (localStorage.getItem("shiftId") == null || localStorage.getItem("shiftId") == "") return;
    const payload = {
      items: Object.entries(stockQuantities).map(([itemId, quantities]) => ({
        productId: itemId, // Map itemId to productId as expected by backend
        ...(modalType === "import" ? { quantityPackages: quantities.quantityPackages } : {}), // Use quantityStocks for import
        ...(modalType === "destroy" ? { quantityStocks: quantities.quantityPackages } : {}), // Use quantityPackages for destroy
      })),
    };

    const endpoint = modalType === "import" ? "shift/import-stock" : "shift/destroy-product";
    Axios.post(`${API_ENDPOINT}${endpoint}/${localStorage.getItem("shiftId")}`, payload, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then(() => {
        Swal.fire({
          title: `${modalType === "import" ? "Nhập kho" : "Xóa kho"} thành công!`,
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
        setIsModalOpen(false);
        setStockQuantities((prev) => {
          const resetQuantities = Object.keys(prev).reduce((acc, itemId) => ({
            ...acc,
            [itemId]: { quantityStocks: 0, quantityPackages: 0 },
          }), {});
          return resetQuantities;
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          title: "Đã xảy ra lỗi!",
          icon: "error",
          timer: 1200,
          showConfirmButton: false,
        });
      });
  };

  // Animation variants
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

  // Check if shiftId is valid
  const isShiftIdValid = localStorage.getItem("shiftId") && localStorage.getItem("shiftId") !== "";

  return (
    <div className="space-y-4 relative">
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
                className={`w-[95svw] sm:w-full backdrop-blur-md rounded-2xl shadow-md p-3 grid grid-cols-3 items-start
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
                <div className="text-right flex flex-col items-end mt-2">
                  <span
                    className="text-green-300"
                    title={order.status === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(order.orderId, order.status);
                    }}
                  >
                    {order.status === "CASH" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM18 8H2v7a2 2 0 002 2h12a2 2 0 002-2V8zM10 11a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L1 7l1 2h20l1-2-11-5zm0 3.26L17.74 7H6.26L12 5.26zM4 10v10H2v2h20v-2h-2V10H4zm2 2h2v8H6v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8z" />
                      </svg>
                    )}
                  </span>
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

      {/* MODAL FOR IMPORT/DESTROY */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/70 backdrop-blur-md p-6 rounded-lg w-[90%] max-w-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <h2 className="text-green text-lg mb-4">
              {modalType === "import" ? "Nhập kho" : "Xóa kho"}
            </h2>
            <div className="max-h-[30svh] overflow-y-auto">
              {menuItems.length === 0 ? (
                <p className="text-center text-gray-500">Không có sản phẩm để {modalType === "import" ? "nhập" : "xóa"} kho.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <span className="flex-1 text-[12px]">{item.name}</span>
                      <div className="flex gap-2">
                        {modalType === "import" && (
                          <div>
                            <label className="text-[12px] mr-1">Bịch</label>
                            <input
                              type="number"
                              min="0"
                              value={stockQuantities[item.id]?.quantityStocks || 0}
                              onChange={(e) => handleStockQuantityChange(item.id, "quantityStocks", e.target.value)}
                              className="w-16 border rounded px-2 py-1"
                            />
                          </div>
                        )}
                        {modalType === "destroy" && (
                          <div>
                            <label className="text-[12px] mr-1">Đơn vị</label>
                            <input
                              type="number"
                              min="0"
                              value={stockQuantities[item.id]?.quantityPackages || 0}
                              onChange={(e) => handleStockQuantityChange(item.id, "quantityPackages", e.target.value)}
                              className="w-16 border rounded px-2 py-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-red-800 rounded hover:bg-white-400"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitStock}
                className="px-4 py-2 text-green-800 rounded hover:bg-white-400"
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ICONS IN HORIZONTAL ROW */}
      <motion.div
        className="fixed right-4 z-[1000] flex gap-2"
        style={{ bottom: "100px" }} // Fixed at bottom-100
      >
        <button
          onClick={handleDownloadReport}
          className="bg-white/10 backdrop-blur-md text-white rounded-full p-2 hover:bg-gray-200 transition-colors"
          title="Tải báo cáo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          onClick={isShiftIdValid ? () => { setModalType("import"); setIsModalOpen(true); } : undefined}
          className={`bg-white/10 backdrop-blur-md text-white rounded-full p-2 ${!isShiftIdValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-200 transition-colors"}`}
          title={isShiftIdValid ? "Nhập kho" : "Yêu cầu shiftId để nhập kho"}
          disabled={!isShiftIdValid}
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          onClick={isShiftIdValid ? () => { setModalType("destroy"); setIsModalOpen(true); } : undefined}
          className={`bg-white/10 backdrop-blur-md text-white rounded-full p-2 ${!isShiftIdValid ? "opacity-50 cursor-not-allowed" : "hover:bg-red-200 transition-colors"}`}
          title={isShiftIdValid ? "Xóa kho" : "Yêu cầu shiftId để xóa kho"}
          disabled={!isShiftIdValid}
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default CompleteOrder;