const DepositQr = (props) => {
    return (
        <div className="animation-fadeIn pt-[10px] pb-[20px]">
            <div className="input-field-3 mb-[20px]">
                <div className="outside">
                    <div className="qr-code">
                        <img src={props.qrImage} style={{ width: "136px", height: "144px" }} alt="Deposit QR" />
                        <span className="text-[8px] w-[180px] pl-[10px] pt-[20px]">Binance Smart Chain (BEP20)</span>
                        <h2 className="text-[10px]  w-[180px] pl-[10px]">{props.bep20Wallet.substring(0, 10) + "..." + props.bep20Wallet.slice(-10)}</h2>
                        <h2 className="text-[10px]  w-[180px] pl-[10px] pb-[10px]">1,000 USDT</h2>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default DepositQr;