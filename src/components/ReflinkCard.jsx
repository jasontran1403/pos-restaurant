import { useState } from "react";
import { FaClipboard } from "react-icons/fa"; // Import an icon for the copy button

const ReflinkCard = ({ content, walletAddress, leftRefCode, rightRefCode }) => {
  const [copiedText, setCopiedText] = useState("");

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text); // Optionally, show feedback for copied text
      setTimeout(() => setCopiedText(""), 2000); // Clear feedback after 2 seconds
    });
  };

  return (
    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      {/* Use flex to arrange content */}
      <div className="flex flex-col justify-between h-full pb-10">
        <div className="flex flex-col items-center pb-10">
          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white pt-10 text-center">
            {content}
          </h5>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
            <span>Personal wallet address:</span>
            <button
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() => copyToClipboard(walletAddress)}
            >
              <FaClipboard />
            </button>
            {copiedText === walletAddress && <span className="ml-2 text-green-500">Copied!</span>}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
            <span>Left:</span>
            <button
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() => copyToClipboard(leftRefCode)}
            >
              <FaClipboard />
            </button>
            {copiedText === leftRefCode && <span className="ml-2 text-green-500">Copied!</span>}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center flex items-center justify-center">
            <span>Right:</span>
            <button
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() => copyToClipboard(rightRefCode)}
            >
              <FaClipboard />
            </button>
            {copiedText === rightRefCode && <span className="ml-2 text-green-500">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflinkCard;
