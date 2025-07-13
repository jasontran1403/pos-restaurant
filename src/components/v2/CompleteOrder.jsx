import React, { useState, useEffect } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const ITEMS_PER_PAGE = 5;

const CompleteOrder = () => {
  const [listOrders, setListOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ----------- Lấy dữ liệu ----------- */
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  function fetchOrders() {
    Axios.get(`${API_ENDPOINT}shift/order-completed`, {
      params: {
        page: currentPage - 1, // Spring Boot dùng page từ 0
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

  /* ----------- Helpers ----------- */
  const formatNumber = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
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

  return (
    <div className="space-y-4">
      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm theo mã đơn…"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset page khi search
        }}
        className="w-[95svw] sm:w-80 mx-auto block px-3 py-2 rounded-lg bg-white/20 backdrop-blur placeholder-white/70 text-white focus:outline-none"
      />

      {/* LIST */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {listOrders.map((order) => (
          <div
            key={order.orderId}
            className="w-[95svw] sm:w-full backdrop-blur-md bg-[#76807A80]/50
                       rounded-2xl shadow-md p-4 grid grid-cols-3 items-center
                       border border-white/10"
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
            <div className="text-right flex flex-col items-end">
              <span className="text-sm font-semibold bg-red-200 p-1 rounded text-green-600">
                {order.status}
              </span>
              <button
                onClick={() => toggleStatus(order.orderId, order.status)}
                className="mt-1 px-3 py-1 bg-white/20 hover:bg-white/30
                           text-white text-xs rounded-full transition"
              >
                Cập nhật
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
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
            className={`px-3 py-1 rounded ${
              p === currentPage
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
    </div>
  );
};

export default CompleteOrder;
