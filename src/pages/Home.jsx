import React, { useState, useEffect, useContext, useRef } from "react";
import Axios from "axios";
import DotLoader from "react-spinners/DotLoader";
import SubNav from "../components/v2/SubNav";
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";
import Transaction from "../components/v2/Transaction";
import Account from "../components/v2/Account";
import Dashboard from "../components/v2/Dashboard";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WalletContext } from "../components/WalletContext";
import { API_ENDPOINT } from "../constants";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import { LogOut, DollarSign, LineChart } from "lucide-react";

const listDasNav = ["Trading", "Balance", "Account"];

const Home = () => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);
  const { isConnected } = useContext(WalletContext);

  const [showCashModal, setShowCashModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [note, setNote] = useState("");
  const noteInputRef = useRef(null);
  const [isCheckCash, setIsCheckCash] = useState(false);
  const [isCheckStock, setIsCheckStock] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [stockQuantities, setStockQuantities] = useState({});
  const [cashInputs, setCashInputs] = useState({
    500: 0,
    1000: 0,
    2000: 0,
    5000: 0,
    10000: 0,
    20000: 0,
    50000: 0,
    100000: 0,
    200000: 0,
    500000: 0,
    bankTransfer: 0,
  });
  const [activeTab, setActiveTab] = useState("Cash");

  const handleInputChange = (e, key) => {
    const val = parseInt(e.target.value) || 0;
    setCashInputs((prev) => ({ ...prev, [key]: val }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(cashInputs).forEach((key) => {
      if (key === "bankTransfer") {
        total += parseInt(cashInputs[key]) || 0;
      } else {
        total += parseInt(key) * (parseInt(cashInputs[key]) || 0);
      }
    });
    return total;
  };

  const [loading, setLoading] = useState(false);
  const [selectedDasTab, setSelectedDasTab] = useState("Trading");
  const [displayName, setDisplayName] = useState("");
  const [tradingItemView, setTradingItemView] = useState(1);
  const [currentTime, setCurrentTime] = useState("");
  const [isEnabled, setIsEnabled] = useState(localStorage.getItem("shiftId") ? true : false);

  useEffect(() => {
    if (localStorage.getItem("displayName")) {
      setDisplayName(localStorage.getItem("displayName"));
    }
    if (localStorage.getItem("isFirstShift") === "true") {
      setShowOpenShiftModal(true);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      setCurrentTime(`${hours}:${minutes}:${seconds} ${day}/${month}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showErrorModal && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [showErrorModal]);

  const performLogout = () => {
    localStorage.removeItem("displayName");
    localStorage.removeItem("shiftId");
    localStorage.removeItem("workerId");
    localStorage.removeItem("isFirstShift");
    window.location.href = "/";
  };

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

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleStockQuantityChange = (itemId, field, value) => {
    setStockQuantities((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleCheckStock = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId || isNaN(parseInt(shiftId))) {
      toast.error("Ca làm việc không hợp lệ. Vui lòng mở ca trước khi kiểm kho.");
      return;
    }

    if (menuItems.length === 0) {
      toast.error("Không có sản phẩm để kiểm kho.");
      return;
    }

    const stockItems = menuItems.map((item) => ({
      productId: parseInt(item.id),
      quantityStocks: parseInt(stockQuantities[item.id]?.quantityPackages || 0),
      quantityPackages: parseInt(stockQuantities[item.id]?.quantityStocks || 0),
    }));

    const data = {
      items: stockItems,
    };

    Axios.post(`${API_ENDPOINT}shift/check-stock/${parseInt(shiftId)}`, data, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((response) => {
        if (response.data === "Kiểm kho thành công.") {
          setIsCheckStock(true);
          setShowStockModal(false);
          Swal.fire({
            title: response.data,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: response.data,
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
          setShowStockModal(false);
          setIsCheckStock(true);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi kiểm kho");
      });
  };

  const handleForceCloseShift = () => {
    const data = JSON.stringify({
      shiftId: parseInt(localStorage.getItem("shiftId")),
      note: note,
    });

    const config = {
      method: "post",
      url: `${API_ENDPOINT}shift/force-close-shift`,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then(() => {
        setShowErrorModal(false);
        performLogout();
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi cố gắng đóng ca!");
      });
  };

  const handleDisconnect = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId) {
      performLogout();
      return;
    }

    console.log("Checking if can close shift...");

    let config = {
      method: "get",
      url: `${API_ENDPOINT}shift/can-close-shift/${parseInt(shiftId)}`,
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "Đã hoàn thành ca.") {
          performLogout();
        } else {
          setErrorMessage(response.data.message || "Không thể kết thúc ca do có đơn hàng chưa hoàn thành");
          setShowErrorModal(true);
        }
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage(error.response?.data?.message || "Đã xảy ra lỗi khi kiểm tra trạng thái ca làm việc");
        setShowErrorModal(true);
      });
  };

  const handleOpenShift = () => {
    if (multiTabDetect) {
      toast.error("You are in multi-tab mode. Please close other tabs to open a shift.");
      return;
    }

    if (localStorage.getItem("shiftId")) {
      toast.error("Đã có ca làm việc hiện tại, không thể mở ca mới.");
      return;
    }

    setShowOpenShiftModal(true);
  };

  const handleConfirmOpenShift = () => {
    const workerId = localStorage.getItem("workerId");
    if (!workerId || isNaN(parseInt(workerId))) {
      toast.error("ID nhân viên không hợp lệ. Vui lòng đăng nhập lại.");
      setShowOpenShiftModal(false);
      return;
    }

    // Validate Cash tab
    const hasCashInput = Object.values(cashInputs).some((value) => value > 0);
    if (!hasCashInput) {
      toast.error("Vui lòng nhập số tiền mặt trước khi mở ca.");
      return;
    }

    // Validate Stocks tab
    const hasStockInput = menuItems.some((item) =>
      stockQuantities[item.id]?.quantityStocks > 0 || stockQuantities[item.id]?.quantityPackages > 0
    );
    if (!hasStockInput) {
      toast.error("Vui lòng nhập số lượng kho trước khi mở ca.");
      return;
    }

    const totalAmount = calculateTotal();
    const stockItems = menuItems.map((item) => ({
      productId: parseInt(item.id),
      quantityStocks: parseInt(stockQuantities[item.id]?.quantityPackages || 0),
      quantityPackages: parseInt(stockQuantities[item.id]?.quantityStocks || 0),
    }));

    const cashDetails = Object.keys(cashInputs)
      .filter((key) => key !== "bankTransfer" && cashInputs[key] > 0)
      .map((key) => ({
        denomination: parseInt(key),
        quantity: parseInt(cashInputs[key]),
      }));

    const data = JSON.stringify({
      workerId: parseInt(workerId),
      totalAmount,
      stocks: { items: stockItems },
      cashDetails,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}shift/open-shift`,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        console.log("Open shift response:", response.data);
        if (response.data.message === "Bắt đầu ca mới và nhập kho đầu ngày thành công.") {
          toast.success("Bắt đầu ca mới và nhập kho thành công.");
          localStorage.setItem("shiftId", response.data.shiftId);
          localStorage.setItem("isFirstShift", false);
          setIsEnabled(true);
          setIsCheckCash(false);
          setIsCheckStock(false);
          setShowOpenShiftModal(false);
          setCashInputs({
            500: 0,
            1000: 0,
            2000: 0,
            5000: 0,
            10000: 0,
            20000: 0,
            50000: 0,
            100000: 0,
            200000: 0,
            500000: 0,
            bankTransfer: 0,
          });
          setStockQuantities({});
        } else {
          toast.error(response.data || "Mở ca thất bại");
        }
      })
      .catch((error) => {
        console.error("Open shift error:", error.response?.data);
        toast.error(error.response?.data || "Đã xảy ra lỗi khi mở ca làm việc");
      });
  };

  const handleCheckCash = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId) {
      toast.error("Bạn cần bắt đầu ca làm việc trước khi kiểm tiền.");
      return;
    }

    setShowCashModal(false);
    let data = JSON.stringify({
      totalAmount: calculateTotal() - cashInputs.bankTransfer,
      amountBank: cashInputs.bankTransfer,
      note: note,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}shift/check-cash/${parseInt(shiftId)}`,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "Tiền kiểm đếm thành công.") {
          setIsCheckCash(true);
          Swal.fire({
            title: response.data,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: response.data,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi kiểm tiền");
      });
  };

  const changeShowViewTrading = (id) => {
    setTradingItemView(id);
  };

  const handleTabClick = (tabName) => {
    setSelectedDasTab(tabName);
  };

  const ref = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="page-container-2">
        <DotLoader color="#36d7b7" loading={loading} size={50} />
      </div>
    );
  }

  const canLogout = isCheckCash && isCheckStock;

  return (
    <div className="page-container">
      {/* Top Container */}
      <div ref={ref} className={`cover-2 ${scrolled ? "scrolled" : ""}`}>
        <div className="info-container">
          {isConnected && (
            <div className="info-wallet">
              <div className="balance-info pb-[10px] pt-[10px] flex items-center justify-between">
                {/* LEFT TEXT */}
                <div className="usdt text-left">
                  <span className="text-[14px] italic leading-tight">
                    {displayName}
                    <br />
                    {currentTime}
                  </span>
                </div>

                {/* RIGHT BUTTONS */}
                <div className="relative flex flex-row gap-2 h-[48px]">
                  <button
                    onClick={handleOpenShift}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-[15px]"
                  >
                    <LogOut size={20} />
                  </button>

                  <button
                    onClick={handleDisconnect}
                    disabled={!canLogout}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition text-[15px] ${canLogout
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                  >
                    <LogOut size={20} />
                  </button>

                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition text-[15px] ${isEnabled
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    disabled={!isEnabled}
                    onClick={() => {
                      setShowCashModal(true);
                      setShowStockModal(false);
                    }}
                  >
                    <DollarSign size={20} />
                  </button>

                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition text-[15px] ${isEnabled
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    disabled={!isEnabled}
                    onClick={() => {
                      setShowStockModal(true);
                      setShowCashModal(false);
                    }}
                  >
                    <LineChart size={20} />
                  </button>
                </div>
              </div>

              {selectedDasTab === "Trading" && (
                <div className="animation-fadeIn transaction-btn">
                  <button
                    className={tradingItemView === 1 ? "glow" : ""}
                    onClick={() => changeShowViewTrading(1)}
                  >
                    All
                  </button>
                  <button
                    className={tradingItemView === 2 ? "glow" : ""}
                    onClick={() => changeShowViewTrading(2)}
                  >
                    10%
                  </button>
                  <button
                    className={tradingItemView === 3 ? "glow" : ""}
                    onClick={() => changeShowViewTrading(3)}
                  >
                    20%
                  </button>
                  <button
                    className={tradingItemView === 4 ? "glow" : ""}
                    onClick={() => changeShowViewTrading(4)}
                  >
                    25%
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <>
        {selectedDasTab === "Balance" && <Transaction handleTabClick={handleTabClick} />}

        {selectedDasTab === "Trading" && (
          <Dashboard enableShift={isEnabled} tradingItemView={tradingItemView} />
        )}

        {selectedDasTab === "Account" && <Account />}

        <div className="cover">
          <SubNav
            listNav={listDasNav}
            selectedTab={selectedDasTab}
            handleTabClick={handleTabClick}
            type={2}
          />
        </div>
      </>

      {/* Open Shift Modal */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 mt-[40px]">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md shadow-xl space-y-4 relative">
            <h2 className="text-xl font-semibold mb-2 text-center">Mở ca làm việc</h2>
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 text-center ${activeTab === "Cash"
                    ? "border-b-2 border-green-500 font-semibold text-black"
                    : "text-gray-600 hover:text-black"
                  }`}
                onClick={() => setActiveTab("Cash")}
              >
                Tiền mặt
              </button>
              <button
                className={`flex-1 py-2 text-center ${activeTab === "Stocks"
                    ? "border-b-2 border-green-500 font-semibold text-black"
                    : "text-gray-600 hover:text-black"
                  }`}
                onClick={() => setActiveTab("Stocks")}
              >
                Kho
              </button>
            </div>
            {/* Tab Content */}
            {activeTab === "Cash" && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map((denom) => (
                  <div key={denom} className="flex items-center justify-between">
                    <label>{denom.toLocaleString()}đ</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-20"
                      value={cashInputs[denom]}
                      onChange={(e) => handleInputChange(e, denom)}
                    />
                  </div>
                ))}
                <div className="col-span-2 text-center mt-4 text-lg font-bold">
                  Tổng tiền: {calculateTotal().toLocaleString()} đ
                </div>
              </div>
            )}
            {activeTab === "Stocks" && (
              <div className="max-h-[30svh] overflow-y-auto">
                {menuItems.length === 0 ? (
                  <p className="text-center text-gray-500">Không có sản phẩm để nhập kho.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <span className="flex-1 text-[12px]">{item.name}</span>
                        <div className="flex gap-2">
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setShowOpenShiftModal(false);
                  setCashInputs({
                    500: 0,
                    1000: 0,
                    2000: 0,
                    5000: 0,
                    10000: 0,
                    20000: 0,
                    50000: 0,
                    100000: 0,
                    200000: 0,
                    500000: 0,
                    bankTransfer: 0,
                  });
                  setStockQuantities({});
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOpenShift}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Xác nhận mở ca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Modal */}
      {showCashModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-[40px]">
          <div className="bg-white rounded-xl p-3 w-[90%] max-w-md shadow-xl space-y-4 relative">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map((denom) => (
                <div key={denom} className="flex items-center justify-between">
                  <label>{denom.toLocaleString()}đ</label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20"
                    value={cashInputs[denom]}
                    onChange={(e) => handleInputChange(e, denom)}
                  />
                </div>
              ))}
              <div className="col-span-2 flex items-center justify-between mt-2">
                <label>Chuyển khoản</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-32"
                  value={cashInputs.bankTransfer}
                  onChange={(e) => handleInputChange(e, "bankTransfer")}
                />
              </div>
              <div className="col-span-2 flex items-center justify-between mt-2">
                <label>Ghi chú</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-32"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <div className="text-center mt-4 text-lg font-bold">
              Tổng tiền: {calculateTotal().toLocaleString()} đ
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowCashModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckCash}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-semibold text-red-600 mb-2 text-center">Lỗi</h2>
            <p className="text-center">{errorMessage}</p>
            <div className="mt-4">
              <label className="block mb-2">Nhập lý do (bắt buộc):</label>
              <input
                ref={noteInputRef}
                type="text"
                className="w-full border rounded px-3 py-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do buộc kết thúc ca..."
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleForceCloseShift}
                disabled={!note.trim()}
                className={`px-4 py-2 rounded ${!note.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
              >
                Xác nhận đóng ca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 flex items-start justify-center z-50 mt-[120px]">
          <div className="bg-white rounded-xl p-2 w-[90%] max-w-2xl shadow-xl flex flex-col h-[55svh] overflow-hidden">
            {/* LIST */}
            {menuItems.length === 0 ? (
              <p className="text-center text-gray-500 flex-1 flex items-center justify-center">
                Không có sản phẩm để kiểm kho.
              </p>
            ) : (
              <div className="flex-1 max-h-[42svh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border-b gap-2">
                      <span className="flex-1">{item.name}</span>
                      <div className="flex gap-2">
                        <div>
                          <label className="text-xs">Bịch</label>
                          <input
                            type="number"
                            min="0"
                            value={stockQuantities[item.id]?.quantityStocks || 0}
                            onChange={(e) => handleStockQuantityChange(item.id, "quantityStocks", e.target.value)}
                            className="w-16 border rounded px-2 py-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs">Đơn vị</label>
                          <input
                            type="number"
                            min="0"
                            value={stockQuantities[item.id]?.quantityPackages || 0}
                            onChange={(e) => handleStockQuantityChange(item.id, "quantityPackages", e.target.value)}
                            className="w-16 border rounded px-2 py-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-between pt-10">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckStock}
                disabled={menuItems.length === 0}
                className={`px-4 py-2 rounded ${menuItems.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                Xác nhận kiểm kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;