import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { WS_ENDPOINT } from "../constants";
import { ToastContainer, toast } from "react-toastify";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const isMounted = useRef(true);

  return (
    <WebSocketContext.Provider value={{ connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);