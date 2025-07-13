import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import Transfer from "./Transfer";
import Balance from "./Balance";
import Swap from "./Swap";

const Transaction = (props) => {
    return (
        <>
            {props.transactionItemView === 1 && <Balance commissionTcis={props.commissionTcis} commissionOmg={props.commissionOmg} commission={props.commission} mortgage={props.mortgage} usdt={props.usdt} tcis={props.tcis} omg={props.omg} action={props.action} handleSwipe={props.handleSwipe} />}
            {props.transactionItemView === 2 && <Withdraw showBalanceTab={props.showBalanceTab} action={props.action} handleSwipe={props.handleSwipe} />}
            {props.transactionItemView === 3 && <Deposit bep20Wallet={props.bep20Wallet} onReceiveQr={props.onReceiveQr} showBalanceTab={props.showBalanceTab} action={props.action} handleSwipe={props.handleSwipe} qr={props.qr} />}
            {props.transactionItemView === 4 && <Transfer showBalanceTab={props.showBalanceTab} action={props.action} handleSwipe={props.handleSwipe} />}
            {props.transactionItemView === 5 && <Swap showBalanceTab={props.showBalanceTab} action={props.action} handleSwipe={props.handleSwipe} />}
        </>
    )
};

export default Transaction;