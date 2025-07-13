import React, { useState } from "react";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";

const SwipeToConfirmClaim = (props) => {
  const { accessToken } = useAccessToken();
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleSwipe = () => {
    // Trigger action
    props.handleSwipe();

    // Set the action state to true
    setActionCompleted(true);

    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/claim-commission/${localStorage.getItem(
        "walletAddress"
      )}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        if (response.data === "ok") {
          toast.success(
            `Claim commission successfully!`,
            {
              position: "top-right",
              autoClose: 1500,
              onClose: () => {
                window.location.reload();
              }
            }
          );
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

export default SwipeToConfirmClaim;
