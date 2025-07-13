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


const ITEMS_PER_PAGE = 5;

const PendingOrder = ({ handleTabClick }) => {
  const [listOrders, setListOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ----------- Lấy dữ liệu ----------- */
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm]);

  function fetchOrders() {
    Axios.get(`${API_ENDPOINT}shift/order-pending`, {
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
            fetchOrders();
            Swal.fire({
              title: "Xóa đơn hàng thành công!",
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
            fetchOrders();
            Swal.fire({
              title: "Chuyển trạng thái đơn hàng thành công!",
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

  const handleEdit = (orderId) => {
    localStorage.setItem("orderId", orderId);
    // Chuyển sang tab Trading
    handleTabClick("Trading");
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
            <div className="text-right flex flex-col items-end gap-2">
              {/* Status */}
              <span className="text-sm font-semibold bg-red-200 px-2 py-1 rounded text-green-600">
                {order.status}
              </span>

              {/* ICONS */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleEdit(order.orderId)}
                  className="text-white hover:text-yellow-400 transition"
                  title="Chỉnh sửa"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(order.orderId)}
                  className="text-white hover:text-red-500 transition"
                  title="Xoá"
                >
                  <Trash2 size={18} />
                </button>

                <button
                  onClick={() => handleToggleStatus(order.orderId, "CASH")}
                  className="text-white hover:text-green-300 transition"
                  title="Chuyển về CASH"
                >
                  <DollarSign size={18} />
                </button>

                <button
                  onClick={() => handleToggleStatus(order.orderId, "BANK")}
                  className="text-white hover:text-blue-300 transition"
                  title="Chuyển về BANK"
                >
                  <CreditCard size={18} />
                </button>
              </div>
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
    </div>
  );
};

export default PendingOrder;
