import { useState, useEffect } from "react";
import { PuffLoader } from "react-spinners";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAccessToken } from "../../components/AccessTokenContext";
import BinanceChart from "../BinanceChart";
import CoinChartJs from "../CoinChartJs";

const TokenInformation = (props) => {
  const { accessToken } = useAccessToken();
  const [loading, setLoading] = useState(false);
  let [color] = useState("#42d7f5");

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1500); // Delay 1200ms

    return () => clearTimeout(timeout); // Dọn dẹp timeout khi component unmount
  }, []);

  return (
    <>
      {loading && (
        <div className="loading-task">
          <PuffLoader color={color} loading={loading} size={150} />
        </div>
      )}
      {!loading && <BinanceChart />}
      
      {/* {!loading && <CoinChartJs />} */}
    </>
  );
};

export default TokenInformation;
