import Axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ReactDOM from "react-dom/client";
import Router from "./routes";
import "./index.css";
import {
  THEME,
  TonConnectUIProvider,
  useTonWallet,
} from "@tonconnect/ui-react";
import { API_ENDPOINT } from "./constants";
import { BrowserRouter } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react"; // or any specific hook provided by the SDK
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MultiTabDetectProvider } from "./components/MultiTabDetectContext";
import PuffLoader from "react-spinners/PuffLoader";
import { useAuth, AuthProvider } from "./pages/AuthContext";
import { WalletProvider } from "./components/WalletContext";
import { AccessTokenProvider } from "./components/AccessTokenContext";
import { useAccessToken } from "./components/AccessTokenContext";
import { WebSocketProvider } from "./components/WebSocketContext";

function App() {
  const wallet = useTonWallet();
  const connect = useTonConnectUI();
  const [lastStatus, setLastStatus] = useState();
  const isAdmin = window.location.href.includes("/admin");
  const id = location.pathname.split("/admin/home/")[1];
  const [loading, setLoading] = useState(false);
  let [color] = useState("#42d7f5");
  const { isAuthLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { accessToken, saveAccessToken, removeAccessToken } = useAccessToken();
  const [isConnected, setIsConnected] = useState(false);

  if (loading || isAuthLoading) {
    return (
      <div className="sweet-loading">
        <PuffLoader color={color} loading={loading} size={150} />
      </div>
    );
  }

  return <Router />;
}

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")).render(
  <AccessTokenProvider>
    <WalletProvider>
      <MultiTabDetectProvider>
        <WebSocketProvider>
          <AuthProvider>
            <TonConnectUIProvider
              manifestUrl="https://www.mapchain.org/tonconnect-manifest.json"
              uiPreferences={{
                theme: THEME.LIGHT,
                borderRadius: "s",
                colorsSet: {
                  [THEME.DARK]: {
                    connectButton: {
                      background: "#29CC6A",
                    },
                  },
                },
              }}
            >
              <BrowserRouter>
                <App />
                <ToastContainer stacked />
              </BrowserRouter>
            </TonConnectUIProvider>
          </AuthProvider>
        </WebSocketProvider>
      </MultiTabDetectProvider>
    </WalletProvider>
  </AccessTokenProvider>
);
