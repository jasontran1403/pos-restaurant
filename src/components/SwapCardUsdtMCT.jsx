import Axios from "axios";
import { useEffect, useState } from "react";
import styles from "../style";
import Button from "./Button";
import TransactionStatusCell from "./table/TransactionStatusCell";
import DateCell from "./table/DataCell";
import { ToastContainer } from "react-toastify";
import SwapItemUsdtMCT from "./SwapItemUsdtMCT";
import DepositTable from "./DepositTable";
import { API_ENDPOINT } from "../constants";

const TABLE_HEAD = ["Code", "Date", "Amount", "Status", "Note"];

const SwapCardUSDT = () => {
  const [walletAddress, setWalletAddress] = useState(
    localStorage.getItem("walletAddress")
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [swapHistory, setSwapHistory] = useState([]);

  useEffect(() => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/swap-history/${walletAddress}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    Axios.request(config)
      .then((response) => {
        setSwapHistory(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="investment-container">
        <SwapItemUsdtMCT />
      </div>

      <div className={`${styles.flexCenter}`}>
        <DepositTable
          TABLE_NAME={"Recent swap"}
          TABLE_SUBNAME={"These are details about the lastest swap"}
          TABLE_HEAD={TABLE_HEAD}
          TABLE_ROWS={swapHistory}
        />
      </div>
    </>
  );
};

export default SwapCardUSDT;
