import Axios from "axios";
import { useEffect, useState } from "react";
import styles from "../style";
import TransactionTable from "./table/TransactionTable";
import Button from "./Button";
import TransactionStatusCell from "./table/TransactionStatusCell";
import DateCell from "./table/DataCell";
import { ToastContainer } from "react-toastify";
import DepositUSDTItem from "./DepositUSDTItem";
import HashCell from "./table/HashCell";
import { API_ENDPOINT } from "../constants";
import DepositTable from "./DepositTable";

const TABLE_HEAD = [
  "Code",
  "Date",
  "Amount",
  "Status",
  "Note",
];

const DepositMCTCard = () => {
  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [depositHistory, setDepositHistory] = useState([]);

  useEffect(() => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/deposit-history/${walletAddress}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setDepositHistory(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="investment-container">
        <DepositUSDTItem />
      </div>

      <div className={`${styles.flexCenter}`}>
        <DepositTable TABLE_NAME={"Recent deposit"} TABLE_SUBNAME={"These are details about the lastest deposit"} TABLE_HEAD={TABLE_HEAD} TABLE_ROWS={depositHistory} />
      </div>
    </>
  );
};

export default DepositMCTCard;
