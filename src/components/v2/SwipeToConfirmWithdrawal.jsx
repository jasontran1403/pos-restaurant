import React, { useState } from "react";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useAccessToken } from "../AccessTokenContext";

const SwipeToConfirmWithdrawal = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    // Trigger action
    props.handleSwipe();

    if (props.usdt === "" || props.mct === "") return;

    // Set the action state to true
    setActionCompleted(true);

    // Reset the action after 1.5 seconds (1500ms)
    setTimeout(() => {
      setActionCompleted(false);
    }, 3000);

    let data = JSON.stringify({
      walletAddress: localStorage.getItem("walletAddress"),
      bepWallet: props.usdt,
      tonWallet: props.mct
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/update-wallet`,
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
          toast.success(`Updated withdrawal wallet address successfully!`, {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              window.location.reload();
            },
          });
        } else {
          toast.error(response.data, {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              setActionCompleted(false);
            },
          });
        }
      })
      .catch((error) => {
        toast.error("Please try again later", {
          position: "top-right",
          autoClose: 1500,
          onClose: () => {
            setActionCompleted(false);
          },
        });
      });
  };

  return (
    <button
      disabled={actionCompleted}
      className={`btn ${actionCompleted ? "action" : ""}`}
      onClick={handleSwipe}
    >
      <p style={{ color: "white", fontSize: "12px" }}>Touch to verify</p>{" "}
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

export default SwipeToConfirmWithdrawal;
