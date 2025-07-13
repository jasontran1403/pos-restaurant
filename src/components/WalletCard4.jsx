const WalletCard = ({ content, amount, unit, rank, wallet }) => {
  const formatNumber = (numberString) => {
    // Format the number with commas

    const formattedNumber = new Intl.NumberFormat("en-US").format(numberString);

    return formattedNumber;
  };

  return (

    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-col items-center pb-10">
        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white pt-10">
          {content}
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatNumber(amount)} {unit}
        </span>
      </div>
    </div>
  );
};

export default WalletCard;
