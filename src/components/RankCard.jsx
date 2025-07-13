import rank0 from "../assets/rank/0.png";
import rank1 from "../assets/rank/1.png";
import rank2 from "../assets/rank/2.png";
import rank3 from "../assets/rank/3.png";
import rank4 from "../assets/rank/4.png";
import rank5 from "../assets/rank/5.png";
import rank6 from "../assets/rank/6.png";
import rank7 from "../assets/rank/7.png";
import rank8 from "../assets/rank/8.png";

// Create an array of the rank images
const rankImages = [
  rank0,
  rank1,
  rank2,
  rank3,
  rank4,
  rank5,
  rank6,
  rank7,
  rank8,
];

const RankCard = ({ content, rank }) => {
  const formatNumber = (numberString) => {
    // Format the number with commas
    const formattedNumber = new Intl.NumberFormat("en-US").format(numberString);
    return formattedNumber;
  };

  return (
    <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      
        
        {/* Use the rank value to select the appropriate image */}
        {rank > 0 ? <><div className="flex flex-col items-center pb-10"><h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white pt-10">
          VIP {formatNumber(rank)}
        </h5>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {/* VIP {formatNumber(rank)} */}
        </span> <img
          src={rankImages[rank]} // Access the image based on the rank value
          alt={`Rank ${rank-1}`} // Add an alt attribute for accessibility
          className="max-w-[80px] max-h-[80px] min-w-[80px] min-h-[80px]"
        /> </div></> : <></>}
     
    </div>
  );
};

export default RankCard;
