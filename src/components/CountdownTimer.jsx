import React, { useState, useEffect } from "react";

const CountdownTimer = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Giảm 1 giây mỗi lần

      // Nếu còn dưới 30 giây, bật hiệu ứng blink và đổi màu
      if (timeLeft <= 30 && timeLeft > 0) {
        setIsBlinking(true);
      } else {
        setIsBlinking(false);
      }

      return () => clearInterval(timerId); // Xóa interval khi component unmount
    } else {
      // Khi hết thời gian, tự động reload trang
      window.location.reload();
    }
  }, [timeLeft]);

  // Định dạng thời gian: phút:giây
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="clock">
      <h2
        className={`text-white italic ${isBlinking ? "blinking-text" : ""}`}
      >
        {timeLeft > 0 ? `Time left to deposit ${formatTime(timeLeft)}` : "Time's up!"}
      </h2>
    </div>
  );
};

export default CountdownTimer;
