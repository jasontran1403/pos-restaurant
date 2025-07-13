// Disconnect.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"; // or any specific hook provided by the SDK
import TonConnect from '@tonconnect/sdk';




const DisconnectComponent = () => {
    const wallet = useTonWallet();
    const navigate = useNavigate();
    const connect = useTonConnectUI();
    const connector = new TonConnect();

    const handleDisconnect = () => {
        // Clear localStorage or any state management related to wallet connection
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("publicKey");
        localStorage.removeItem("walletStateInit");
        localStorage.removeItem("access_token");
        localStorage.removeItem("is_in_tree");
        localStorage.removeItem("is_lock");
        localStorage.removeItem("ton");
        localStorage.removeItem("bep20");
        localStorage.removeItem("xrp");

        connector.disconnect;

        // Optionally navigate to another path
        navigate('/'); // Redirect to home or any desired path after disconnect
    };

    // Call your function when the component mounts
    React.useEffect(() => {
        handleDisconnect();
    }, []);

    return (
        <div>
        </div>
    );
};

export default DisconnectComponent; // Ensure this is exported
