import React, { useState, useEffect } from "react";
import Axios from "axios";
import styles from "../style";
import { Footer, UserNavbar } from "../components";
import Modal from "react-modal";
import WithdrawCardDaily from "../components/WithdrawCardDaily";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    width: "70%", // Default width for larger screens
    maxWidth: "800px",
    height: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "2rem",
  },
  overlay: {
    zIndex: 1000, // Ensure it stays on top
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Dark background for better focus
  },
};

const WithdrawDaily = () => {
  const isSmallScreen = window.innerWidth <= 768;

  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));
  const [walletStateInit, setWalletStateInit] = useState(
    localStorage.getItem("walletStateInit")
  );
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [isInTree, setIsInTree] = useState(localStorage.getItem("is_in_tree"));
  const [notificationModalOpen, setNotificationModalOpen] = useState(true); // Notification modal state

  const closeNotificationModal = () => {
    setNotificationModalOpen(false); // Close the notification and continue logic
    window.location.href = "/dashboard";
  };
  return (
    <div className="bg-primary w-full h-full">
      <div className={`${styles.paddingX} ${styles.flexCenterNav}`}>
        <div className={`${styles.boxWidth}`}>
          <UserNavbar />
        </div>
      </div>

      <div className={`bg-primary ${styles.flexStart} bg-image`}>
        <div className={`${styles.boxWidthDashboard}`}>
          {isInTree === "true" ? (
            <>
              <WithdrawCardDaily />
            </>
          ) : (
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Update sponsor"
            >
              <Form />
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawDaily;
