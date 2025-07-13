import React, { useState } from "react";

const SwipeToConfirmV3 = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);

    const handleSwipe = () => {
        // Trigger action
        props.handleSwipe();

        // Set the action state to true
        setActionCompleted(true);

        // Reset the action after 1.5 seconds (1500ms)
        setTimeout(() => {
            setActionCompleted(false);
        }, 3000);
    };

    return (
        <button
            disabled={actionCompleted}
            className={`btn ${actionCompleted ? "action" : ""}`}
            onClick={handleSwipe}
        >
            <p style={{ color: "white", fontSize: "12px" }}>Touch to confirm</p> <span><img src="/icons/arrow.png" alt="Referral" className="w-[20px] h-[20px] pt-[5px]" /></span>
        </button>
    );
};

export default SwipeToConfirmV3;
