import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import { API_ENDPOINT } from "../constants";
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";

const DirectTreeView = () => {
  const { multiTabDetect } = useContext(MultiTabDetectContext);

  const [expandedNodes, setExpandedNodes] = useState({});
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [walletAddress] = useState(localStorage.getItem("walletAddress")); // Fetching from local storage
  const [access_token] = useState(localStorage.getItem("access_token")); // Fetching from local storage

  useEffect(() => {
    const fetchData = async () => {
      await fetchTreeData(walletAddress); // Fetch the tree data on component mount
    };

    fetchData();
  }, []);

  const fetchTreeData = async (address) => {
    if (multiTabDetect) {
      toast.error("Multiple instances detected, please close all others window and reload the page!", {
        position: "top-right",
        autoClose: 1500,
      });
      return;
    }

    setLoading(true); // Set loading to true when starting to fetch
    let config = {
      method: "get",
      url: `${API_ENDPOINT}auth/direct-tree/${address}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "ngrok-skip-browser-warning": "69420",
      },
    };

    try {
      const response = await Axios.request(config);
      setTreeData(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Please try again later", {
        position: "top-right",
        autoClose: 1500,
      });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  const handleToggleExpand = (walletAddress) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [walletAddress]: !prev[walletAddress],
    }));
  };

  const renderTree = (node) => (
    <div key={node.walletAddress} className="ml-1 mb-2">
      <div className={`flex items-center space-x-2 cursor-pointer ${expandedNodes[node.walletAddress] ? "bg-blue-100" : ""}`}>
        {node.listF1 && node.listF1.length > 0 && (
          <button
            onClick={() => handleToggleExpand(node.walletAddress)}
            className="focus:outline-none text-blue-500 font-bold"
          >
            {expandedNodes[node.walletAddress] ? (
              <span className="text-xl">−</span>
            ) : (
              <span className="text-xl">+</span>
            )}
          </button>
        )}
        <span className="text-lg font-semibold">
          {node.displayName} ({new Intl.NumberFormat("en-US").format(node.sales)}) ({new Intl.NumberFormat("en-US").format(node.teamSales)})
        </span>
      </div>

      {expandedNodes[node.walletAddress] && node.listF1 && (
        <div className="ml-6 mt-2">
          {node.listF1.map((childNode) => renderTree(childNode))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {loading ? ( // Show loading spinner if loading is true
          <div className="flex items-center justify-center" style={{ height: '39svw' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          treeData && renderTree(treeData) // Render the tree structure
        )}
      </div>
    </div>
  );
};

export default DirectTreeView;
