import React, { useState } from "react";

const LogoutSwipe = (props) => {
    const [actionCompleted, setActionCompleted] = useState(false);

    const handleSwipeLogout = () => {
        // Trigger action
        props.handleSwipeLogout();

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
            className={`btn-logout ${actionCompleted ? "action-logout" : ""}`}
            onClick={handleSwipeLogout}
        >
            <p style={{ position: "relative", left: "-18%", color: "white", fontSize: "16px" }}>Touch to logout</p> <span><img src="/icons/arrow.png" alt="Referral" className="w-[25px] h-[25px] pt-[5px]" /></span>
        </button>
    );
};

export default LogoutSwipe;
