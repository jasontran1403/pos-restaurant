import React, { useState, useEffect } from "react";
import Axios from "axios";
import "../assets/css/TreeView.css";
import { API_ENDPOINT } from "../constants";

const Test = () => {
    const [walletAddress, setWalletAddress] = useState(
        localStorage.getItem("walletAddress")
      );
      const [publicKey, setPublicKey] = useState(localStorage.getItem("publicKey"));
      const [walletStateInit, setWalletStateInit] = useState(
        localStorage.getItem("walletStateInit")
      );
      const [accessToken, setAccessToken] = useState(
        localStorage.getItem("access_token")
      );

  const [prevWallets, setPrevWallets] = useState([]); // Stack to hold previous wallet addresses
  const [currWallet, setCurrWallet] = useState("0:d9b533a4a261a5edbc80fe9f2886e5cfabf5acb642634091a23218d0c4dc881d");
  const [userRoot, setUserRoot] = useState({});
  const [treeData, setTreeData] = useState(null);

  const formatLargeNumber = (num) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
    ];
    
    const item = lookup
      .slice()
      .reverse()
      .find((item) => num >= item.value);
  
    if (!item) return "0";
  
    // Format với 4 số thập phân và loại bỏ số 0 dư ở cuối
    let formatted = (num / item.value).toFixed(4).replace(/\.?0+$/, "");
  
    return formatted + item.symbol;
  };

  useEffect(() => {
    fetchTreeByRoot(currWallet); // Fetch tree using current wallet
  }, [currWallet]);

  const fetchTreeByRoot = (rootAddress) => {
    let data = JSON.stringify({
      walletAddress: rootAddress,
    });

    let config = {
      method: "post",
      url: `${API_ENDPOINT}management/userMapDown5Level`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
      data: data,
    };

    Axios.request(config)
      .then((response) => {
        setTreeData(response.data.root);
        setUserRoot(response.data.root.userInfo);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClick = (address) => {
    setPrevWallets((prev) => [...prev, currWallet]); // Push current wallet to prev wallets stack
    setCurrWallet(address); // Update current wallet to the new address
  };

  const handleGoBack = () => {
    setPrevWallets((prev) => {
      if (prev.length === 0) return prev; // No previous wallets
      const lastWallet = prev[prev.length - 1]; // Get the last wallet
      setCurrWallet(lastWallet); // Set it as current wallet
      return prev.slice(0, -1); // Remove the last wallet from the stack
    });
  };

  const renderTree = (node, depth = 0, position = 0) => {
    if (depth > 3) return null; // Limit depth to 5 levels (0-4)

    const displayName = node?.userInfo?.displayName || null;
    return (
      <li key={`${depth}-${position}`}>
        <div className={`node ${!displayName ? "placeholder" : ""}`}>
          {displayName ? (
            <a
              onClick={() => {
                handleClick(node.userInfo.walletAddress);
              }}
            >
              <p>{displayName}</p>
              {node.userInfo?.rank > 0 ? <p>Vip {node.userInfo?.rank}</p> : <></>}
              <p className="sponsor">
                Sponsor: {node.userInfo?.rootDisplayName || "N/A"}
              </p>
              <p className="sponsor">Sales: {formatLargeNumber(node.userInfo?.sales) || 0}</p>
              <p className="sponsor">Sales left: {formatLargeNumber(node.userInfo?.teamSalesLeft) || 0}</p>
              <p className="sponsor">Sales right: {formatLargeNumber(node.userInfo?.teamSalesRight) || 0}</p>
            </a>
          ) : (
            <a>
              <p>&nbsp;</p>{" "}
              {/* This ensures there's some content inside the tag */}
              <p className="sponsor">&nbsp;</p>
              <p className="sponsor">&nbsp;</p>
              <p className="sponsor">&nbsp;</p>
              <p className="sponsor">&nbsp;</p>
            </a>
          )}
        </div>
        <ul>
          {/* Render left subtree */}
          {renderTree(node?.left, depth + 1, position * 2)}
          {/* Render right subtree */}
          {renderTree(node?.right, depth + 1, position * 2 + 1)}
        </ul>
      </li>
    );
  };

  return (
    <div className="tree">
      <button className="glass-button" onClick={handleGoBack} disabled={prevWallets.length === 0}>
        Go Back
      </button>
      <ul className="tree-ul">
        {renderTree(treeData)} {/* Render the entire tree */}
      </ul>
    </div>
  );
};

export default Test;
