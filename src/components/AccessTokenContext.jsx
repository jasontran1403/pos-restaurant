import React, { createContext, useContext, useState } from "react";

// Tạo context
const AccessTokenContext = createContext();

// Provider để bọc toàn bộ app
export const AccessTokenProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);

  // Hàm cập nhật token
  const saveAccessToken = (token) => {
    setAccessToken(token);
  };

  // Hàm xóa token khi logout
  const removeAccessToken = () => {
    setAccessToken(null);
  };
  
  return (
    <AccessTokenContext.Provider value={{ accessToken, saveAccessToken, removeAccessToken }}>
      {children}
    </AccessTokenContext.Provider>
  );
};

// Hook giúp component khác truy cập vào accessToken
export const useAccessToken = () => useContext(AccessTokenContext);
