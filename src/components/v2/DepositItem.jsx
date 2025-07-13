import { useContext, useEffect, useState } from "react";
import SwipeToCreateDeposit from "./SwipeToCreateDeposit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Copy } from "react-bootstrap-icons";
import { MultiTabDetectContext } from "../../components/MultiTabDetectContext";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import SwipeToConfirmDeposit from "./SwipeToConfirmDeposit";

const DepositItem = (props) => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);
  const walletTypesByCurrency = {
    MCT: "Mapchain Token (Ton Network)",
    USDT: "USDT-BEP20 (Binance Smart Chain)",
    TON: "TON (Ton Network)",
  };

  const tonAddress = props.walletIndex != 8 ? localStorage.getItem("ton") : localStorage.getItem("bep20"); 

  const walletName = walletTypesByCurrency[props.currency] || "Unknown Wallet";

  const handleCopy = () => {
    navigator.clipboard.writeText(tonAddress).then(() => {
      toast.success("Copied to clipboard!", {
        position: "top-right",
        autoClose: 1500,
      });
    });
  };

  const [amount, setAmount] = useState("");

  const [showQr, setShowQr] = useState(false);

  const [countdown, setCountdown] = useState(30 * 60); // 6 phút
  const [minAmount, setMinAmount] = useState(0);

  useEffect(() => {
    if (!showQr) return; // Chỉ chạy đồng hồ khi showQr = true

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.reload(); // Reload khi countdown về 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup khi component unmount
  }, [showQr]);

  useState(() => {
    setMinAmount(5 / localStorage.getItem("price"));
  }, [localStorage.getItem("price")]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleShowQr = () => {
    handleCreateDeposit();
  };

  const [qrImage, setQrImage] = useState("");

  const handleSwipe = () => {
    if (action) return; // Prevent further clicks if action is already in progress

    setAction(true);
    if (transactionItemView === 3 && qr === false) {
      setTimeout(() => {
        setQr(true);
        setAction(false); // Re-enable clicks after the toast disappears
      }, 1000);
    } else {
      if (transactionItemView === 3) {
        setTimeout(() => {
          toast.success("Confirmed", {
            position: "top-left",
            autoClose: 1500,
            onClose: () => {
              if (transactionItemView === 3 && qr === true) {
                setQr(false);
              }
              if (selectedViewAccount > 1) {
                if (verifyShowView > 2) {
                  setVerifyShowView(1);
                } else {
                  setSelectedViewAccount(1);
                }
              }
              setAction(false); // Re-enable clicks after the toast disappears
            },
          });
        }, 1000);
      }
    }
  };

  const handleTrimString = (stringInput) => {
    return stringInput.substring(0, 5) + "..." + stringInput.slice(-5);
  };

  const handleCreateDeposit = () => {
    if (multiTabDetect) {
      toast.error(
        "Multiple instances detected, please close all others window and reload the page!",
        {
          position: "top-right",
          autoClose: 1500,
        }
      );
      return;
    }

    if (amount <= 0) {
      return;
    }

    if (props.walletIndex === 1) {
      if (amount < minAmount) {
        toast.error(
          `The minimum deposit amount is ${formatNumber(
            minAmount
          )} MCT. Any deposits below the minimum amount will result in the loss of your funds.`,
          {
            position: "top-right",
            autoClose: 1500,
          }
        );
        return;
      }
    } else if (props.walletIndex === 15) {
      if (amount < 10) {
        toast.error(
            `The minimum deposit amount is 10 TON. Any deposits below the minimum amount will result in the loss of your funds.`,
            {
              position: "top-right",
              autoClose: 1500,
            }
          );
          return;
      }
    } else {
      if (amount < 5) {
        toast.error(
            `The minimum deposit amount is 5 USDT. Any deposits below the minimum amount will result in the loss of your funds.`,
            {
              position: "top-right",
              autoClose: 1500,
            }
          );
          return;
      }
    }

    let data = JSON.stringify({
      walletAddress: localStorage.getItem("walletAddress"),
      amount: amount,
      method: props.walletIndex === 1 ? 2 : props.walletIndex === 8 ? 1 : 4,
      price: localStorage.getItem("price"),
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/generate-qr`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
      responseType: "blob",
    };

    Axios.request(config)
      .then((response) => {
        // Assuming response.data contains the image URL or base64 string
        const qrCodeBlob = response.data;
        const qrCodeUrl = URL.createObjectURL(qrCodeBlob);
        setQrImage(qrCodeUrl);
        toast.success("Created deposit order!", {
          position: "top-right",
          autoClose: 1500,
        });
        setShowQr((prev) => !prev);
      })
      .catch((error) => {
        toast.error("Please try again later", {
          position: "top-right",
          autoClose: 1500,
        });
      });
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

  return (
    <div className="animation-fadeIn">
      {!showQr && (
        <div className="show">
          <div className="input-field">
            <label className="text-white text-[14px]" htmlFor="network">
              Network
            </label>
            <input
              className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
              type="text"
              id="network"
              value={walletName}
              readOnly
            />
          </div>

          <div className="input-field">
            <label className="text-white text-[14px]" htmlFor="amount">
              Amount
            </label>
            <input
              className="bg-[#76807A80] outline-none text-white px-[20px] py-[7px]"
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter deposit amount"
            />
          </div>

          <div
            className="button-slide-to-confirm"
            style={{ marginTop: "10px" }}
          >
            <SwipeToCreateDeposit
              text={"Touch to create qr"}
              handleSwipe={props.handleSwipe}
              handleShowQr={handleShowQr}
            />
          </div>
        </div>
      )}

      {showQr && qrImage && (
        <div className="show flex flex-col justify-center items-center w-full">
          <img src={qrImage} alt="Deposit QR" className="w-[300px] h-[300px]" />
          <p className="flex flex-row justify-center items-center w-full gap-[10px]">
            Manual Deposit:{" "}
            <span className="italic cursor-pointer">
              {handleTrimString(tonAddress)}
            </span>
            <Copy style={{ cursor: "pointer" }} onClick={() => handleCopy()} />
          </p>
          {props.walletIndex === 1 ? <small className="italic text-red-400 w-[80svw] lg:w-[40svw]">
            Please make sure to deposit the correct currency on the TON network
            (which is Mapchain Token). The minimum deposit amount is{" "}
            {formatNumber(minAmount)} MCT.<br /> Any deposits made on the wrong
            network or below the minimum amount will result in the loss of your
            funds.
          </small> : props.walletIndex === 8 ? <small className="italic text-red-400 w-[80svw] lg:w-[40svw]">
            Please make sure to deposit the correct currency on the BSC network
            (which is USDT-BEP20). The minimum deposit amount is{" "}
            {formatNumber(5)} USDT.<br /> Any deposits made on the wrong
            network or below the minimum amount will result in the loss of your
            funds.
          </small> : <small className="italic text-red-400 w-[80svw] lg:w-[40svw]">
            Please make sure to deposit the correct currency on the TON Network
            (which is TON Coin). The minimum deposit amount is{" "}
            {formatNumber(10)} TON.<br /> Any deposits made on the wrong
            network or below the minimum amount will result in the loss of your
            funds.
          </small>}
          <p className="text-red-500 font-bold">
            Time Remaining: {formatTime(countdown)}
          </p>
          <div
            className="button-slide-to-confirm"
            style={{ marginTop: "10px" }}
          >
            <SwipeToConfirmDeposit
              text={"Touch to confirm"}
              handleSwipe={props.handleSwipe}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositItem;
