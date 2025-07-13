import { useState } from "react";
import SwipeToConfirmWithdrawal from "./SwipeToConfirmWithdrawal";
import SwipeToUpdateReferral from "./SwipeToUpdateReferral";

const Register = (props) => {
  const [referralCode, setRefCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <div
      className="show mx-auto my-auto h-full"
    >
      <div className="form-container flex justify-center items-center h-full">
        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Referral Code
          </label>
          <input
            value={referralCode}
            onChange={(e) => {
              setRefCode(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter referral code ..."
          />
        </div>

        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter display name for internal transaction ..."
          />
        </div>

        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Email Address
          </label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter email address verify ..."
          />
        </div>

        <div className="input-field-2">
          <label className="text-white text-[14px]" htmlFor="amount">
            Phone Number
          </label>
          <input
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
            }}
            className="bg-[#76807A80] px-[20px] py-[7px] outline-none"
            type="text"
            id="amount"
            placeholder="Enter phone number for verify ..."
          />
        </div>

        <div
          className="button-slide-to-confirm"
          style={{ marginTop: "-10px", marginBottom: "-30px" }}
        >
          <SwipeToUpdateReferral
            displayName={displayName}
            referralCode={referralCode}
            email={email}
            phoneNumber={phoneNumber}
            action={props.action}
            handleSwipe={props.handleSwipe}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
