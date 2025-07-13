import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../AccessTokenContext";

const SwipeToConfirmStake = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    // Trigger action
    props.handleSwipe();

    if (actionCompleted) return;

    // Set the action state to true
    setActionCompleted(true);

    // Reset the action after 1.5 seconds (1500ms)
    setTimeout(() => {
      setActionCompleted(false);
    }, 3000);

    props.handleStake();
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

export default SwipeToConfirmStake;
