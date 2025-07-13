import { useState } from "react";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";
import SwipeToConfirmClaim from "./SwipeToConfirmClaim";

const Balance = (props) => {
  const formatNumber = (numberString) => {
    // Parse the input to ensure it's a number
    const number = parseFloat(numberString);

    // Format the number with commas and two decimal places
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);

    return formattedNumber;
  };

  const formatSmallNumber = (numberString) => {
    // Parse the input to ensure it's a number
    const number = parseFloat(numberString);

    // Format the number with commas and two decimal places
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(number);

    return formattedNumber;
  };

  return (
    <div className="animation-fadeIn">
      <div className="balance-container">
        <div className="balance-section">
          <div className="balance-header">
            <p>Balance</p>
          </div>
          <div className="balance-content">
            <div className="balance-item">
              <p>Balance USDT</p>
              <p>
                <span className="text-green-500 italic">
                  {formatNumber(props.usdt)}
                </span>{" "}
                USDT
              </p>
            </div>
            <div className="balance-item">
              <p>Balance TCIS</p>
              <p>
                <span className="text-green-500 italic">
                  {formatNumber(props.tcis)}
                </span>{" "}
                TCIS
              </p>
            </div>
            <div className="balance-item">
              <p>OMG Points</p>
              <p>
                <span className="text-white italic">
                  {formatNumber(props.omg)}
                </span>{" "}
                Points
              </p>
            </div>

          </div>
        </div>
        <div className="balance-section">
          <div className="balance-header">
            <p>Commission</p>
          </div>
          <div className="balance-content">
            <div className="balance-item">
              <p>Mortgage</p>
              <p>
                <span className="text-green-500 italic">
                  {formatNumber(props.mortgage)}
                </span>{" "}
                USDT
              </p>
            </div>
            <div className="balance-item">
              <p>Commission</p>
              <p>
                <span className="text-green-500 italic">
                  {formatSmallNumber(props.commission)}
                </span>{" "}
                USDT
              </p>
            </div>
            <div className="balance-item">
              <p>Commission TCIS</p>
              <p>
                <span className="text-green-500 italic">
                  {formatSmallNumber(props.commissionTcis)}
                </span>{" "}
                TCIS
              </p>
            </div>
            <div className="balance-item">
              <p>Commission OMG Points</p>
              <p>
                <span className="text-white italic">
                  {formatSmallNumber(props.commissionOmg)}
                </span>{" "}
                Points
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="button-slide-to-confirm">
        <SwipeToConfirmClaim
          text={"Commission claim"}
          action={props.action}
          handleSwipe={props.handleSwipe}
        />
      </div>
    </div>
  );
};

export default Balance;
