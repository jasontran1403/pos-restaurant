import { useState, useEffect } from "react";
import SwipeToConfirmSwap from "./SwipeToConfirmSwap";

const token = [
  {
    id: 1,
    symbol: "MCT",
    name: "Mapchain Token",
    price: localStorage.getItem("price"),
  },
  {
    id: 2,
    symbol: "USDT",
    name: "USDT-BEP20",
    price: localStorage.getItem("price"),
  },
  { id: 3, symbol: "TON", name: "TON Coin", price: localStorage.getItem("tonPrice") },
];

const SwapItem = (props) => {
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

  useEffect(() => {
    if (props.walletIndex < 8) {
      setSelectedToken(2);
    } else if (props.walletIndex == 8) {
      setSelectedToken(1);
    }
  }, []);

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

  const formatLargeNumber = (numberString) => {
    // Parse the input to ensure it's a number
    const number = parseFloat(numberString);

    // Format the number with commas and two decimal places
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    }).format(number);

    return formattedNumber;
  };

  const [selectedToken, setSelectedToken] = useState(token[0].id);

  const handleTokenChange = (e) => {
    setSelectedToken(e.target.value);
  };

  const getType = () => {
    if (props.walletIndex === 8) {
      if (selectedToken == 1) {
        return 1;
      } else if (selectedToken == 3) {
        return 8;
      }
      // usdt
    } else if (props.walletIndex === 1) {
      // mct
      if (selectedToken == 2) {
        return 7;
      } else {
        return 31;
      }
    } else if (props.walletIndex === 4) {
      // direct
      if (selectedToken == 2) {
        return 2;
      } else {
        return 32;
      }
    } else if (props.walletIndex === 5) {
      // binary
      if (selectedToken == 2) {
        return 3;
      } else {
        return 33;
      }
    } else if (props.walletIndex === 6) {
      // leader
      if (selectedToken == 2) {
        return 4;
      } else {
        return 34;
      }
    } else if (props.walletIndex === 7) {
      // pop
      if (selectedToken == 2) {
        return 5;
      } else {
        return 35;
      }
    } else if (props.walletIndex === 3) {
      // daily
      if (selectedToken == 2) {
        return 6;
      } else {
        return 36;
      }
    } else if (props.walletIndex === 15) {
      // ton
      if (selectedToken == 1) {
        return 15;
      } else {
        return 9;
      }
    } else if (props.walletIndex === 17) {
      // daily ton
      if (selectedToken == 1) {
        return 20;
      } else {
        return 14;
      }
    } else if (props.walletIndex === 18) {
      // direct ton
      if (selectedToken == 1) {
        return 16;
      } else {
        return 10;
      }
    } else if (props.walletIndex === 19) {
      // binary ton
      if (selectedToken == 1) {
        return 17;
      } else {
        return 11;
      }
    } else if (props.walletIndex === 20) {
      // leader ton
      if (selectedToken == 1) {
        return 18;
      } else {
        return 12;
      }
    } else if (props.walletIndex === 21) {
      // pop ton
      if (selectedToken == 1) {
        return 19;
      } else {
        return 13;
      }
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
        <label className="text-white text-[14px]" htmlFor="token">
          Token
        </label>
        <select
          className="bg-[#FFFFFFB2] outline-none text-black px-[20px] py-[7px] rounded-md w-full mt-2"
          id="token"
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
        >
          <option value="" disabled>
            Select a token
          </option>
          {token.map((item) => (
            <option
              key={item.id}
              value={item.id}
              disabled={props.currency === item.symbol}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="input-field">
        <label className="text-white text-[14px]" htmlFor="amount">
          Swap Amount
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
        <SwipeToConfirmSwap
          type={getType()}
          amount={amount}
          text={"Touch to swap"}
          handleSwipe={props.handleSwipe}
        />
      </div>
    </div>
  );
};

export default SwapItem;
