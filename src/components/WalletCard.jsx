import styles from "../style";
import Button from "./Button";

const WalletCard = ({ width, content, amount, unit }) => {
  // Define the handleSwitchPage function for button actions
  const handleSwitchPage = (action) => {
    window.location.href = `${action}`;
  };


  return (
    <section
      className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}
      style={{ width: width }}
    >
      <div className="flex-1 flex flex-col">
        <h2 className={styles.heading2}>{content}</h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          {amount} {unit}
        </p>
      </div>

      <div className={`${styles.flexCenter} sm:ml-10 ml-0 sm:mt-0 mt-10`}>
        <Button handleClick={() => {handleSwitchPage("deposit")}} content={"Deposit"} />
        <Button handleClick={() => {handleSwitchPage("withdraw")}} content={"Withdraw"} />
        <Button handleClick={() => {handleSwitchPage("transfer")}} content={"Transfer"} />
        <Button handleClick={() => {handleSwitchPage("swap")}} content={"Swap"} />
      </div>
    </section>
  );
};

export default WalletCard;
