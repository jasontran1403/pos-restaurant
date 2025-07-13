import { useState, useEffect } from "react";
import SwipeToConfirmWithdraw from "./SwipeToConfirmWithdraw";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import { useAccessToken } from "../../components/AccessTokenContext";

const WithdrawItem = (props) => {
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

  const [usdtWallet, setUsdtWallet] = useState("");
  const [tonWallet, setTonWallet] = useState("");
 
  useEffect(() => {
      let config = {
        method: 'get',
        url: `${API_ENDPOINT}management/get-withdraw-wallet/${localStorage.getItem("walletAddress")}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      };
  
      Axios.request(config)
        .then((response) => {
          setUsdtWallet(response.data.usdtbep20);
          setTonWallet(response.data.ton);
        })
        .catch((error) => {
          console.log(error);
        });
  
    }, []);

  const getType = () => {
    if (props.walletIndex === 8) {
      // usdt
      return 1;
    } else if (props.walletIndex === 1) {
      // mct
      return 2;
    } else if (props.walletIndex === 4) {
      // direct
      return 3;
    } else if (props.walletIndex === 5) {
      // binary
      return 4;
    } else if (props.walletIndex === 6) {
      // leader
      return 5;
    } else if (props.walletIndex === 7) {
      // pop
      return 6;
    } else if (props.walletIndex === 3) {
      // daily
      return 7;
    } else if (props.walletIndex === 15) {
      // ton
      return 8;
    } else if (props.walletIndex === 17) {
      // daily ton
      return 9;
    } else if (props.walletIndex === 18) {
      // direct ton
      return 10;
    } else if (props.walletIndex === 19) {
      // binar yton
      return 11;
    } else if (props.walletIndex === 20) {
      // leader ton
      return 12;
    } else if (props.walletIndex === 21) {
      // pop ton
      return 13;
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
          value={
            props.walletIndex === 8
              ? usdtWallet
                ? usdtWallet
                : "Your account has not been verified."
              : tonWallet
              ? tonWallet
              : "Your account has not been verified."
          }
          readOnly
        />
      </div>

      <div className="input-field">
        <label className="text-white text-[14px]" htmlFor="amount">
          Withdraw amount
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
        <SwipeToConfirmWithdraw
          amount={amount}
          toWallet={
            props.walletIndex === 8
              ? usdtWallet
              : tonWallet
          }
          type={getType()}
          text={"Touch to withdraw"}
          handleSwipe={props.handleSwipe}
        />
      </div>
    </div>
  );
};

export default WithdrawItem;
