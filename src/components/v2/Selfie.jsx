import React, { useState } from "react";
import SwipeToConfirmV3 from "./SwipeToConfirmV3";

const Selfie = (props) => {
    const [selfie, setSelfie] = useState(null);

    const handleFileChange = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            if (side === "selfie") {
                setSelfie(fileUrl);
            }
        }
    };
    
    return (
        <div className="animation-fadeIn">
            <div className="form-container" style={{ padding: "0" }}>
                <h3 className="text-white ml-[-10px] mb-[-5px]">Please upload your selfie photo</h3>
                <div className="input-field">
                    <div className="front-container-selfie"
                        onClick={() => document.getElementById("front-input").click()}
                    >
                        <img
                            src={selfie || "/selfie.png"}
                            alt="Selfie"
                            className={selfie ? "image-document" : ""}
                        />
                    </div>
                    <input
                        id="front-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "selfie")}
                    />
                </div>
                <div className="requirement text-white text-[10px] mt-[0px] mb-[-10px]">
                    <ul>
                        <span>Requirements:</span>
                        <ol style={{ listStyleType: "decimal" }}>
                            <li>
                                <span>The personal information you registered must match the information on the identity document you submit.</span>
                            </li>
                            <li>
                                <span>Uploaded documents must be clear and unedited.</span>
                            </li>
                            <li>
                                <span>A selfie photo must meet the following requirements:</span>
                                <ul style={{ listStyleType: "circle", paddingLeft: "10px" }}>
                                    <li>
                                        <span>Your face should be clearly visible.</span>
                                    </li>
                                    <li>
                                        <span>A sheet of paper with the requested content must be included (document submission time + Ecofusion).</span>
                                        <ul style={{ listStyleType: "circle", paddingLeft: "10px" }}>
                                            <li>
                                                <span>eg: 2024-12-16 Ecofusion</span>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span>Identity verification documents.</span>
                                    </li>
                                </ul>
                            </li>
                        </ol>
                    </ul>


                </div>
                <div className="button-slide-to-confirm">
                    <SwipeToConfirmV3 action={props.action} handleSwipe={props.handleSwipe} />
                </div>

            </div>
        </div>
    )
}

export default Selfie;