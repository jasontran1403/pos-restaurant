import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";

const SwipeToConfirmWithdraw = (props) => {
  const { accessToken } = useAccessToken();
  const [loading, setLoading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    if (loading || actionCompleted) return;

    if (props.amount <= 0) {
      return;
    }

    if (!props.toWallet) {
      toast.error("Your account has not been verified withdraw address.", {
        position: "top-left",
        autoClose: 1500,
      });
      return;
    }

    setLoading(true);

    props.handleSwipe();

    const data = JSON.stringify({
      walletAddress: localStorage.getItem("walletAddress"),
      toWalletAddress: props.toWallet,
      amount: props.amount,
      method: 0,
      walletType: 0,
      type: props.type,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${API_ENDPOINT}management/withdraw`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data,
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "ok") {
          toast.success("Create withdraw order success!", {
            position: "top-right",
            autoClose: 1500,
            onClose: () => window.location.reload(),
          });
        } else {
          toast.error(response.data, {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              setActionCompleted(false);
              setLoading(false);
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
            setLoading(false);
          },
        });
      });
  };

  return (
    <button
      disabled={loading || actionCompleted}
      className={`btn ${actionCompleted || loading ? "action" : ""}`}
      onClick={handleSwipe}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-white text-xs">Processing...</p>
        </div>

      ) : (
        <>
          <p style={{ color: "white", fontSize: "12px" }}>{props.text}</p>
          <span>
            <img
              src="/icons/arrow.png"
              alt="Referral"
              className="w-[20px] h-[20px] pt-[5px]"
            />
          </span>
        </>
      )}
    </button>
  );
};

export default SwipeToConfirmWithdraw;
