import React, { useState } from "react";
import { API_ENDPOINT } from "../constants";
import Axios from "axios";
import { toast } from "react-toastify";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    let data = JSON.stringify({
      "username": email,
      "password": password
    });

    let config = {
      method: 'post',
      url: `${API_ENDPOINT}shift/login-shift`,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420'
      },
      data: data
    };

    Axios.request(config)
      .then((response) => {
        if (response.data.status === 200) {
          localStorage.setItem("workerId", response.data.workerId);
          localStorage.setItem("displayName", response.data.message);
          localStorage.setItem("isFirstShift", response.data.firstShift);
          window.location.href = "/home";
        } else {
          toast.error(response.data.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      })
      .catch((error) => {
        toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white/30 backdrop-blur-md shadow-lg rounded-xl p-8 w-full max-w-md border border-white/50">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white/60"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white/60"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
