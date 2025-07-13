import Axios from "axios";
import { useEffect, useState } from "react";
import styles from "../style";
import Button from "./Button";
import TransactionStatusCell from "./table/TransactionStatusCell";
import DateCell from "./table/DataCell";
import { ToastContainer } from "react-toastify";
import TransferItemDaily from "./TransferItemDaily";
import TransferTable from "./TransferTable";
import { API_ENDPOINT } from "../constants";

const TABLE_HEAD = [
  "Code",
  "Date",
  "Amount",
  "From/To",
  "Status",
  "Note"
];

const TransferCardDaily = () => {
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
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
      <div className="investment-container">
        <TransferItemDaily />
      </div>

      <div className={`${styles.flexCenter}`}>
        <TransferTable TABLE_NAME={"Recent internal transfer"} TABLE_SUBNAME={"These are details about the lastest internal transfer"} TABLE_HEAD={TABLE_HEAD} TABLE_ROWS={transferHistory} />
      </div>
    </>
  );
};

export default TransferCardDaily;
