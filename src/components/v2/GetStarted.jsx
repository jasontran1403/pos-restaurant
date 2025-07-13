import React, { useState, useContext } from "react";
import TrustWalletConnect from "../TrustWalletConnect"; // Import component kết nối ví
import { WalletContext } from "../WalletContext";

const GetStarted = (props) => {
    const { isConnected } = useContext(WalletContext);
    const [actionCompleted, setActionCompleted] = useState(false);

    const handleGetStarted = () => {
        setActionCompleted(true);

        // Reset the action after 1.5 seconds (1500ms)
        setTimeout(() => {
            setActionCompleted(false);
        }, 3000);

    };

    return (
        <>
            <button
                className="btn-logout btn-getstarted"
                onClick={handleGetStarted}
            >
                {!isConnected && <TrustWalletConnect label={"Get Started >>>"} />}
                {/* <span><img src="/icons/arrow.png" alt="Referral" className="w-[25px] h-[25px] pt-[5px]" />
                </span> */}
            </button>
        </>
    );
};

export default GetStarted;
