import Axios from "axios";
import { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss';
import styles from "../style";
import Button from "./Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINT } from "../constants";
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";


const TransferItemLeader = ({ swapHistory }) => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem("walletAddress"));
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [to, setTo] = useState("");
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [listWalletType] = useState([
    { id: 1, name: "Leader commission" },
  ]);
  const [balances, setBalances] = useState([]);
  const [amountSwap, setAmountSwap] = useState(0);
  const [walletTypeId, setWalletTypeId] = useState(1);

  const [listBalance, setListBalance] = useState([]);
  
  useEffect(() => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/balance/${walletAddress}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setBalances(response.data.balances);
        setBalance(response.data.balances[4].balance);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleCreateDeposit = () => {
    if (multiTabDetect) {
      toast.error("Multiple instances detected, please close all others window and reload the page!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    if (buttonDisabled) return;
    if (amount <= 0) {
      toast.error("Swap amount must > 0!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    if (amount > balance) {
      toast.error("Swap amount must <= balance!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    // SweetAlert2 confirmation modal
    Swal.fire({
      title: 'Confirm Transfer',
      text: `Are you sure you want to transfer ${amount} to ${to}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, transfer it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: 'custom-confirm-button', // Custom class for confirm button
        cancelButton: 'custom-cancel-button',   // Custom class for cancel button
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setButtonDisabled(true);
        let data = JSON.stringify({
          from: walletAddress,
          to: to,
          amount: amount,
          status: 1,
          type: 4,
          walletType: walletTypeId,
        });

        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${API_ENDPOINT}management/transfer-balance`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
              setButtonDisabled(false);

              toast.error(response.data, {
                position: "top-right",
                autoClose: 1500,
              });
            }
          })
          .catch((error) => {
            setButtonDisabled(false);

            toast.error("Please try again later", {
              position: "top-right",
              autoClose: 1500,
            });
          });
      }
    });
  };

  const handleChangeAmount = (amountToSwap) => {
    const value = amountToSwap;
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value)) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && numericValue > 0) {
        setAmount(value);
        setAmountSwap(value / 0.1);
      } else {
        setAmount("");
      }
    } else {
      setAmount("");
    }
  };

  return (
    <div className={`investment-container $`}>
      <section
        className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} investment-card sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}
      >
        <div className="flex-1 flex flex-col">
          <h2 className={styles.heading2}>Internal Transfer</h2>
          <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="walletType">
                Wallet Type
              </label>
              <select
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="walletType"
                value={walletTypeId}
                onChange={(e) => handleSetWalletType(e.target.value)}
              >
                {listWalletType.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="tokenBalance">
                Balance
              </label>
              <input
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                value={balance}
                readOnly
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="tokenBalance">
                Transfer to
              </label>
              <input
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                placeholder="Display name or wallet address"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="tokenBalance">
                Amount
              </label>
              <input
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                value={amount}
                onChange={(e) => {
                  handleChangeAmount(e.target.value);
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="tokenBalance">
                Fee
              </label>
              <input
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                value={fee}
                readOnly
              />
            </div>

            <div className="flex items-center justify-between">
              <Button handleClick={handleCreateDeposit} content={"Transfer"} />
            </div>
          </div>

          <ToastContainer stacked />
        </div>
      </section>
    </div>
  );
};

export default TransferItemLeader;
