import React, { useState }  from 'react';

const ProgressCircle = ({ percentage, handleClickPlan, isActive, id }) => {
  
  const radius = 65; // tăng bán kính của vòng tròn lên 30%
  const strokeWidth = 8; // độ dày của vòng tròn
  const circumference = 2 * Math.PI * radius; // chu vi vòng tròn
  const progress = ((100 - percentage) / 100) * circumference;

  return (
    <div className={`progress-container cursor-pointer ${isActive ? "active-circle" : ""}`} onClick={() => handleClickPlan(id)}>
      <svg
        width="156"
        height="156"
        viewBox="0 0 156 156"
        className="progress-circle"
      >
        {/* Vòng tròn nền */}
        <circle
          className="circle-bg"
          cx="78"
          cy="78"
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Vòng tròn progress */}
        <circle
          className="circle-progress"
          cx="78"
          cy="78"
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>
      {/* Nội dung bên trong */}
      <div className="circle-content">
        <div className="stake-date">
          Staked <br /> 2024-12-14
        </div>
        <div className="stake-amount">5.000 EFT</div>
        <div className="received-amount">
          1.44645 USDT <br /> Received
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;
