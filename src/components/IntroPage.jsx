import React, { useState } from "react";
import logo from "../assets/background/Unicorn.png";
import GetStarted from "./eco/GetStarted";

const IntroPage = () => {
  const [actionLogout, setActionLogout] = useState(false);

  const handleSwipeLogout = () => {
    if (actionLogout) return; // Prevent further clicks if action is already in progress

    setActionLogout(true);
    setTimeout(() => {
        window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="slogan-1">
        <div className="slogan-content">
          <p>ONE MINUTE GAME</p>
        </div>
      </div>
      <div className="slogan-2">
        <p>ONE MINUTE GAIN</p>
      </div>
      <div className="logo">
        <img src={logo} alt="" className="logo-unicorn" />
      </div>
      <GetStarted handleSwipeLogout={handleSwipeLogout} />
    </div>
  );
};

export default IntroPage;
