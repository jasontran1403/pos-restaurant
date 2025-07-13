import React from "react";
import styles from "../style";
import ExternalSwapCard from "../components/ExternalSwapCard";
import {
    Footer,
    Navbar,
  } from "../components";

const ExternalSwap = () => {
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
          <ExternalSwapCard />
        </div>
      </div>
    </div>
  );
};

export default ExternalSwap;
