import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const MultiTabDetectContext = createContext();

export const MultiTabDetectProvider = ({ children }) => {
  const [multiTabDetect, setMultiTabDetect] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("tab-control");

    // Khi tab mở, gửi thông điệp "new-tab"
    channel.postMessage("new-tab");

    // Lắng nghe thông điệp từ các tab khác
    channel.addEventListener("message", (event) => {
      if (event.data === "new-tab") {
        setMultiTabDetect(true);
      } else {
        setMultiTabDetect(false);
      }
    });

    return () => {
      // Đóng kênh khi tab đóng
      channel.close();
    };
  }, []);

  return (
    <MultiTabDetectContext.Provider value={{ multiTabDetect }} >
      {children}
    </MultiTabDetectContext.Provider>
  );
};
