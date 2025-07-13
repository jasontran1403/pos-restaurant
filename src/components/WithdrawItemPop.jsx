import Axios from "axios";
import { useState, useEffect, useContext } from "react";
import styles from "../style";
import Button from "./Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss';
import { API_ENDPOINT } from "../constants";
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";


const WithdrawItemPop = ({ depositHistory }) => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);

  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
  const [networkSelected, setNetworkSelected] = useState("");

  const [listNetwork, setListNetwork] = useState([
    { id: 2, name: "Mapchain Token" },
  ]);

  useEffect(() => {
    setNetworkSelected(listNetwork[0].id);
  }, []);

  const [amount, setAmount] = useState(0);
  const [toWallet, setToWallet] = useState("");
  const [balance, setBalance] = useState(100000000);

  useEffect(() => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/get-wallet-withdraw/${localStorage.getItem("walletAddress")}/2`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios
      .request(config)
      .then((response) => {
        setToWallet(response.data);
      })
      .catch((error) => {
        toast.error("Please try again later", {
          position: "top-right",
          autoClose: 1500,
        });
      });
  }, []);

  const handleWithdraw = () => {
    if (multiTabDetect) {
      toast.error("Multiple instances detected, please close all others window and reload the page!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    if (toWallet === "") {
      toast.error("Wallet address must not be null", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }
    if (amount <= 0) {
      toast.error("Withdraw order amount must be greater than 0", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    Swal.fire({
      title: 'Confirm withdraw',
      text: `Are you sure you want to withdraw ${amount} to ${toWallet}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm it!',
      cancelButtonText: 'No, cancel order',
      reverseButtons: true,
      customClass: {
        confirmButton: 'custom-confirm-button', // Custom class for confirm button
        cancelButton: 'custom-cancel-button',   // Custom class for cancel button
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let data = JSON.stringify({
          walletAddress: walletAddress,
          toWalletAddress: toWallet,
          amount: amount,
          method: 6,
          walletType: networkSelected,
          type: 6,
        });
    
        let config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${API_ENDPOINT}management/withdraw`,
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${localStorage.getItem("access_token")}`,
            "ngrok-skip-browser-warning": "69420",
          },
          data: data,
        };
    
        Axios
          .request(config)
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
              });
            }
          })
          .catch((error) => {
            toast.error("Please try again later", {
              position: "top-right",
              autoClose: 1500,
            });
          });
      }
    });

    
  };

  return (
    <div className={`investment-container $`}>
      <section
        className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} investment-card sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}
      >
        <div className="flex-1 flex flex-col">
          <h2 className={styles.heading2}>Withdraw</h2>
          <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="packageName"
              >
                Network
              </label>
              <select
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="packageName"
                value={networkSelected}
                onChange={(e) => setNetworkSelected(Number(e.target.value))}
              >
                {listNetwork.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="tokenBalance"
              >
                Wallet Address
              </label>
              <input
                className="bg-gray-300 shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                placeholder="No TON wallet address has been set"
                value={toWallet}
                readOnly
                disabled
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="tokenBalance"
              >
                Amount
              </label>
              <input
                className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text" // Use "text" to fully control input validation
                value={amount}
                min="0.1"
                onChange={(e) => {
                  const value = e.target.value;

                  // Regex to allow only numbers and decimals
                  const regex = /^[0-9]*\.?[0-9]*$/;

                  // Check if the input value matches the regex (valid number format)
                  if (regex.test(value)) {
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue) && numericValue > 0) {
                      setAmount(value); // Keep the valid input
                    } else {
                      setAmount(""); // Reset if invalid
                    }
                  }
                }}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-white text-sm font-bold mb-2"
                htmlFor="tokenBalance"
              >
                Fee
              </label>
              <input
                className="bg-white shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="tokenBalance"
                type="text"
                placeholder="3% total withdraw amount (min 1$)"
                readOnly
              />
            </div>
            <div className="flex items-center justify-between">
              <Button handleClick={handleWithdraw} content={"Withdraw"} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WithdrawItemPop;
