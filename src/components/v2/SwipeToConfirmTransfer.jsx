import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";
import { input } from "@material-tailwind/react";

const SwipeToConfirmTransfer = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    if (props.amount <= 0) {
      toast.error("Transfer amount must be greater than 0.", {
        position: "top-left",
        autoClose: 1500,
      });
      return;
    }

    if (props.to === localStorage.getItem("walletAddress")) {
      toast.error("You can't transfer to yourself.", {
        position: "top-left",
        autoClose: 1500,
      });
      return;
    }

    if (actionCompleted) return;

    // Trigger action
    props.handleSwipe();

    // Set the action state to true
    setActionCompleted(true);

    let data = JSON.stringify({
      from: localStorage.getItem("walletAddress"),
      to: props.to,
      amount: props.amount,
      status: 1,
      type: convertType(props.walletTypeId),
      walletType: props.walletTypeId === 1 ? 1 : 2,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/transfer-balance`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "Transaction success") {
          toast.success("Transfer success!", {
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

  const convertType = (typeInput) => {
    if (typeInput === 1 || typeInput === 2) {
      // mct -- transfer
      return 0;
    } else if (typeInput === 4) {
      // direct mct
      return 2;
    } else if (typeInput === 5) {
      // binary mct
      return 3;
    } else if (typeInput === 6) {
      // leader mct
      return 4;
    } else if (typeInput === 7) {
      // pop mct
      return 5;
    } else if (typeInput === 3) {
      // daily mct
      return 6;
    } else if (typeInput === 17) {
      return 7;
    } else if (typeInput === 18) {
      return 8;
    } else if (typeInput === 19) {
      return 9;
    } else if (typeInput === 20) {
      return 10;
    } else if (typeInput === 21) {
      return 11;
    } else if (typeInput === 15) {
      return 12;
    }
  }

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

export default SwipeToConfirmTransfer;
