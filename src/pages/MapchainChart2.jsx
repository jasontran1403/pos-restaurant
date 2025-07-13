import React, { useState } from "react";
import styles from "../style";
import {
  Footer,
  Navbar,
} from "../components";

import CoinChartsJs from "../components/CoinChartJs";


const MapchainChart2 = () => {
  const [coin, setCoin] = useState();

  return (
    <div className="bg-primary w-full overflow-hidden">
      <div
        className={`${styles.paddingX} ${styles.flexCenterNav} w-full absolute z-10 navbar`}
      >
        <div className={`${styles.boxWidth}`}>
          <Navbar/>
        </div>
      </div>
      <div className={`bg-primary ${styles.flexStart} test`}>
        <div className={`${styles.boxWidth}`}>
          <CoinChartsJs coin={coin} />
        </div>
      </div>
    </div>
  );
};

export default MapchainChart2;
