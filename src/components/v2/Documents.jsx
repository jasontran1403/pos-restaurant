import React, { useState } from "react";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";

const Documents = (props) => {
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);

    const handleFileChange = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            if (side === "front") {
                setFrontImage(fileUrl);
            } else if (side === "back") {
                setBackImage(fileUrl);
            }
        }
    };

    return (
        <div className="animation-fadeIn">
            <div className="form-container" style={{ padding: "0" }}>
                <h3 className="text-white ml-[-10px] mb-[-10px]">Provide identity verification documents</h3>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="front">
                        Please upload the front side of your ID/Passport
                    </label>
                    <div
                        className="front-container"
                        onClick={() => document.getElementById("front-input").click()}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={frontImage || "/front.png"}
                            alt="Front"
                            className={frontImage ? "image-document" : ""}
                        />
                    </div>
                    <input
                        id="front-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "front")}
                    />
                </div>
                <div className="input-field">
                    <label className="text-white text-[14px]" htmlFor="back">
                        Please upload the back side of your ID/Passport
                    </label>
                    <div
                        className="back-container"
                        onClick={() => document.getElementById("back-input").click()}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={backImage || "/front.png"}
                            alt="Back"
                            className={backImage ? "image-document" : ""}
                        />
                    </div>
                    <input
                        id="back-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "back")}
                    />
                </div>
                <div className="button-slide-to-confirm">
                    <SwipeToConfirmV3 action={props.action} handleSwipe={props.handleSwipe} />
                </div>
            </div>
        </div>
    );
};

export default Documents;
