import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Form2 = ({ code, closeModal }) => {
  const handleCopyAndClose = () => {
    navigator.clipboard.writeText(code);
  
    toast.success("Refcode was copied!", {
      position: "top-center",
      autoClose: 1500
    });
  
    // Delay closing the modal to allow the toast message to be visible
    setTimeout(() => {
      closeModal();
    }, 1500); // Adjust the delay time (in milliseconds) to match the duration of your toast
  };
  

  return (
    <>
      <div className="bg-white shadow-md rounded px-8 pt-8 pb-8 mb-4" style={{ width: "15svw" }}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="sponsorcode"
          >
            Sponsor code
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="sponsorcode"
            type="text"
            placeholder="Sponsor code"
            value={code}
            readOnly={true}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleCopyAndClose}
          >
            Copy and close
          </button>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Form2;
