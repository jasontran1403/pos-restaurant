import React, { useState } from "react";
import { API_ENDPOINT } from "../../constants";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useAccessToken } from "../AccessTokenContext";

const SwipeToUpdateReferral = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    // Trigger action
    props.handleSwipe();

    // If any required field is empty, return early
    if (props.referralCode === "" || props.displayName === "") {
      toast.error("Sponsor code and display name are required!", {
        position: "top-center",
        autoClose: 1500,
      });
      return;
    }

    // Set the action state to true
    setActionCompleted(true);

    // Reset the action after 1.5 seconds (1500ms)
    setTimeout(() => {
      setActionCompleted(false);
    }, 3000);

    let data = JSON.stringify({
      walletAddress: localStorage.getItem("walletAddress"),
      code: props.referralCode,
      email: props.email,
      phoneNumber: props.phoneNumber,
      displayName: props.displayName,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/updateRef`,
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
          localStorage.setItem("is_in_tree", "true");
          toast.success("Referral user updated successfully!", {
            position: "top-center",
            autoClose: 1500,
            onClose: () => window.location.reload(),
          });
        } else {
          toast.error(response.data, {
            position: "top-center",
            autoClose: 1500,
          });
        }
      })
      .catch((error) => {
        setButtonDisabled(false);
        toast.error("Please try again later", {
          position: "top-center",
          autoClose: 1500
        });
      });
    
  };

  return (
    <button
      disabled={actionCompleted}
      className={`btn ${actionCompleted ? "action" : ""}`}
      onClick={handleSwipe}
    >
      <p style={{ color: "white", fontSize: "12px" }}>Touch to update referral</p>{" "}
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

export default SwipeToUpdateReferral;
