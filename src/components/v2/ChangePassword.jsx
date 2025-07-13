import "react-toastify/dist/ReactToastify.css";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";

const ChangePassword = (props) => {
    return (
        <div className="animation-fadeIn">
            <div className="form-container" style={{ padding: "0" }}>
                <div className="input-field-2 ml-[15px]">
                    <label className="text-white text-[14px]" htmlFor="amount">Current Password</label>
                    <input className="bg-[#76807A80] text-white outline-none px-[20px] py-[7px]" type="text" id="amount" placeholder="Enter current password" />
                </div>
                <div className="input-field-2  ml-[15px]">
                    <label className="text-white text-[14px]" htmlFor="wallet">New Password</label>
                    <input className="bg-[#76807A80] text-white outline-none px-[20px] py-[7px]" type="text" id="wallet" placeholder="Enter new password" />
                </div>
                <div className="input-field-2  ml-[15px]">
                    <label className="text-white text-[14px]" htmlFor="network">Confirm Password</label>
                    <input className="bg-[#76807A80] text-white outline-none px-[20px] py-[7px]" type="text" id="network" placeholder="Confirm new password" />
                </div>

                <div className="button-slide-to-confirm">
                    <SwipeToConfirmV3 action={props.action} handleSwipe={props.handleSwipe} />
                </div>
            </div>
        </div>
    )
}

export default ChangePassword;