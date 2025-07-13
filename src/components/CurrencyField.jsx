import React, { useState, useEffect } from "react";
import { CashStack } from "react-bootstrap-icons";

const pairs = [
    // { id: 1, name: "BTCUSDT", symbol: "BTC" },
    { id: 2, name: "BNBUSDT", symbol: "BNB" },
    { id: 3, name: "TONUSDT", symbol: "TON" },
    // { id: 4, name: "SOLUSDT", symbol: "SOL" },
    { id: 5, name: "XRPUSDT", symbol: "XRP" },
    { id: 6, name: "MCTUSDT", symbol: "MCT" },
    { id: 7, name: "ETHUSDT", symbol: "ETH" },
    { id: 8, name: "KASUSDT", symbol: "KAS" },
];

const CurrencyField = (probs) => {

    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (probs.converted === true) {
            if (isNaN(probs.balance)) {
                setAmount(9999999);
            } else {
                setAmount(probs.balance);
            }
        } else {
            setAmount(probs.sourceAmount);
        }
    }, [probs.sourceAmount]);

    const [selectedSymbol, setSelectedSymbol] = useState("");
    // Cập nhật giá trị mặc định dựa trên probs.converted khi component được render hoặc khi probs.converted thay đổi
    useEffect(() => {
        if (probs.converted) {
            setSelectedSymbol(pairs[0].symbol); // Index 1 -> "BNB"
        } else {
            setSelectedSymbol(pairs[3].symbol); // Index 6 -> "MCT"
        }
    }, [probs.converted]);

    useEffect(() => {
        probs.handleChangeType("source", "MCT"); // Gọi hàm xử lý từ props
        probs.handleChangeType("destination", "BNB"); // Gọi hàm xử lý từ props
    }, []);

    const handleAmountChange = (value) => {
        setAmount(value);
        probs.getSwapPrice(value);
    }

    const handleChange = (field, value) => {
        setAmount(0);
        setSelectedSymbol(value); // Cập nhật state local
        probs.handleChangeType(field, value); // Gọi hàm xử lý từ props
    };


    return (
        <div className="row currencyInput">
            <div className="col-md-6 numberContainer">
                {probs.loading ? (
                    <div className="spinnerContainer">
                        <probs.spinner />
                    </div>
                ) : (
                    <>
                        <input
                            className="currencyInputField"
                            type="text" // Dùng type="text" thay vì "number" để kiểm soát chi tiết hơn
                            placeholder={amount === "" ? "0" : ""} // Xóa số 0 khi người dùng nhập vào
                            value={probs.converted === true ? probs.balance : amount}
                            readOnly={probs.converted || probs.failed}
                            onChange={(e) => {
                                let value = e.target.value;

                                // Thay thế các ký tự không phải số hoặc dấu chấm
                                value = value.replace(/[^0-9.]/g, '');

                                // Nếu đã có dấu chấm rồi thì không cho thêm dấu chấm khác
                                const decimalCount = (value.match(/\./g) || []).length;
                                if (decimalCount > 1) {
                                    value = value.slice(0, -1); // Xóa dấu chấm dư thừa
                                }

                                handleAmountChange(value);
                            }}
                        />

                        <select
                            value={selectedSymbol} // Giá trị hiện tại
                            onChange={(e) => {
                                handleChange(
                                    probs.converted ? "destination" : "source",
                                    e.target.value
                                );
                            }}
                            name="symbols"
                            id="symbol-select"
                        >
                            {pairs
                                
                                .map((pair) => (
                                    <option key={pair.id} value={pair.symbol}>
                                        {pair.symbol}
                                    </option>
                                ))}
                        </select>
                    </>
                )}
            </div>

            {probs.converted === false && <div className="cold-md-6 tokenContainer">
                <div className="balanceContainer">
                    {probs.converted === false ?
                        <button
                            style={{ cursor: "pointer", color: "rgb(14, 190, 221)" }}
                            onClick={() => {
                                if (probs.failed === false) {
                                    probs.handleMax();
                                    setAmount(probs.balance);
                                }
                            }}>
                            MAX
                        </button>
                        : null}
                    <span className="balanceAmount" style={{ color: "rgb(14, 190, 221)" }}>
                        Balance: {probs.balance}
                    </span>
                    {probs.converted === false ?
                        <CashStack
                            style={{ cursor: "pointer", color: "rgb(14, 190, 221)" }}
                            onClick={() => probs.handleSwitchTab(2)} />
                        : null
                    }
                </div>
            </div>}
        </div>
    );
};

export default CurrencyField;
