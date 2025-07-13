import React, { createContext, useState, useEffect } from "react";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem("workerId"));

  useEffect(() => {
    // Khi component mount, kiểm tra trạng thái ví từ localStorage
    setIsConnected(!!localStorage.getItem("workerId"));
  }, []);

  const connectWallet = (walletAddress) => {
    localStorage.setItem("workerId", walletAddress);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    localStorage.removeItem("workerId");
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider value={{ isConnected, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
