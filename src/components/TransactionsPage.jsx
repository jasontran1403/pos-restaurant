import Axios from "axios";
import { useEffect, useState, useContext } from "react";
import styles from "../style";
import { API_ENDPOINT } from "../constants";
import TransactionsTable from "./TransactionsTable";

const TABLE_HEAD = [
  "Code",
  "Date",
  "Amount",
  "Fee",
  "Type",
  "Status",
  "Note",
];
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";

const TransactionsPage = () => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);

  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [withdrawHistory, setWithdrawHistory] = useState([]);

  useEffect(() => {
    if (multiTabDetect) {
      toast.error("Multiple instances detected, please close all others window and reload the page!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/all-transactions/${walletAddress}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setWithdrawHistory(response.data);
      })
      .catch((error) => {
        toast.error("Please try again later", {
          position: "top-right",
          autoClose: 1500,
        });
      });
  }, []);

  return (
    <>
      <div className={`${styles.flexCenter}`}>
        <TransactionsTable TABLE_NAME={"Recent transactions"} TABLE_SUBNAME={"These are details about the lastest transactions"} TABLE_HEAD={TABLE_HEAD} TABLE_ROWS={withdrawHistory} />
      </div>
    </>
  );
};

export default TransactionsPage;
