import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";

const SwipeToCreateDeposit = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    // Trigger action
    if (props.amount < 10) {
      toast.error("Min deposit is 10USDT", {
        position: "top-left",
        autoClose: 1500,
      });
      return;
    }

    props.handleSwipe();

    // Set the action state to true
    setActionCompleted(true);

    // Reset the action after 1.5 seconds (1500ms)
    setTimeout(() => {
      setActionCompleted(false);
      props.handleShowQr();
    }, 1800);

    // let data = JSON.stringify({
    //   walletAddress: `${localStorage.getItem("walletAddress")}`,
    //   network: "Binance Smart Chain",
    //   walletType: 1,
    //   amount: props.amount,
    // });

    // let config = {
    //   method: "post",
    //   url: `${API_ENDPOINT}management/deposit`,
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${accessToken}`,
    //     "ngrok-skip-browser-warning": "69420",
    //   },
    //   data: data,
    //   responseType: "blob",
    // };

    // Axios.request(config)
    //   .then((response) => {
    //     const qrCodeBlob = response.data;
    //     const qrCodeUrl = URL.createObjectURL(qrCodeBlob);
    //     props.onReceiveQr(qrCodeUrl);
    //     toast.success("Create deposit order successfully!", {
    //       position: "top-right",
    //       autoClose: 1500,
    //     });
    //   })
    //   .catch((error) => {
    //     toast.error("Please try again later", {
    //       position: "top-right",
    //       autoClose: 1500,
    //     });
    //   });
  };

  return (
    <button
      disabled={actionCompleted}
      className={`btn ${actionCompleted ? "action" : ""}`}
      onClick={handleSwipe}
    >
      <p style={{ color: "white", fontSize: "12px" }}>{props.text}</p>{" "}
      <span>
        <img
          src="/icons/arrow.png"
          alt="Referral"
          className="w-[20px] h-[20px] pt-[5px]"
        />
      </span>
    </button>
  );
};

export default SwipeToCreateDeposit;
