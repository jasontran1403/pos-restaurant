import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { API_ENDPOINT } from "../constants";
import { toast } from "react-toastify";
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";
import { GearFill } from "react-bootstrap-icons";
import ConfigModal from "./ConfigModal";
import CurrencyField from "./CurrencyField";
import BeatLoader from "react-spinners/BeatLoader";
import CurrencyPrice from "./CurrencyPrice";
import TransactionSwap from "./TransactionSwap";
import TransactionTable from "./TransactionTable";
import DepositField from "./DepositField";
import WithdrawField from "./WithdrawField";
import DepositSwap from "./DepositSwap";
import WithdrawSwap from "./WithdrawSwap";
import RatioSwap from "./RatioSwap";

const TABLE_HEAD = [
  "Source",
  "Destination",
  "Amount",
  "Receive",
  "Time",
  "Status",
];
const TABLE_HEAD_DEPOSIT = ["Date", "Token name", "Amount", "Status"];
const TABLE_HEAD_WITHDRAW = [
  "Date",
  "Token name",
  "Address receive",
  "Amount",
  "Status",
];
const TABLE_HEAD_RATIO = ["Balance", "Exchange Rate"];

const ExternalSwapCard = () => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);
  const [slippageAmount, setSlippageAmount] = useState(undefined);
  const [deadlineMinutes, setDeadlineMinutes] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [showModal, setShowModal] = useState(undefined);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setoutputAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositSwap, setDepositSwap] = useState([]);
  const [withdrawSwap, setWithdrawSwap] = useState([]);
  const [loading, setLoading] = useState(undefined);
  const [ratio, setRatio] = useState(undefined);
  const [wethContract, setWethContract] = useState(undefined);
  const [uniContract, setUniContract] = useState(undefined);
  const [wethAmount, setWethAmount] = useState(undefined);
  const [uniAmount, setUniAmount] = useState(undefined);
  const [source, setSource] = useState("MCTUSDT");
  const [sourceBalance, setSourceBalance] = useState(0);
  const [destination, setDestination] = useState("BNBUSDT");
  const [sourceAmount, setSourceAmount] = useState(0);
  const [destinationAmount, setDestinationAmount] = useState(0);
  const [from, setFrom] = useState("MCT");
  const [to, setTo] = useState("BNB");
  const [failed, setFailed] = useState(false);
  const [currentTab, setCurrentTab] = useState(1);

  const handleSwap = () => {
    if (multiTabDetect) {
      toast.error(
        "Multiple instances detected, please close all others window and reload the page!",
        {
          position: "top-right",
          autoClose: 1500,
        }
      );
      return;
    }

    if (
      source === "" ||
      destination === "" ||
      sourceAmount <= 0 ||
      isNaN(sourceAmount) === true ||
      isNaN(destinationAmount) === true
    )
      return;

    let data = JSON.stringify({
      walletAddress: localStorage.getItem("walletAddress"),
      amount: sourceAmount,
      tokenSource: source,
      tokenDestination: destination,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/mapchain-swap`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data === "Swap order created success.") {
          toast.success(response.data, {
            position: "top-right",
            autoClose: 1500,
            onClose: () => {
              window.location.reload();
            },
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
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBalance();
    }, 1000); // Trì hoãn 1 giây

    return () => clearTimeout(timeout);
  }, [source]);

  const fetchBalance = () => {
    if (source === undefined) return;

    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/get-source-balance/${source}/${localStorage.getItem(
        "walletAddress"
      )}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };
    axios
      .request(config)
      .then((response) => {
        setSourceBalance(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  let timeout;

  const getSwapPrice = (inputAmount) => {
    if (timeout) {
      clearTimeout(timeout); // Hủy bỏ timeout trước đó nếu người dùng vẫn đang nhập
    }

    timeout = setTimeout(() => {
      setLoading(true);
      setSourceAmount(inputAmount);
      setDestinationAmount(inputAmount * ratio);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      let config = {
        method: "get",
        url: `${API_ENDPOINT}management/transactions-swap/${localStorage.getItem(
          "walletAddress"
        )}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      };

      axios.request(config).then((response) => {
        setTransactions(response.data.data);
      });
    }, 1000); // Trì hoãn 1 giây

    return () => clearTimeout(timeout); // Dọn dẹp timeout khi component unmount
  }, []);

  const fetchPrice = () => {
    let config = {
      method: "get",
      url: `${API_ENDPOINT}management/get-ratio/${source}/${destination}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    axios.request(config).then((response) => {
      setRatio(response.data);
      if (response.data <= 0) {
        setFailed(true);
      } else {
        // setDestinationAmount(sourceAmount * ratio);
        setFailed(false);
      }
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPrice();
    }, 1000); // Trì hoãn 1 giây

    return () => clearTimeout(timeout); // Dọn dẹp timeout khi dependencies thay đổi hoặc component unmount
  }, [source, destination]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      fetchPrice();
    }, 15000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [source, destination]);

  const handleChangeType = (type, e) => {
    let tokenName = `${e}USDT`;
    if (type === "source") {
      setFrom(e);
      setSource(tokenName);
    } else {
      setTo(e);
      setDestination(tokenName);
    }
    setSourceAmount(0);
    setDestinationAmount(0);
  };

  const handleMax = () => {
    setSourceAmount(sourceBalance);
    setDestinationAmount(sourceBalance * ratio);
  };

  const handleSwitchTab = (e) => {
    setCurrentTab(e);

    if (e === 2) {
      let config = {
        method: "get",
        url: `${API_ENDPOINT}management/deposit-swap/${localStorage.getItem(
          "walletAddress"
        )}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      };

      axios.request(config).then((response) => {
        setDepositSwap(response.data);
      });
    } else if (e === 3) {
      let config = {
        method: "get",
        url: `${API_ENDPOINT}management/withdraw-swap/${localStorage.getItem(
          "walletAddress"
        )}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      };

      axios.request(config).then((response) => {
        setWithdrawSwap(response.data);
      });
    }
  };

  const [ratios, setRatios] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListBalance(0);
    }, 1000); // Trì hoãn 1 giây
  
    return () => clearTimeout(timeout);
  }, []);

  const fetchListBalance = (timeoutInput) => {
    setFetching(true);

    setTimeout(() => {
      let config = {
        method: "get",
        url: `${API_ENDPOINT}management/get-all-ratio`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
      };

      axios
        .request(config)
        .then((response) => {
          setRatios(response.data);
          setLatestUpdate(response.data[0].latestUpdate);
        })
        .finally(() => {
          setFetching(false);
        });
    }, timeoutInput);
  };

  const [qrCode, setQrCode] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [qrInfo, setQrInfo] = useState(false);

  let timeOutQr;
  const handleChangeDepositType = (e) => {
    setLoading(true);

    if (timeOutQr) {
      clearTimeout(timeOutQr);
    }

    timeOutQr = setTimeout(() => {
      let walletAdderss = "";
      let method = 0;
      if (e === "BNB") {
        method = 3;
        walletAdderss = localStorage.getItem("bep20");
      } else if (e === "MCT" || e === "TON") {
        walletAdderss = localStorage.getItem("ton");
        if (e === "MCT") {
          method = 2;
        } else if (e === "TON") {
          method = 4;
        }
      } else if (e === "XRP") {
        method = 5;
        walletAdderss = localStorage.getItem("xrp");
      }

      setWallet(walletAdderss);

      let data = JSON.stringify({
        walletAddress: (walletAdderss =
          localStorage.getItem("walletAddress")),
        amount: 0,
        method: method,
      });

      let config = {
        method: "post",
        url: `${API_ENDPOINT}management/generate-qr`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "ngrok-skip-browser-warning": "69420",
        },
        data: data,
        responseType: "blob",
      };

      axios
        .request(config)
        .then((response) => {
          // Assuming response.data contains the image URL or base64 string
          const qrCodeBlob = response.data;
          const qrCodeUrl = URL.createObjectURL(qrCodeBlob);
          setQrCode(qrCodeUrl);
        })
        .catch((error) => {
          toast.error("Please try again later", {
            position: "top-right",
            autoClose: 1500,
          });
        });
      setQrInfo(true);
    }, 1200);

    setLoading(false);
  };

  useEffect(() => {
    handleChangeDepositType("MCT");
  }, []);

  return (
    <div className="appBody">
      <div className="swapContainer">
        {currentTab === 1 ? (
          <div className="swapContent">
            <div className="swapHeader">
              <span className="swapText">MAPCHAIN SWAP</span>
            </div>
            <div className="swapBody">
              <CurrencyField
                field="input"
                converted={false}
                type="source"
                sourceAmount={sourceAmount}
                handleChangeType={handleChangeType}
                tokenName="BNB"
                handleMax={handleMax}
                getSwapPrice={getSwapPrice}
                signer={signer}
                balance={sourceBalance}
                failed={failed}
                handleSwitchTab={handleSwitchTab}
              />

              <CurrencyField
                field="input"
                type="destination"
                tokenName="MCT"
                converted={true}
                handleChangeType={handleChangeType}
                signer={signer}
                balance={destinationAmount}
                spinner={BeatLoader}
                loading={loading}
              />
              <CurrencyPrice ratio={ratio} from={from} to={to} />
            </div>
            <div className="swapFooter">
              <button className="button-64" role="button" onClick={handleSwap}>
                <span className="text">Swap</span>
              </button>
            </div>
            <div className="transaction-container">
              <RatioSwap
                className="w-full flex justify-center items-center ml-[20px]"
                TABLE_NAME={""}
                TABLE_SUBNAME={""}
                TABLE_HEAD={TABLE_HEAD_RATIO}
                TABLE_ROWS={ratios}
                handleUpdate={fetchListBalance}
                isLoading={fetching}
                latestUpdate={latestUpdate}
              />
            </div>
          </div>
        ) : currentTab === 2 ? (
          <div className="swapContent">
            <div className="swapHeader">
              <span
                className="swapText"
                style={{ cursor: "pointer" }}
                onClick={(e) => handleSwitchTab(1)}
              >
                SWAP
              </span>
              <span className="swapText">DEPOSIT</span>
              <span
                className="swapText"
                style={{ cursor: "pointer" }}
                onClick={(e) => handleSwitchTab(3)}
              >
                WITHDRAW
              </span>
            </div>
            <div className="swapBody">
              <DepositField
                field="input"
                handleChangeDepositType={handleChangeDepositType}
                qrInfo={qrInfo}
                qrCode={qrCode}
                wallet={wallet}
              />
            </div>

            <div className="transaction-container">
              <DepositSwap
                className="w-full flex justify-center items-center ml-[20px]"
                TABLE_NAME={""}
                TABLE_SUBNAME={""}
                TABLE_HEAD={TABLE_HEAD_DEPOSIT}
                TABLE_ROWS={depositSwap}
              />
            </div>
          </div>
        ) : (
          <div className="swapContent">
            <div className="swapHeader">
              <span
                className="swapText"
                style={{ cursor: "pointer" }}
                onClick={(e) => handleSwitchTab(1)}
              >
                SWAP
              </span>
              <span
                className="swapText"
                style={{ cursor: "pointer" }}
                onClick={(e) => handleSwitchTab(2)}
              >
                DEPOSIT
              </span>
              <span className="swapText">WITHDRAW</span>
            </div>
            <div className="swapBody">
              <WithdrawField
                field="input"
                converted={false}
                tokenName="MCT"
                sourceAmount={sourceAmount}
                handleChangeType={handleChangeType}
                handleMax={handleMax}
                getSwapPrice={getSwapPrice}
                balance={sourceBalance}
              />
            </div>

            <div className="transaction-container">
              <WithdrawSwap
                className="w-full flex justify-center items-center ml-[20px]"
                TABLE_NAME={""}
                TABLE_SUBNAME={""}
                TABLE_HEAD={TABLE_HEAD_WITHDRAW}
                TABLE_ROWS={withdrawSwap}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalSwapCard;
