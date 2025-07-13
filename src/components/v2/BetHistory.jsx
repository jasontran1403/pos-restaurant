import React, { useState, useEffect } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";
import SwipeToConfirmStake from "./SwipeToConfirmStake";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbox from "./Chatbox";

const networks = [
  { name: "Ton Network", tokens: ["Mapchain Token", "TON"] },
  { name: "Binance Smart Chain", tokens: ["USDT BEP20"] },
];

const packages = [
  { id: 1, name: "Starter", price: 200, daily: 0.2, maxout: 400 },
  { id: 2, name: "Bronze", price: 1000, daily: 0.33, maxout: 2000 },
  { id: 3, name: "Silver", price: 3000, daily: 0.37, maxout: 6000 },
  { id: 4, name: "Gold", price: 10000, daily: 0.4, maxout: 20000 },
  { id: 5, name: "Platinum", price: 30000, daily: 0.43, maxout: 60000 },
  { id: 6, name: "Diamond", price: 100000, daily: 0.5, maxout: 200000 },
];

const BetHistory = (props) => {
  const { accessToken } = useAccessToken();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const [selectedToken, setSelectedToken] = useState(networks[0].tokens[0]);
  const [mctBalance, setMctBalance] = useState(0);
  const [mctTransfer, setMctTransfer] = useState(0);
  const [usdt, setUsdt] = useState(0);
  const [ton, setTon] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [priceCurrency, setPriceCurrency] = useState("MCT");
  const [walletType, setWalletType] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0].name);
  const [amount, setAmount] = useState(0);
  const [listInvestment, setListInvestment] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(1);

  const formatNumber = (numberString) => {
    // Parse the input to ensure it's a number
    let number = parseFloat(numberString);
  
    // Cut off to 2 decimal places without rounding
    number = Math.trunc(number * 100) / 100;
  
    // Format with commas and exactly 2 decimal digits
    const formattedNumber = number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  
    return formattedNumber;
  };

  const getStatusText = (statusCode) => {
    if (statusCode == 0) return "Running";
    return "Completed";
  };

  const getStatusColor = (statusCode) => {
    if (statusCode == 0) return "text-green-400";
    return "text-red-400";
  };

  useEffect(() => {
    if (selectedToken === "Mapchain Token") {
      setCurrency("MCT");
      setAmount(mctBalance);
      setTransfer(mctTransfer);
      setPriceCurrency("MCT");
      setWalletType(1);
    } else if (selectedToken === "USDT BEP20") {
      setCurrency("MCT");
      setAmount(mctBalance);
      setTransfer(mctTransfer);
      setPriceCurrency("USDT");
      setWalletType(2);
    } else if (selectedToken === "TON") {
      setCurrency("TON");
      setAmount(ton);
      setPriceCurrency("TON");
      setWalletType(3);
    } else {
      setCurrency("");
      setAmount(0);
    }
  }, [selectedToken, mctBalance, mctTransfer, ton]);

  useEffect(() => {
    if (!accessToken || accessToken === "" || loading) return;

    // Fetch balance
    setLoading(true);
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/balance/${localStorage.getItem(
        "walletAddress"
      )}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setMctBalance(response.data.balances[1].balance);
        setMctTransfer(response.data.balances[6].balance);
        setUsdt(response.data.balances[0].balance);
        setTon(response.data.balances[12].balance);
        setAmount(response.data.balances[1].balance);
        setTransfer(response.data.balances[6].balance);
      })
      .finally(() => setLoading(false));

    // Fetch investments with pagination
    fetchInvestments(currentPage);
  }, [accessToken, currentPage]);

  const fetchInvestments = (page) => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/packages/${localStorage.getItem(
        "walletAddress"
      )}`,
      params: {
        page: page - 1, // assuming backend uses 0-based index
        size: pageSize,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setListInvestment(
          response.data.content || response.data.investments || []
        );
        setTotalPages(response.data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching investments:", error);
        toast.error("Failed to load investment history");
      });
  };

  const handleNetworkChange = (e) => {
    setSelectedNetwork(e.target.value);
    setSelectedToken(
      networks.find((n) => n.name === e.target.value)?.tokens[0] || ""
    );
  };

  const handlePackageChange = (e) => {
    setSelectedPackage(parseInt(e.target.value));
  };

  const [isProcess, setIsProcess] = useState(false);
  
  const handleStake = () => {
    if (!selectedToken || !selectedPackage) {
      toast.warning("Please select token and package");
      return;
    }

    if (isProcess) {
      return;
    }

    setIsProcess(true); // Ngăn chặn gọi API nhiều lần

    let data = JSON.stringify({
      packageId: selectedPackage,
      walletAddress: localStorage.getItem("walletAddress"),
      type: 1,
      walletType: walletType,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/invest`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "ok") {
          toast.success("Staking successful!", {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              fetchInvestments(1); // Refresh to first page
              setCurrentPage(1);
              window.location.reload();
              setIsProcess(false);
            },
          });
        } else {
          toast.error(response.data, {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              setIsProcess(false);
            }
          });
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Staking failed", {
          position: "top-right",
          autoClose: 1500,
          onClose: () => {
            setIsProcess(false);
          }
        });
      });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
      <>
        <p>{date.toLocaleTimeString()}</p>
        <p>{date.toLocaleDateString()}</p>
      </>
    );
  };

  return (
    <div className="animation-fadeIn">
      <div className="stake-container">
        {/* Network, Token and Package Selection */}
        <div className="input-field">
          <label className="text-white text-[14px]" htmlFor="network">
            Choose Network
          </label>
          <select
            className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
            id="network"
            value={selectedNetwork}
            onChange={handleNetworkChange}
          >
            {networks.map((network) => (
              <option key={network.name} value={network.name}>
                {network.name}
              </option>
            ))}
          </select>

          <div className="mt-3">
            <label className="text-white text-[14px]" htmlFor="token">
              Choose Token
            </label>
            <select
              className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
              id="token"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              {networks
                .find((network) => network.name === selectedNetwork)
                ?.tokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
            </select>
          </div>

          <label className="text-white text-[14px]" htmlFor="package">
            Choose Package
          </label>
          <select
            className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
            id="package"
            value={selectedPackage}
            onChange={handlePackageChange}
          >
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>

          {selectedPackage > 0 && (
            <>
              <label className="text-white text-[14px]" htmlFor="packageInfo">
                Package Info
              </label>
              <input
                className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
                type="text"
                value={
                  !selectedToken
                    ? "Please choose a token"
                    : `Price: ${formatNumber(
                        packages[selectedPackage - 1].price
                      )} ${priceCurrency} | Daily: ${formatNumber(
                        packages[selectedPackage - 1].daily
                      )}%`
                }
                readOnly
              />
            </>
          )}
          {selectedToken === "USDT BEP20" && (
            <>
              <label className="text-white text-[14px]" htmlFor="packageInfo">
                Price In MCT
              </label>
              <input
                className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
                type="text"
                value={`Estimated ~ ${formatNumber(packages[selectedPackage - 1].price / localStorage.getItem("price"))} MCT`}
                readOnly
              />
            </>
          )}
        </div>

        {/* Balance Display */}
        <div className="input-field">
          <label className="text-white text-[14px]" htmlFor="amount">
            Balance
          </label>
          <input
            className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px] rounded-md w-full"
            type="text"
            id="amount"
            value={`${formatNumber(amount)} ${currency}`}
            readOnly
          />
        </div>

        {(currency === "MCT" || currency === "USDT") && (
          <div className="input-field">
            <label className="text-white text-[14px]" htmlFor="transfer">
              Transfer Wallet
            </label>
            <input
              className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px] rounded-md w-full"
              type="text"
              id="transfer"
              value={`${formatNumber(transfer)} ${currency}`}
              readOnly
            />
          </div>
        )}

        {/* Stake Button */}
        <div className="button-slide-to-confirm mt-3">
          <SwipeToConfirmStake
            text={"Touch to stake"}
            handleSwipe={props.handleSwipe}
            handleStake={handleStake}
          />
        </div>
      </div>

      {/* Investment History Table */}
      <div className="transaction-history mt-5">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs text-white uppercase">
            <tr>
              <th scope="col" className="px-2 py-3 text-left">
                Date
              </th>
              <th scope="col" className="px-2 py-3 text-center">
                Package Info
              </th>
              <th scope="col" className="px-2 py-3 text-center">
                Maxout
              </th>
              <th scope="col" className="px-2 py-3 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {listInvestment.length > 0 ? (
              listInvestment.map((investment, index) => (
                <tr
                  key={investment.code || index}
                  className={
                    index % 2 === 0
                      ? "bg-[#071F0A] bg-opacity-[55%]"
                      : "bg-[#123E2A] bg-opacity-[51%]"
                  }
                >
                  <td className="px-2 py-4 text-white text-left">
                    {formatDate(investment.date)}
                  </td>
                  <td className="px-2 py-4 text-white text-center">
                    <p>
                      {formatNumber(investment.capital)}{" "}
                      {investment.type === 1
                        ? "MCT"
                        : investment.type === 2
                        ? "USDT"
                        : "TON"}
                    </p>
                    <p>{formatNumber(investment.daily)}%</p>
                  </td>
                  <td className="px-2 py-4 text-center">
                    {investment.type === 1
                      ? `${formatNumber(investment.maxout)} / ${investment.totalMaxout}`
                      : investment.type === 2
                      ? `${formatNumber(investment.maxout)} / ${investment.totalMaxout}`
                      : `${formatNumber(investment.maxout)} / ${investment.totalMaxout}`}
                    {investment.type === 1
                      ? " MCT"
                      : investment.type === 2
                      ? " USDT"
                      : " TON"}
                  </td>
                  <td className="px-2 py-4 text-right">
                    <p className={getStatusColor(investment.status)}>
                      {getStatusText(investment.status)}
                    </p>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-[#071F0A] bg-opacity-[55%]">
                <td colSpan="4" className="px-2 py-4 text-white text-center">
                  No investment history found
                </td>
              </tr>
            )}
          </tbody>
          {totalPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan="4">
                  <div className="pagination-container flex justify-center items-center space-x-2 mt-4 mb-2">
                    <button
                      className={`px-4 py-2 border rounded-md ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>

                    {currentPage > 1 && (
                      <button
                        className="px-4 py-2 border rounded-md"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    )}

                    {currentPage > 3 && <span className="px-2">...</span>}

                    {currentPage > 2 && (
                      <button
                        className="px-4 py-2 border rounded-md"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </button>
                    )}

                    <span className="px-4 py-2 border rounded-md text-white bg-[#083158]">
                      {currentPage}
                    </span>

                    {currentPage < totalPages - 1 && (
                      <button
                        className="px-4 py-2 border rounded-md"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </button>
                    )}

                    {currentPage < totalPages - 2 && (
                      <span className="px-2">...</span>
                    )}

                    {currentPage < totalPages && (
                      <button
                        className="px-4 py-2 border rounded-md"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      className={`px-4 py-2 border rounded-md ${
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default BetHistory;
