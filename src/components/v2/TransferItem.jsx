import { useState, useEffect } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";
import SwipeToConfirmTransfer from "./SwipeToConfirmTransfer";

const TransferItem = (props) => {
  const { accessToken } = useAccessToken();
  const walletTypesByCurrency = {
    MCT: [
      "Mapchain Token",
      "Mapchain Token Transfer",
      "MCT Daily Reward",
      "MCT Direct Commission",
      "MCT Binary Commission",
      "MCT Leader Commission",
      "MCT POP Commission",
    ],
    USDT: [
      "USDT-BEP20",
      "USDT-BEP20 Transfer",
      "Daily Reward",
      "Direct Commission",
      "Binary Commission",
      "Leader Commission",
      "POP Commission",
    ],
    TON: [
      "TON",
      "TON Transfer",
      "Ton Daily Reward",
      "Ton Direct Commission",
      "Ton Binary Commission",
      "Ton Leader Commission",
      "Ton POP Commission",
    ],
  };

  // Lấy danh sách ví dựa trên currency, mặc định là MCT nếu không khớp
  const walletTypes =
    walletTypesByCurrency[props.currency] || walletTypesByCurrency.MCT;

  // Lấy số lượng ví trong danh sách hiện tại
  const walletCount = walletTypes.length;

  // Lấy ví theo chỉ mục đúng vòng lặp
  const walletName = walletTypes[(props.walletIndex - 1) % walletCount];

  const [amount, setAmount] = useState(0);

  const formatNumber = (numberString) => {
    // Parse the input to ensure it's a number
    const number = parseFloat(numberString);

    // Format the number with commas and two decimal places
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);

    return formattedNumber;
  };

  const [displayNameReceiver, setDisplayNameReceiver] = useState("");

  const [walletReceive, setWalletReceive] = useState("");

  useEffect(() => {
    if (!walletReceive) return; // Không làm gì nếu walletReceive rỗng
    setDisplayNameReceiver("Loading display name");
    const delay = setTimeout(() => {
      // Gọi API lấy displayNameReceiver
      fetchDisplayName(walletReceive);
    }, 1800); // Delay 1.8s

    return () => clearTimeout(delay); // Hủy timeout nếu walletReceive thay đổi trước 1.8s
  }, [walletReceive]);

  const fetchDisplayName = async (address) => {
    try {
      const response = await Axios.get(
        `${API_ENDPOINT}management/get-display-name/${address}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      setDisplayNameReceiver(response.data);
    } catch (error) {
      console.error("Error fetching bet history:", error);
    }
  };

  return (
    <div className="animation-fadeIn show">
      <div className="input-field">
        <label className="text-white text-[14px]" htmlFor="amount">
          {walletName} Balance
        </label>
        <input
          className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
          type="text" // Đổi từ "number" sang "text" để tránh trình duyệt tự động chặn dấu chấm
          id="amount"
          value={`${formatNumber(props.balance)} ${props.currency}`}
          readOnly
        />
      </div>

      <div className="input-field">
        <label className="text-white text-[14px]" htmlFor="amount">
          Wallet Receive
        </label>
        <input
          className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
          type="text" // Đổi từ "number" sang "text" để tránh trình duyệt tự động chặn dấu chấm
          id="amount"
          value={walletReceive}
          onChange={(e) => setWalletReceive(e.target.value)}
          placeholder={"Enter internal wallet address receiver"}
        />
      </div>

      {walletReceive && displayNameReceiver && (
        <div className="input-field">
          <label className="text-white text-[14px]" htmlFor="amount">
            Display Name Receiver
          </label>
          <input
            className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
            type="text" // Đổi từ "number" sang "text" để tránh trình duyệt tự động chặn dấu chấm
            id="amount"
            value={displayNameReceiver}
            readOnly
          />
        </div>
      )}

      <div className="input-field">
        <label className="text-white text-[14px]" htmlFor="amount">
          Transfer amount
        </label>
        <input
          className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
          type="text"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="button-slide-to-confirm" style={{ marginTop: "10px" }}>
        <SwipeToConfirmTransfer
          text={"Touch to transfer"}
          to={walletReceive}
          amount={amount}
          walletTypeId={props.walletIndex}
          handleSwipe={props.handleSwipe}
        />
      </div>
    </div>
  );
};

export default TransferItem;
