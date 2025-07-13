import { useState } from "react";
import SwipeToConfirmDisplayName from "./SwipeToConfirmDisplayName";

const TwoFA = (props) => {
  const [displayName, setDisplayName] = useState(props.displayName);
  return (
    <div
      className="animation-fadeIn"
      style={{ marginBottom: "0", paddingBottom: "10px" }}
    >
      <div className="form-container">
        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => {
              if (e.target.value.length <= 8) {
                setDisplayName(e.target.value);
              }
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter display name (maximum is 8 character length)"
            maxLength={8}
          />
        </div>

        <div
          className="button-slide-to-confirm"
          style={{ marginTop: "-10px", marginBottom: "-30px" }}
        >
          <SwipeToConfirmDisplayName
            displayName={displayName}
            action={props.action}
            handleSwipe={props.handleSwipe}
          />
        </div>
      </div>
    </div>
  );
};

export default TwoFA;
