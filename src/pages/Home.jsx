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
import { LogOut } from "lucide-react";

const listDasNav = ["Trading", "Balance", "Account"];

const Home = () => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);
  const { isConnected } = useContext(WalletContext);
  const [isExtendedCate, setIsExtendedCate] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showInitialStockModal, setShowInitialStockModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [note, setNote] = useState("");
  const noteInputRef = useRef(null);
  const [isCheckCash, setIsCheckCash] = useState(false);
  const [isCheckStock, setIsCheckStock] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [stockQuantities, setStockQuantities] = useState({});

  useEffect(() => {
    const workerIdStr = localStorage.getItem("workerId");

    const workerId = parseInt(workerIdStr, 10);

    if (!isNaN(workerId)) {
      if ([1, 2, 8].includes(workerId)) {
        setIsExtendedCate(true);
      }
    }
  }, []);

  const [inputTouched, setInputTouched] = useState({
    cash: {},
    stocks: {},
  });
  const [inputFocus, setInputFocus] = useState({
    cash: {},
    stocks: {},
  });
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
  const [loading, setLoading] = useState(false);
  const [selectedDasTab, setSelectedDasTab] = useState("Trading");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tradingItemView, setTradingItemView] = useState(1);
  const [currentTime, setCurrentTime] = useState("");
  const [isEnabled, setIsEnabled] = useState(localStorage.getItem("shiftId") ? true : false);
  const [isFirstShift, setIsFirstShift] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e, key) => {
    const value = e.target.value;
    const processedValue = value.startsWith("0") && value.length > 1 ? value.substring(1) : value;
    const val = parseInt(processedValue) || 0;
    setCashInputs((prev) => ({ ...prev, [key]: val }));
  };

  const handleStockQuantityChange = (itemId, field, value) => {
    const processedValue = value.startsWith("0") && value.length > 1 ? value.substring(1) : value;
    const parsedValue = processedValue === "" ? 0 : parseInt(processedValue) || 0;
    setStockQuantities((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: parsedValue,
      },
    }));
  };

  const handleInputFocus = (type, key) => {
    setInputFocus((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: true },
    }));
  };

  const handleInputBlur = (type, key) => {
    setInputFocus((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: false },
    }));
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

  const resetStockAndCash = () => {
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
    const initialQuantities = {};
    menuItems.forEach((item) => {
      initialQuantities[item.id] = { quantityStocks: 0, quantityPackages: 0 };
    });
    setStockQuantities(initialQuantities);
    setNote("");
  };

  useEffect(() => {
    if (localStorage.getItem("displayName")) {
      setDisplayName(localStorage.getItem("displayName"));
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

  useEffect(() => {
    // Reset stock quantities when isFirstShift changes
    if (!isFirstShift) {
      const initialQuantities = {};
      menuItems.forEach((item) => {
        initialQuantities[item.id] = { quantityStocks: 0, quantityPackages: 0 };
      });
      setStockQuantities(initialQuantities);
    }
  }, [isFirstShift, menuItems]);

  const performLogout = () => {
    if (isEnabled) {
      toast.error("Đang trong ca, không thể thoát khi chưa đóng ca.");
      return;
    }
    localStorage.removeItem("displayName");
    localStorage.removeItem("shiftId");
    localStorage.removeItem("workerId");
    localStorage.removeItem("isFirstShift");
    localStorage.removeItem("lastVisit");
    window.location.href = "/";
  };

  const fetchMenuItems = () => {
    Axios.get(`${API_ENDPOINT}shift/menu/0/${localStorage.getItem("workerId")}`, {
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

  const handleCheckCashAndStock = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId || isNaN(parseInt(shiftId))) {
      toast.error("Ca làm việc không hợp lệ. Vui lòng mở ca trước khi kiểm.");
      return;
    }
    setIsSubmitting(true);
    const stockItems = menuItems.map((item) => ({
      productId: parseInt(item.id),
      quantityPackages: parseInt(stockQuantities[item.id]?.quantityStocks || 0),
      quantityStocks: parseInt(stockQuantities[item.id]?.quantityPackages || 0),
    }));
    const cashDetails = Object.keys(cashInputs)
      .filter((key) => key !== "bankTransfer" && cashInputs[key] > 0)
      .map((key) => ({
        denomination: parseInt(key),
        quantity: parseInt(cashInputs[key]),
      }));
    const data = JSON.stringify({
      totalAmount: calculateTotal() - (cashInputs.bankTransfer || 0),
      amountBank: cashInputs.bankTransfer || 0,
      note: note,
      items: stockItems,
    });
    Axios.post(`${API_ENDPOINT}shift/check-cash-and-stock/${parseInt(shiftId)}`, data, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then((response) => {
        if (response.data === "Kiểm tiền và kiểm kho thành công.") {
          setIsCheckCash(true);
          setIsCheckStock(true);
          setShowCloseShiftModal(false);
          setIsEnabled(false);
          localStorage.removeItem("shiftId");
          localStorage.removeItem("isFirstShift");
          setFullName("");
          resetStockAndCash();
          Swal.fire({
            title: "Kết ca thành công",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            title: response.data,
            icon: "warning",
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi kiểm tra");
      }).finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleForceCloseShift = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId) {
      toast.error("Không có ca làm việc để đóng.");
      return;
    }
    const data = JSON.stringify({
      shiftId: parseInt(shiftId),
      note: note,
    });
    Axios.post(`${API_ENDPOINT}shift/force-close-shift`, data, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    })
      .then(() => {
        setShowErrorModal(false);
        setIsEnabled(false);
        localStorage.removeItem("shiftId");
        localStorage.removeItem("isFirstShift");
        resetStockAndCash();
        toast.success("Đã đóng ca thành công", {
          onClose: () => {
            window.location.reload();
          },
          autoClose: 1200,
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi cố gắng đóng ca!");
      });
  };

  const handleDisconnect = () => {
    const shiftId = localStorage.getItem("shiftId");
    if (!shiftId) {
      toast.error("Vui lòng mở ca làm việc trước khi đóng ca.");
      setShowInitialStockModal(true);
      return;
    }
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
          setIsEnabled(false);
          localStorage.removeItem("shiftId");
          localStorage.removeItem("isFirstShift");
          resetStockAndCash();
          toast.success("Đã đóng ca thành công", {
            onClose: () => {
              window.location.reload();
            },
            autoClose: 1200,
          });
        } else {
          setErrorMessage(response.data || "Chưa hoàn tất việc kiểm kho hoặc kiểm tiền.");
          setShowCloseShiftModal(true);
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
    setActiveTab("Cash");
    setShowOpenShiftModal(true);
  };

  const handleConfirmOpenShift = () => {
    if (multiTabDetect) {
      toast.error("You are in multi-tab mode. Please close other tabs to open a shift.");
      return;
    }
    const workerId = localStorage.getItem("workerId");
    if (!workerId || isNaN(parseInt(workerId))) {
      toast.error("ID nhân viên không hợp lệ. Vui lòng đăng nhập lại.");
      setShowOpenShiftModal(false);
      return;
    }
    const hasCashInput = Object.values(cashInputs).some((value) => value > 0);
    if (!hasCashInput) {
      toast.error("Vui lòng nhập số tiền mặt trước khi mở ca.");
      return;
    }
    if (fullName === "") {
      toast.error("Vui lòng nhập tên nhân viên.");
      return;
    }

    if (isFirstShift) {
      const allStocksZero = menuItems.every(
        (item) =>
          (stockQuantities[item.id]?.quantityStocks || 0) === 0 &&
          (stockQuantities[item.id]?.quantityPackages || 0) === 0
      );
      if (allStocksZero) {
        toast.error("Ca đầu ngày bắt buộc nhập dữ liệu kho.");
        setActiveTab("Stocks");
        return;
      }
    }

    setIsSubmitting(true);
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
      fullName: fullName,
      totalAmount,
      source: localStorage.getItem("newHome") == 0 ? 0 : 1,
      stocks: isFirstShift ? { items: stockItems } : { items: [] },
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
        if (response.data.message === "Bắt đầu ca mới và nhập kho đầu ngày thành công." || response.data.message === "") {
          toast.success("Đã bắt đầu ca");
          localStorage.setItem("shiftId", response.data.shiftId);
          localStorage.setItem("isFirstShift", isFirstShift);
          localStorage.setItem("displayName", response.data.fullName);
          setDisplayName(response.data.fullName);
          setIsEnabled(true);
          setIsCheckCash(false);
          setIsCheckStock(false);
          setShowOpenShiftModal(false);
          resetStockAndCash();
        } else {
          toast.error(response.data || "Mở ca thất bại");
        }
      })
      .catch((error) => {
        console.error("Open shift error:", error.response?.data);
        toast.error(error.response?.data || "Đã xảy ra lỗi khi mở ca làm việc");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleConfirmInitialStock = () => {
    if (multiTabDetect) {
      toast.error("You are in multi-tab mode. Please close other tabs to open a shift.");
      return;
    }
    const workerId = localStorage.getItem("workerId");
    if (!workerId || isNaN(parseInt(workerId))) {
      toast.error("ID nhân viên không hợp lệ. Vui lòng đăng nhập lại.");
      setShowInitialStockModal(false);
      return;
    }
    const hasCashInput = Object.values(cashInputs).some((value) => value > 0);
    if (!hasCashInput) {
      toast.error("Vui lòng nhập số tiền mặt trước khi mở ca.");
      return;
    }
    if (fullName === "") {
      toast.error("Vui lòng nhập tên nhân viên.");
      return;
    }
    setIsSubmitting(true);
    const totalAmount = calculateTotal();
    const stockItems = menuItems.map((item) => ({
      productId: parseInt(item.id),
      quantityStocks: parseInt(stockQuantities[item.id]?.quantityPackages || 0),
      quantityPackages: parseInt(stockQuantities[item.id]?.quantityStocks || 0),
    }));
    const data = JSON.stringify({
      workerId: parseInt(workerId),
      fullName: fullName || "Nhân viên",
      totalAmount,
      source: localStorage.getItem("newHome") == 0 ? 0 : 1,
      stocks: isFirstShift ? { items: stockItems } : { items: [] },
      cashDetails: Object.keys(cashInputs)
        .filter((key) => key !== "bankTransfer" && cashInputs[key] > 0)
        .map((key) => ({
          denomination: parseInt(key),
          quantity: parseInt(cashInputs[key]),
        })),
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
        if (response.data.message === "Bắt đầu ca mới và nhập kho đầu ngày thành công.") {
          toast.success("Bắt đầu ca mới và nhập kho thành công.");
          localStorage.setItem("shiftId", response.data.shiftId);
          localStorage.setItem("isFirstShift", isFirstShift);
          localStorage.setItem("displayName", response.data.fullName);
          setDisplayName(response.data.fullName);
          setIsEnabled(true);
          setIsCheckCash(false);
          setIsCheckStock(false);
          setShowInitialStockModal(false);
          resetStockAndCash();
        } else {
          toast.error(response.data || "Mở ca thất bại");
        }
      })
      .catch((error) => {
        console.error("Open shift error:", error.response?.data);
        toast.error(error.response?.data || "Đã xảy ra lỗi khi mở ca làm việc");
      })
      .finally(() => {
        setIsSubmitting(false);
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

  const resetNav = () => {
    changeShowViewTrading(1);
    setTradingItemView(1);
  };

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

  return (
    <div className="page-container">
      <div ref={ref} className={`cover-2 ${scrolled ? "scrolled" : ""}`}>
        <div className="info-container">
          {isConnected && (
            <div className="info-wallet">
              <div className="balance-info pb-[10px] pt-[10px] flex items-center justify-between">
                <div className="usdt text-left">
                  <span className="text-[14px] italic leading-tight">
                    {displayName}
                    <br />
                    {currentTime}
                  </span>
                </div>
                <div className="relative flex flex-row gap-2 h-[48px]">
                  {!isEnabled ? (
                    <button
                      onClick={handleOpenShift}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-[15px]"
                    >
                      Mở ca
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-[15px]"
                    >
                      Đóng ca
                    </button>
                  )}
                  <button
                    onClick={performLogout}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[15px] ${isEnabled
                      ? "bg-gray-300 text-gray-500"
                      : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    title={isEnabled ? "Đang trong ca, không thể thoát khi chưa đóng ca." : "Đăng xuất"}
                  >
                    <LogOut size={20} />
                    Thoát
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
                    100%
                  </button>
                  {isExtendedCate && <button
                    className={tradingItemView === 5 ? "glow" : ""}
                    onClick={() => changeShowViewTrading(5)}
                  >
                    Combo
                  </button>}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <>
        {selectedDasTab === "Balance" && <Transaction handleTabClick={handleTabClick} />}
        {selectedDasTab === "Trading" && (
          <Dashboard enableShift={isEnabled} tradingItemView={tradingItemView} resetNav={resetNav} />
        )}
        {selectedDasTab === "Account" && <Account />}
        <div className="cover mb-2">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-[40px]">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md shadow-xl space-y-4 relative">
            <h2 className="text-xl font-semibold mb-2 text-center">{isFirstShift ? "Mở ca đầu ngày" : "Mở ca mới"}</h2>
            <div className="flex items-center justify-center mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFirstShift}
                  onChange={(e) => setIsFirstShift(e.target.checked)}
                />
                <span>Ca đầu ngày</span>
              </label>
            </div>
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
            {activeTab === "Cash" && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map(
                  (denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <label>{denom.toLocaleString()}đ</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={inputFocus.cash[denom] && cashInputs[denom] === 0 ? "" : cashInputs[denom]}
                        onChange={(e) => handleInputChange(e, denom)}
                        onFocus={() => handleInputFocus("cash", denom)}
                        onBlur={() => handleInputBlur("cash", denom)}
                      />
                    </div>
                  )
                )}
                <div className="col-span-2 text-center mt-1 text-lg font-bold">
                  <label>Tên nhân viên</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-30"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                    {menuItems
                      .filter((item) => {
                        const name = item.name.toLowerCase().trim();
                        return (
                          name !== "double cheeseburger" &&
                          name !== "double chickenburger"
                        );
                      })
                      .map((item) => {
                        const name = item.name.toLowerCase().trim();
                        const showPackageInput = name === "bánh mỳ hotdogs" || name === "bánh mỳ hamburger";

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 border border-gray-100 rounded p-2"
                          >
                            <span className="flex-1 text-[12px]">{item.name}</span>

                            <div className="flex gap-2">
                              {/* --- Ô nhập Bịch --- */}
                              <div>
                                <label className="text-[12px] mr-1">Bịch</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    stockQuantities[item.id]?.quantityStocks === 0 &&
                                      inputFocus.stocks[`${item.id}-quantityStocks`]
                                      ? ""
                                      : stockQuantities[item.id]?.quantityStocks || 0
                                  }
                                  onChange={(e) =>
                                    handleStockQuantityChange(item.id, "quantityStocks", e.target.value)
                                  }
                                  className="w-16 border rounded px-2 py-1"
                                  onFocus={() => handleInputFocus("stocks", `${item.id}-quantityStocks`)}
                                  onBlur={() => {
                                    handleInputBlur("stocks", `${item.id}-quantityStocks`);
                                    if (!stockQuantities[item.id]?.quantityStocks) {
                                      handleStockQuantityChange(item.id, "quantityStocks", 0);
                                    }
                                  }}
                                  disabled={!isFirstShift}
                                />
                              </div>

                              {/* --- Ô nhập Đơn vị --- */}
                              {!showPackageInput && (
                                <div>
                                  <label className="text-[12px] mr-1">Đơn vị</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      stockQuantities[item.id]?.quantityPackages === 0 &&
                                        inputFocus.stocks[`${item.id}-quantityPackages`]
                                        ? ""
                                        : stockQuantities[item.id]?.quantityPackages || 0
                                    }
                                    onChange={(e) =>
                                      handleStockQuantityChange(item.id, "quantityPackages", e.target.value)
                                    }
                                    className="w-16 border rounded px-2 py-1"
                                    onFocus={() => handleInputFocus("stocks", `${item.id}-quantityPackages`)}
                                    onBlur={() => {
                                      handleInputBlur("stocks", `${item.id}-quantityPackages`);
                                      if (!stockQuantities[item.id]?.quantityPackages) {
                                        handleStockQuantityChange(item.id, "quantityPackages", 0);
                                      }
                                    }}
                                    disabled={!isFirstShift}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                  </div>
                )}
              </div>
            )}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setShowOpenShiftModal(false);
                  resetStockAndCash();
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmOpenShift}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded ${isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
              >
                Xác nhận mở ca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Stock Modal */}
      {showInitialStockModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-[40px]">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md shadow-xl space-y-4 relative">
            <h2 className="text-xl font-semibold mb-2 text-center">{isFirstShift ? "Mở ca đầu ngày" : "Mở ca mới"}</h2>
            <div className="flex items-center justify-center mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFirstShift}
                  onChange={(e) => setIsFirstShift(e.target.checked)}
                />
                <span>Ca đầu ngày</span>
              </label>
            </div>
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
            {activeTab === "Cash" && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map(
                  (denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <label>{denom.toLocaleString()}đ</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={inputFocus.cash[denom] && cashInputs[denom] === 0 ? "" : cashInputs[denom]}
                        onChange={(e) => handleInputChange(e, denom)}
                        onFocus={() => handleInputFocus("cash", denom)}
                        onBlur={() => handleInputBlur("cash", denom)}
                      />
                    </div>
                  )
                )}
                <div className="col-span-2 text-center mt-1 text-lg font-bold">
                  <label>Tên nhân viên</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-30"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                    {menuItems
                      .filter((item) => {
                        const name = item.name.toLowerCase().trim();
                        return (
                          name !== "double cheeseburger" &&
                          name !== "double chickenburger"
                        );
                      })
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="flex-1 text-[12px]">{item.name}</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[12px] mr-1">Bịch</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  stockQuantities[item.id]?.quantityStocks === 0 &&
                                    inputFocus.stocks[`${item.id}-quantityStocks`]
                                    ? ""
                                    : stockQuantities[item.id]?.quantityStocks || 0
                                }
                                onChange={(e) =>
                                  handleStockQuantityChange(item.id, "quantityStocks", e.target.value)
                                }
                                className="w-16 border rounded px-2 py-1"
                                onFocus={() => handleInputFocus("stocks", `${item.id}-quantityStocks`)}
                                onBlur={() => {
                                  handleInputBlur("stocks", `${item.id}-quantityStocks`);
                                  if (!stockQuantities[item.id]?.quantityStocks) {
                                    handleStockQuantityChange(item.id, "quantityStocks", 0);
                                  }
                                }}
                                disabled={!isFirstShift}
                              />
                            </div>
                            <div>
                              <label className="text-[12px] mr-1">Đơn vị</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  stockQuantities[item.id]?.quantityPackages === 0 &&
                                    inputFocus.stocks[`${item.id}-quantityPackages`]
                                    ? ""
                                    : stockQuantities[item.id]?.quantityPackages || 0
                                }
                                onChange={(e) =>
                                  handleStockQuantityChange(item.id, "quantityPackages", e.target.value)
                                }
                                className="w-16 border rounded px-2 py-1"
                                onFocus={() => handleInputFocus("stocks", `${item.id}-quantityPackages`)}
                                onBlur={() => {
                                  handleInputBlur("stocks", `${item.id}-quantityPackages`);
                                  if (!stockQuantities[item.id]?.quantityPackages) {
                                    handleStockQuantityChange(item.id, "quantityPackages", 0);
                                  }
                                }}
                                disabled={!isFirstShift}
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
                  setShowInitialStockModal(false);
                  resetStockAndCash();
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmInitialStock}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded ${isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
              >
                Xác nhận mở ca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-[40px]">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-md shadow-xl space-y-4 relative">
            <h2 className="text-xl font-semibold mb-2 text-center">Kết ca</h2>
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 text-center ${activeTab === "Cash"
                  ? "border-b-2 border-green-500 font-semibold text-black"
                  : "text-gray-600 hover:text-black"
                  }`}
                onClick={() => setActiveTab("Cash")}
              >
                Check Tiền
              </button>
              <button
                className={`flex-1 py-2 text-center ${activeTab === "Stocks"
                  ? "border-b-2 border-green-500 font-semibold text-black"
                  : "text-gray-600 hover:text-black"
                  }`}
                onClick={() => setActiveTab("Stocks")}
              >
                Check Kho
              </button>
            </div>
            {activeTab === "Cash" && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map(
                  (denom) => (
                    <div key={denom} className="flex items-center justify-between">
                      <label>{denom.toLocaleString()}đ</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={inputFocus.cash[denom] && cashInputs[denom] === 0 ? "" : cashInputs[denom]}
                        onChange={(e) => handleInputChange(e, denom)}
                        onFocus={() => handleInputFocus("cash", denom)}
                        onBlur={() => handleInputBlur("cash", denom)}
                      />
                    </div>
                  )
                )}
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
                <div className="col-span-2 text-center mt-4 text-lg font-bold">
                  Tổng tiền: {calculateTotal().toLocaleString()} đ
                </div>
              </div>
            )}
            {activeTab === "Stocks" && (
              <div className="max-h-[30svh] overflow-y-auto">
                {menuItems.length === 0 ? (
                  <p className="text-center text-gray-500">Không có sản phẩm để kiểm kho.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {menuItems
                      .filter((item) => {
                        const name = item.name.toLowerCase().trim();
                        return (
                          name !== "double cheeseburger" &&
                          name !== "double chickenburger"
                        );
                      })
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2">
                          <span className="flex-1 text-[12px]">{item.name}</span>
                          <div className="flex gap-2">
                            <div>
                              <label className="text-[12px] mr-1">Bịch</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  stockQuantities[item.id]?.quantityStocks === 0 &&
                                    inputFocus.stocks[`${item.id}-quantityStocks`]
                                    ? ""
                                    : stockQuantities[item.id]?.quantityStocks || 0
                                }
                                onChange={(e) =>
                                  handleStockQuantityChange(item.id, "quantityStocks", e.target.value)
                                }
                                className="w-16 border rounded px-2 py-1"
                                onFocus={() => handleInputFocus("stocks", `${item.id}-quantityStocks`)}
                                onBlur={() => {
                                  handleInputBlur("stocks", `${item.id}-quantityStocks`);
                                  if (!stockQuantities[item.id]?.quantityStocks) {
                                    handleStockQuantityChange(item.id, "quantityStocks", 0);
                                  }
                                }}
                              />
                            </div>
                            <div>
                              <label className="text-[12px] mr-1">Đơn vị</label>
                              <input
                                type="number"
                                min="0"
                                value={
                                  stockQuantities[item.id]?.quantityPackages === 0 &&
                                    inputFocus.stocks[`${item.id}-quantityPackages`]
                                    ? ""
                                    : stockQuantities[item.id]?.quantityPackages || 0
                                }
                                onChange={(e) =>
                                  handleStockQuantityChange(item.id, "quantityPackages", e.target.value)
                                }
                                className="w-16 border rounded px-2 py-1"
                                onFocus={() => handleInputFocus("stocks", `${item.id}-quantityPackages`)}
                                onBlur={() => {
                                  handleInputBlur("stocks", `${item.id}-quantityPackages`);
                                  if (!stockQuantities[item.id]?.quantityPackages) {
                                    handleStockQuantityChange(item.id, "quantityPackages", 0);
                                  }
                                }}
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
                  setShowCloseShiftModal(false);
                  resetStockAndCash();
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckCashAndStock}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded ${isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
              >
                Xác nhận kiểm tra
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
    </div>
  );
};

export default Home;