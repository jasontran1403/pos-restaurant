import React from "react";

const CustomCarousel = (props) => {
  const { activeItem, handleActiveCardItem } = props;

  // Dữ liệu giả lập cho các card
  const cards = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    title: `NFT X STARTER ${index + 1}`,
    subtitle: `${50_000 + index * 1_000} EFT`,
    apr: `${(0.4 + index * 0.1).toFixed(1)}% APR daily`,
    price: `${100 + index * 10} EFT (${(18.6 + index * 2).toFixed(2)} USD)`,
    period: "500 days"
  }));

  return (
    <div className="carousel-item">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`${
            activeItem === card.id ? "outside-card-active" : "outside-card"
          }`}
          onClick={() => handleActiveCardItem(card.id)} // Khi click, cập nhật activeItem
        >
          <div className="inside-card">
            <div className="flex flex-col justify-center items-center w-full">
              <span className="text-white text-[8px]">{card.title}</span>
              <h2 className="text-white text-[10px]">{card.subtitle}</h2>
            </div>
            <div className="flex flex-col justify-start items-start w-full pl-2">
              <span className="text-white text-[8px]">{card.period}</span>
              <span className="text-white text-[8px]">{card.apr}</span>
              <h2 className="text-white text-[10px]">{card.price}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomCarousel;
