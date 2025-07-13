import Axios from "axios";
import { useEffect, useState } from "react";
import styles from "../style";
import Button from "./Button";
import TransactionsTable from "./TransactionsTable";
import { API_ENDPOINT } from "../constants";

const TABLE_HEAD = [
  "Code",
  "Date",
  "Amount",
  "Fee",
  "Type",
  "Status",
  "Note",
];

const TransactionsCard = () => {
  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [transferHistory, setTransferHistory] = useState([]);

  useEffect(() => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/transfer-history/${walletAddress}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setTransferHistory(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className={`${styles.flexCenter}`}>
        <TransactionsTable TABLE_NAME={"Recent internal transfer"} TABLE_SUBNAME={"These are details about the lastest internal transfer"} TABLE_HEAD={TABLE_HEAD} TABLE_ROWS={transferHistory} />
      </div>
    </>
  );
};

export default TransactionsCard;
