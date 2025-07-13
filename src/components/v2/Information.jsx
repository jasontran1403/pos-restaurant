import SwipeToConfirmV3 from "./SwipeToConfirmV3";

const Information = (props) => {
    return (
        <div className="animation-fadeIn">
            <div className="form-container" style={{ padding: "0" }}>
                <h3 className="text-white ml-[-10px] mb-[-10px]">Provide your personal information</h3>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="amount">First Name</label>
                    <input className="bg-[#76807A80] text-white px-[20px] py-[7px] outline-none" type="text" id="amount" placeholder="Enter your first name" />
                </div>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="wallet">Last Name</label>
                    <input className="bg-[#76807A80] text-white px-[20px] py-[7px] outline-none" type="text" id="wallet" placeholder="Enter your last name" />
                </div>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="network">Country</label>
                    <div className="relative inline-block w-full">
                        {/* Select Field */}
                        <select className="bg-[#FFFFFFB2] text-[#2C2D2C] text-[14px] px-[20px] py-[7px] outline-none w-full appearance-none">
                            <option className="text-[#2C2D2C]" value="AFGHANISTAN">AFGHANISTAN</option>
                        </select>

                        <img
                            src="/down.png"
                            className="absolute right-[10px] top-1/2 transform -translate-y-1/2 w-[26px] h-[24px] pointer-events-none"
                            alt="Dropdown Icon"
                        />
                    </div>
                </div>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="toAddress">ID / Passport</label>
                    <input className="bg-[#76807A80] text-white px-[20px] py-[7px] outline-none" type="text" id="toAddress" placeholder="Enter your ID / Passport" />
                </div>
                <div className="button-slide-to-confirm">
                    <SwipeToConfirmV3 action={props.action} handleSwipe={props.handleSwipe} />
                </div>
            </div>
        </div>
    )
}

export default Information;