import React, { useState, useEffect } from "react";
import Axios from "axios";
import styles from "../style";
import styled from "styled-components";
import { MainDashboard, Footer, UserNavbar } from "../components";
import TransferCard from "../components/TransferCard";
import LockModal from "../components/LockModal";

const CloseButton = styled.svg`
  width: 20px;
  height: 20px;
  position: absolute;
  right: 18px;
  top: 18px;
  cursor: pointer;
`;
const Transfer = () => {
  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));
  const [walletStateInit, setWalletStateInit] = useState(
    localStorage.getItem("walletStateInit")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [modalIsOpen, setIsOpen] = useState();
  const [isInTree, setIsInTree] = useState(localStorage.getItem("is_in_tree"));
  const [isLock] = useState(localStorage.getItem("is_lock"));
  const [modalLock, setModalLock] = useState(false);
  const isSmallScreen = window.innerWidth <= 768;

  useEffect(() => {
    // Only proceed when notification is closed
    if (isInTree === "true") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }

    if (isLock === "true") {
      setModalLock(true);
    } else {
      setModalLock(false);
    }
  }, [isInTree, isLock]); // Trigger when notification modal closes

  const closeLockModal = () => {
    setModalLock(false);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  function handleOpenModal(open) {
    closeLockModal();
  }

  return (
    <div className="bg-primary w-full h-full">
      <div className={`${styles.paddingX} ${styles.flexCenterNav}`}>
        <div className={`${styles.boxWidth}`}>
          <UserNavbar />
        </div>
      </div>
      

      {isLock === "true" ? (
        <LockModal
          isOpen={modalLock}
          onRequestClose={closeLockModal}
          contentLabel="Account lock"
        >
          <CloseButton
            onClick={(e) => handleOpenModal(false)}
            style={{ zIndex: "9999" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20.39 20.39"
          >
            <title>X</title>
            <line
              x1="19.39"
              y1="19.39"
              x2="1"
              y2="1"
              fill="none"
              stroke="#5c3aff"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="2"
            />
            <line
              x1="1"
              y1="19.39"
              x2="19.39"
              y2="1"
              fill="none"
              stroke="#5c3aff"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="2"
            />
          </CloseButton>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%", // Ensure the content takes the full height of the modal
            }}
          >
            <p
              style={{
                textAlign: "center",
                fontSize: isSmallScreen ? "30px" : "40px", // Adjust line height based on screen size
                color: "orangered",
              }}
            >
              Your account is temporarily locked due to abusing a vulnerability
              for profit, please check your email for further details information about this situation.
            </p>
          </div>
        </LockModal>
      ) : isInTree === "true" ? (
        <div className={`bg-primary ${styles.flexStart} bg-image`}>
          <div className={`${styles.boxWidthDashboard}`}>
            <TransferCard />
          </div>
        </div>
      ) : (
        <div className={`bg-primary ${styles.flexStart} bg-image`}>
          <div className={`${styles.boxWidthDashboard}`}>
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Update sponsor"
            >
              <Form />
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
