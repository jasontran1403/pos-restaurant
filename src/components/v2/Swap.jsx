import { useState, useEffect } from "react";
import Axios from "axios";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";
import SwipeToConfirmTransfer from "./SwipeToConfirmTransfer";
import { API_ENDPOINT } from "../../constants";
import SwipeToConfirmSwap from "./SwipeToConfirmSwap";
import { useAccessToken } from "../../components/AccessTokenContext";
import Chatbox from "./Chatbox";
import { MoonLoader } from "react-spinners";

const Swap = (props) => {
  const { accessToken } = useAccessToken();
  const [totalPages, setTotalPages] = useState(0); // Total pages of your table
  const [currentPage, setCurrentPage] = useState(1); // Default is first page
  const [listTransaction, setListTransaction] = useState([]);
  const pageSize = 5; // Số lượng bản ghi trên mỗi trang
  const [swapRate, setSwapRate] = useState(0.0);
  let [color] = useState("#42d7f5");
  const [isLoading, setLoading] = useState(false);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return; // Avoid going out of bounds
    setCurrentPage(pageNumber);
  };

  const formatNumber = (numberString) => {
    // Parse the input to ensure it's a number
    const number = parseFloat(numberString);

    // Format the number with commas and two decimal places
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);

    return formattedNumber;
  };

  const fetchBetHistory = async (page) => {
    if (!accessToken || accessToken === "" || isLoading) return;
    try {
      setLoading(true);
      const response = await Axios.get(
        `${API_ENDPOINT}management/transaction-history/${localStorage.getItem(
          "walletAddress"
        )}/9`,
        {
          params: {
            page: page - 1, // Spring Boot Pageable bắt đầu từ 0
            size: pageSize,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      setListTransaction(response.data.content);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bet history:", error);
      setLoading(false);
    }
  };

  const handleTrimString = (stringInput) => {
    return stringInput.substring(0, 5) + "..." + stringInput.slice(-5);
  };

  useEffect(() => {
    fetchBetHistory(currentPage);
  }, [currentPage]);

  const [amount, setAmount] = useState(0);
  const [toWalletAddress, setToWalletAddress] = useState(0);

  return (
    <div className="animation-fadeIn">
      <div className="transaction-history">
      {isLoading ? <div className="spinner-transaction"><MoonLoader color={color} loading={isLoading} size={60} /></div> : <table className="w-full text-sm text-left rtl:text-right ">
          <thead className="text-xs text-white uppercase ">
            <tr>
              <th scope="col" className="px-2 py-3 text-left">
                Date
              </th>
              <th scope="col" className="px-2 py-3 text-center">
                Amount
              </th>
              <th scope="col" className="px-2 py-3 text-right">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {listTransaction.map((transaction, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-[#336a97] bg-opacity-[55%]"
                    : "bg-[#1d388b] bg-opacity-[51%]"
                }
              >
                <th
                  scope="row"
                  className="px-2 py-4 font-medium text-white whitespace-nowrap text-left"
                >
                  {(() => {
                    const utcTime = new Date(transaction.time);
                    utcTime.setHours(utcTime.getHours() - 7); // Trừ đi 7 tiếng để chuyển về UTC+0

                    return (
                      <>
                        <p>{utcTime.toLocaleTimeString()}</p>
                        <p>{utcTime.toLocaleDateString()}</p>
                      </>
                    );
                  })()}
                </th>
                <th scope="row" className="px-2 py-4 text-white text-center">
                  <p
                    className={
                      transaction.method === 0
                        ? "text-red-400"
                        : "text-green-500"
                    }
                  >
                    {formatNumber(transaction.amount)}
                    {transaction.currency}
                  </p>
                </th>
                <td className="px-2 py-4 text-right">
                  <p
                    className={
                      transaction.status === 0
                        ? "text-yellow-500"
                        : transaction.status === 1
                          ? "text-green-400"
                          : "text-red-400"
                    }
                  >
                    {transaction.status === 0
                      ? "Pending"
                      : transaction.status === 1
                        ? "Successed"
                        : "Canceled"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4">
                <div className="pagination-container flex justify-center items-center space-x-2 mt-[20px] mb-[10px]">
                  <button
                    className="prev-page px-4 py-2 border rounded-md"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>

                  {currentPage > 1 && (
                    <button
                      className="first-page px-4 py-2 border rounded-md"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  )}

                  {currentPage > 3 && <span className="dots">...</span>}

                  <span className="current-page px-4 py-2 border rounded-md text-white bg-[#083158]">
                    {currentPage}
                  </span>

                  {currentPage < totalPages - 2 && (
                    <span className="dots">...</span>
                  )}

                  {currentPage < totalPages && (
                    <button
                      className="last-page px-4 py-2 border rounded-md"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    className="next-page px-4 py-2 border rounded-md"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>}
      </div>
    </div>
  );
};

export default Swap;
