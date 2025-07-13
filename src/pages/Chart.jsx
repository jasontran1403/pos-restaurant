import React from "react";
import BinanceChart from "../components/BinanceChart";

const Chart = () => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        width: "100svw",
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Căn giữa theo chiều dọc
        alignItems: "center", // Căn giữa theo chiều ngang
      }}
    >
      <BinanceChart />
    </div>
  );
}

export default Chart;
