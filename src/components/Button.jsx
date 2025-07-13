import React from "react";

const Button = ({ content, styles, handleClick }) => {
  return (
    <button
      onClick={handleClick} // Use the handleClick prop if provided, otherwise default to handle
      type="button"
      className={`py-2 px-3 font-poppins font-medium text-[14px] text-primary bg-blue-gradient rounded-[10px] outline-none ${styles}`}
    >
      {content}
    </button>
  );
};

export default Button;
