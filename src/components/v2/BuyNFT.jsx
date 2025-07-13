import React, { useState } from "react";
import CustomCarousel from "./CustomCarousel";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";

const BuyNFT = (props) => {
    const [activeItem1, setActiveItem1] = useState(null); // activeItem cho carousel 1
    const [activeItem2, setActiveItem2] = useState(null); // activeItem cho carousel 2

    // Hàm cập nhật activeItem cho carousel 1
    const handleActiveCardItem1 = (itemId) => {
        setActiveItem1(itemId); // Cập nhật activeItem cho carousel 1
        setActiveItem2(null); // Bỏ chọn tất cả item trong carousel 2
    };

    // Hàm cập nhật activeItem cho carousel 2
    const handleActiveCardItem2 = (itemId) => {
        setActiveItem2(itemId); // Cập nhật activeItem cho carousel 2
        setActiveItem1(null); // Bỏ chọn tất cả item trong carousel 1
    };

    return (
        <div className="animation-fadeIn">
            {/* <div className="form-container" style={{ padding: 0 }}>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="wallet">
                        Select Wallet
                    </label>
                    <div className="relative inline-block w-full">
                        <select className="bg-[#FFFFFFB2] text-[#2C2D2C] text-[14px] px-[20px] py-[7px] outline-none w-full appearance-none">
                            <option className="text-[#2C2D2C]" value="eftWallet">
                                EFT Wallet
                            </option>
                        </select>

                        <img
                            src="/down.png"
                            className="absolute right-[10px] top-1/2 transform -translate-y-1/2 w-[26px] h-[24px] pointer-events-none"
                            alt="Dropdown Icon"
                        />
                    </div>
                </div>
            </div>

            <CustomCarousel
                activeItem={activeItem1}
                handleActiveCardItem={handleActiveCardItem1} // Chỉ cập nhật activeItem cho carousel 1
            />

            <CustomCarousel
                activeItem={activeItem2}
                handleActiveCardItem={handleActiveCardItem2} // Chỉ cập nhật activeItem cho carousel 2
            />

            <div className="button-slide-to-confirm mt-[-5px]">
                <SwipeToConfirmV3 action={props.action} handleSwipe={props.handleSwipe} />
            </div> */}
        </div>
    );
};

export default BuyNFT;
