import React, { useState, useContext } from "react";
import { Copy } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2/dist/sweetalert2.js";
import 'sweetalert2/src/sweetalert2.scss';
import { MultiTabDetectContext } from "../components/MultiTabDetectContext";
import { API_ENDPOINT } from "../constants";
import axios from "axios";

const pairs = [
    // { id: 1, name: "BTCUSDT", symbol: "BTC" },
    // { id: 2, name: "BNBUSDT", symbol: "BNB" },
    // { id: 3, name: "TONUSDT", symbol: "TON" },
    // { id: 4, name: "SOLUSDT", symbol: "SOL" },
    // { id: 5, name: "XRPUSDT", symbol: "XRP" },
    { id: 6, name: "MCTUSDT", symbol: "MCT" },
];

const DepositField = (probs) => {
    const { multiTabDetect } = useContext(MultiTabDetectContext);

    const [selectedSymbol, setSelectedSymbol] = useState("");

    const handleChange = (value) => {
        setSelectedSymbol(value); // Cập nhật state local
        probs.handleChangeDepositType(value); // Gọi hàm xử lý từ props
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(probs.wallet) // API clipboard
            .then(() => {
                toast.success("Copied to clipboard!", {
                    position: "top-right",
                    autoClose: 1500,
                });
            })
            .catch((error) => {
                toast.error("Failed!", {
                    position: "top-right",
                    autoClose: 1500,
                });
            });

    }

    const handleDeposit = () => {
        if (multiTabDetect) {
            toast.error("Multiple instances detected, please close all others window and reload the page!", {
                position: "top-right",
                autoClose: 1500,
            });
            return;
        }

        if (probs.qrInfo === false && selectedSymbol === "") return;

        Swal.fire({
            title: 'Confirm deposit',
            text: `Please deposit to the corresponding network you selected; otherwise, your assets will be lost!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, i deposited!',
            cancelButtonText: 'No, i havent deposited',
            reverseButtons: true,
            customClass: {
                confirmButton: 'custom-confirm-button', // Custom class for confirm button
                cancelButton: 'custom-cancel-button',   // Custom class for cancel button
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                let data = JSON.stringify({
                    walletAddress: localStorage.getItem("walletAddress"),
                    walletType: selectedSymbol,
                });

                let config = {
                    method: "post",
                    url: `${API_ENDPOINT}management/deposit-swap`,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        "ngrok-skip-browser-warning": "69420",
                    },
                    data: data,
                };

                axios.request(config)
                    .then((response) => {
                        // Assuming response.data contains the image URL or base64 string
                        toast.success("Confirm deposit success", {
                            position: "top-right",
                            autoClose: 1500,
                            onClose: () => {
                                window.location.reload();
                            }
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        toast.error("Please try again later", {
                            position: "top-right",
                            autoClose: 1500,
                        });
                    });
            }
        })
    };

    return (
        <div className="row currencyInput">
            <div className="col-md-6 numberContainer">
                {probs.loading ? (
                    <div className="spinnerContainer">
                        <probs.spinner />
                    </div>
                ) : (
                    <div className="depositContainer">
                        <select
                            className="currencyInputField"
                            value={selectedSymbol} // Giá trị hiện tại
                            onChange={(e) => {
                                handleChange(e.target.value);
                            }}
                            name="symbols"
                        >
                            {pairs.map((pair) => (
                                <option key={pair.id} value={pair.symbol}>
                                    {pair.symbol}
                                </option>
                            ))}
                        </select>
                        {probs.qrInfo === true ?
                            <div className="deposit-info">
                                <img src={probs.qrCode} alt="" />
                                <div className="wallet-info">
                                    Wallet Address: <input style={{ paddingLeft: "15px" }} type="text" value={probs.wallet} readOnly disabled />
                                    <Copy style={{ cursor: "pointer" }} onClick={() => handleCopy()} />
                                </div>
                            </div>
                            : null
                        }
                    </div>
                )}

            </div>
            <div className="mt-[20px]">
                <button className="button-64" role="button" onClick={handleDeposit}><span className="text">Confirm</span></button>
            </div>
        </div>
    );
};

export default DepositField;
