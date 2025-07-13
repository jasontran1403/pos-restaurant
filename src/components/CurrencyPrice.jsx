import React from "react";

const pairs = [
    {
        id: 1,
        name: "BTCUSDT",
        symbol: "BTC"
    },
    {
        id: 2,
        name: "BNBUSDT",
        symbol: "BNB"
    },
    {
        id: 3,
        name: "TONUSDT",
        symbol: "TON"
    },
    {
        id: 4,
        name: "SOLUSDT",
        symbol: "SOL"
    },
    {
        id: 5,
        name: "XRPUSDT",
        symbol: "XRP"
    }
]

const CurrencyPrice = probs => {
    return (
        <div className="row currencyInput">
            <div className="cold-md-6 tokenContainer">
                <div className="balanceContainer">
                    {probs.ratio > 0 ? <span style={{ fontStyle: "italic" }}>Rate: 1{probs.from} ~ {probs.ratio}{probs.to}</span> : probs.ratio === -2 ? <span style={{ fontStyle: "italic", color: "red" }}>Invalid swap pairs</span> : <span style={{ fontStyle: "italic", color: "red" }}>Server error</span>}
                </div>
            </div>
        </div>
    )
};

export default CurrencyPrice;