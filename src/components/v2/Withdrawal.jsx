import { useEffect, useState } from "react";
import SwipeToConfirmWithdrawal from "./SwipeToConfirmWithdrawal";
import Axios from "axios";
import { API_ENDPOINT } from "../../constants";
import { useAccessToken } from "../../components/AccessTokenContext";

const Withdrawal = (props) => {
  const { accessToken } = useAccessToken();
  const [usdt, setUsdt] = useState("");
  const [mct, setMct] = useState("");

  useEffect(() => {
    let config = {
      method: 'get',
      url: `${API_ENDPOINT}management/get-withdraw-wallet/${localStorage.getItem("walletAddress")}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    };

    Axios.request(config)
      .then((response) => {
        setUsdt(response.data.usdtbep20);
        setMct(response.data.ton);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  return (
    <div
      className="animation-fadeIn"
      style={{ marginBottom: "0", paddingBottom: "10px" }}
    >
      <div className="form-container">
        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            USDT-BEP20 (BSC)
          </label>
          <input
            value={usdt}
            onChange={(e) => {
              setUsdt(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter USDT-BEP20 wallet address (BSC)"
          />
        </div>

        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Mapchain Token (TON)
          </label>
          <input
            value={mct}
            onChange={(e) => {
              setMct(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter Mapchain Token wallet address (TON)"
          />
        </div>

        <div
          className="button-slide-to-confirm"
          style={{ marginTop: "-10px", marginBottom: "-30px" }}
        >
          <SwipeToConfirmWithdrawal
            usdt={usdt}
            mct={mct}
            action={props.action}
            handleSwipe={props.handleSwipe}
          />
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
