import React, { useState, useEffect } from "react";
import Axios from "axios";
import styles from "../style";
import { UserNavbar } from "../components";
import CoinChartsJs from "../components/CoinChartJs";

const MapchainChart = () => {
  const [coin, setCoin] = useState();

  return (
    <div className="bg-primary w-full h-full">
      <div className={`${styles.paddingX} ${styles.flexCenterNav}`}>
        <div className={`${styles.boxWidthDashboard}`}>
          <UserNavbar />
        </div>
      </div>

      <CoinChartsJs coin={coin} />
    </div>
  );
};

export default MapchainChart;
