import React, { useEffect, useRef, useState, useContext } from "react";
import { createChart } from "lightweight-charts";
import { WalletContext } from "../components/WalletContext";
import { ToastContainer, toast } from "react-toastify";
import { useWebSocket } from "../components/WebSocketContext";
import { API_ENDPOINT } from "../constants";
import Axios from "axios";
import { FaClipboard } from "react-icons/fa"; // Import icon sao chép từ react-icons
import Chatbox from "./v2/Chatbox";

const BinanceChart = (props) => {
  const { ws, connected } = useWebSocket();
  const { isConnected, connectWallet, disconnectWallet } =
    useContext(WalletContext);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [betAmount, setBetAmount] = useState(1);
  const [betType, setBetType] = useState(null);
  const [lastBetTime, setLastBetTime] = useState(null);
  const [lastMarker, setLastMarker] = useState(null);
  const [betInfo, setBetInfo] = useState(null);
  const [prevPrice, setPrevPrice] = useState(0);
  const [priceColor, setPriceColor] = useState("text-white"); // Màu mặc định
  const [tooltipData, setTooltipData] = useState(null);
  const [preventMultipleOrder, setPreventMultipleOrder] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [marketChange, setMarketChange] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const address = "UQCcATr2_UP_sgra6q_9MZQoYrJpDrT2OcJH7Z1es6SIejqh";

  const handleCopyClick = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast.success("Copied to clipboard!", {
          position: "top-right",
          autoClose: 1500,
        });
        setCopySuccess(true);
      })
      .catch(err => {
        setCopySuccess(false);
        toast.success("Copied to clipboard!", {
          position: "top-right",
          autoClose: 1500,
        });
      });
  };

  // New state for 24h data
  const [marketData, setMarketData] = useState({
    currentPrice: 0,
    high24h: 0,
    low24h: 0,
    volumeBTC: 0,
    volumeUSDT: 0,
    priceChangePercent: 0,
  });

  useEffect(() => {
    const fetchPastData = () => {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${API_ENDPOINT}auth/get-mapchain-token-data`,
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      };

      Axios
        .request(config)
        .then((response) => {
          const rawData = response.data.prices;

          const formattedData = [];

          for (let i = 0; i < rawData.length; i++) {
            const time = rawData[i][0] / 1000 + 7 * 3600;
            const value = rawData[i][1];

            // Chỉ xử lý nếu time >= 1738688401
            if (time >= 1738688401) {
              const previousClose = formattedData.length === 0 ? value : formattedData[formattedData.length - 1].close;

              formattedData.push({
                time: time,
                open: previousClose,
                high: value,
                low: value,
                close: value,
              });
            }
          }

          setInitialData(formattedData);

          const lastPoint = formattedData[formattedData.length - 1];
          const lastSecondPoint = formattedData[formattedData.length - 2];
          setPriceColor(lastSecondPoint.close > lastPoint.close ? "text-red-400" : "text-green-400");

          const changePercent = ((lastPoint.close - lastSecondPoint.close) / lastSecondPoint.close) * 100;
          const formattedChangePercent = Math.floor(changePercent * 100) / 100;

          setMarketChange(formattedChangePercent);
          setCurrentPrice(lastPoint.close);
        })
        .catch((error) => {
          console.log(error);
        });
    };


    fetchPastData();
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  function defaultTickMarkFormatter(timePoint, tickMarkType, locale) {
    const formatOptions = {};

    switch (tickMarkType) {
      case 0: //TickMarkType.Year:
        formatOptions.year = "numeric";
        break;

      case 1: // TickMarkType.Month:
        formatOptions.month = "short";
        break;

      case 2: //TickMarkType.DayOfMonth:
        formatOptions.day = "numeric";
        break;

      case 3: //TickMarkType.Time:
        formatOptions.hour12 = false;
        formatOptions.hour = "2-digit";
        formatOptions.minute = "2-digit";
        break;

      case 4: //TickMarkType.TimeWithSeconds:
        formatOptions.hour12 = false;
        formatOptions.hour = "2-digit";
        formatOptions.minute = "2-digit";
        formatOptions.second = "2-digit";
        break;

      default:
      // ensureNever(tickMarkType);
    }

    const date =
      timePoint.businessDay === undefined
        ? new Date(timePoint.timestamp * 1000)
        : new Date(
          Date.UTC(
            timePoint.businessDay.year,
            timePoint.businessDay.month - 1,
            timePoint.businessDay.day
          )
        );

    // from given date we should use only as UTC date or timestamp
    // but to format as locale date we can convert UTC date to local date
    const localDateFromUtc = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    );

    return localDateFromUtc.toLocaleString(locale, formatOptions);
  }

  const calculateSMA = (data, period) => {
    let result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      let avg = sum / period;
      result.push({ time: data[i].time, value: avg });
    }
    return result;
  };

  useEffect(() => {
    if (!chartContainerRef.current || initialData.length === 0) return;

    const container = chartContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const getRightOffset = () => (window.innerWidth >= 768 ? 20 : 10);
    const localTimezoneOffset = new Date().getTimezoneOffset() * 60 + 14 * 3600;

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: "solid", color: "rgba(255, 255, 255, 0.1)" },
        textColor: "#ffffff",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#999" },
        horzLines: { color: "#999" },
      },
      timeScale: {
        timeVisible: true,
        borderColor: "#999",
        rightOffset: getRightOffset(),
        tickMarkFormatter: (time, tickMarkType, locale) => {
          return defaultTickMarkFormatter(
            { timestamp: time - localTimezoneOffset },
            tickMarkType,
            locale
          );
        },
      },
      rightPriceScale: {
        borderColor: "#999",
        priceFormat: {
          type: "custom",
          minMove: 0.0001, // 🟢 Đảm bảo di chuyển tối thiểu 4 số thập phân
          formatter: price => price.toFixed(4), // 🟢 Hiển thị 4 chữ số sau dấu thập phân
        },
      }
    });

    // ✅ Cập nhật `priceFormat` cho candleSeries
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "custom",
        minMove: 0.001, // 🟢 Đảm bảo có 4 số thập phân
        formatter: price => price.toFixed(5),
      },
    });

    // ✅ Cập nhật `priceFormat` cho lineSeries
    const mainSeries = chart.addLineSeries({
      priceFormat: {
        type: "custom",
        minMove: 0.1, // 🟢 5 số thập phân
        formatter: price => price.toFixed(5),
      },
    });

    candleSeries.setData(initialData);

    const SECONDS_IN_14_DAYS = 30 * 24 * 3600;

    if (initialData.length > 0) {
      const lastTime = initialData[initialData.length - 1].time;
      const from = lastTime - SECONDS_IN_14_DAYS;
      const to = lastTime;

      chart.timeScale().setVisibleRange({ from, to });
    }

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // 🟢 Lắng nghe sự kiện hover để lấy dữ liệu nến
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.seriesData) {
        setTooltipData(null);
        return;
      }

      const priceData = param.seriesData.get(candleSeries);
      if (!priceData) {
        setTooltipData(null);
        return;
      }

      const date = new Date(priceData.time * 1000);
      const utcTime = date.toISOString().replace("T", " ").split(".")[0];

      setTooltipData({
        time: utcTime, // 🟢 Hiển thị UTC
        open: priceData.open.toFixed(4),
        high: priceData.high.toFixed(4),
        low: priceData.low.toFixed(4),
        close: priceData.close.toFixed(4),
      });
    });

    return () => {
      chart.remove();
    };
  }, [loading]);


  const hasShownConnectionToast = useRef(false);
  const isMountedRef = useRef(false);

  // useEffect(() => {
  //   if (!ws) {
  //     return;
  //   }

  //   isMountedRef.current = true;

  //   const connectionTimer = setTimeout(() => {
  //     if (
  //       ws &&
  //       ws.readyState === WebSocket.OPEN &&
  //       !hasShownConnectionToast.current
  //     ) {
  //       hasShownConnectionToast.current = true;
  //     }
  //   }, 1200);

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     if (data.message) {
  //     } else if (data.ticketId) {
  //     } else if (data.result) {
  //     } else if (Array.isArray(data)) {
  //     } else {
  //       if (!isMountedRef.current) return;
  //       const kline = data.k;
  //       const newCandle = {
  //         time: kline.t / 1000 + 7 * 3600,
  //         open: parseFloat(0.16 + (kline.o % 1000) / 1000 * (0.17 - 0.16)),
  //         high: parseFloat(0.16 + (kline.h % 1000) / 1000 * (0.17 - 0.16)),
  //         low: parseFloat(0.16 + (kline.l % 1000) / 1000 * (0.17 - 0.16)),
  //         close: parseFloat(0.16 + (kline.c % 1000) / 1000 * (0.17 - 0.16)),
  //       };

  //       // Update market data
  //       setMarketData((prev) => ({
  //         ...prev,
  //         currentPrice: parseFloat(kline.c),
  //       }));

  //       setInitialData((prevData) => {
  //         if (
  //           prevData.length > 0 &&
  //           prevData[prevData.length - 1].time === newCandle.time
  //         ) {
  //           return [...prevData.slice(0, -1), newCandle];
  //         } else {
  //           return [...prevData, newCandle];
  //         }
  //       });

  //       candleSeriesRef.current?.update(newCandle);

  //       if (lastMarker && lastMarker.time === newCandle.time) {
  //         candleSeriesRef.current?.setMarkers([lastMarker]);
  //       }
  //     }
  //   };

  //   return () => {
  //     if (ws & ws.close) {
  //       ws.close();
  //     }
  //     isMountedRef.current = false;
  //     clearTimeout(connectionTimer);
  //   };
  // }, [ws]);

  const [listBet, setListBet] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [betInfo]);

  const seconds = currentTime.getSeconds();
  const isBettingPhase = seconds >= 0 && seconds <= 50;
  const timerColor = isBettingPhase ? "#26a69a" : "#ef5350";

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (now.getSeconds() === 0) {
        setBetType(null);
        setLastBetTime(null);
        if (candleSeriesRef.current) {
          candleSeriesRef.current.setMarkers([]);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatSmallNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    }).format(number);
  };

  const formatLargeNumber = (num, digits) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find((item) => num >= item.value);
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  };

  return (
    <div
      style={{
        width: "95svw",
        height: "70svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Căn giữa theo chiều dọc
        alignItems: "center", // Căn giữa theo chiều ngang
      }}
    >
      <div className="animatedIn market-details">
        <div className="details-item">
          <div className="market-data-item">
            <p className="text-[24px]">MCTUSDT</p>
            <span className={`text-[20px] ${priceColor}`}>
              {formatSmallNumber(currentPrice)}
            </span>
            <p
              className={`${marketChange > 0
                ? "text-green-500"
                : "text-red-500"
                } text-[14px]`}
            >
              {marketChange}%
            </p>
          </div>
        </div>

        <div className="details-item">
          <div className="flex flex-col sm:flex-row justify-start items-start w-full sm:w-auto">
            <div className="flex flex-col w-full sm:w-auto">
              <p className="text-[24px]">Burn wallet address</p>
              <div className="flex items-center w-full sm:w-auto">
                <p className="text-[14px] italic">
                  {window.innerWidth < 414
                    ? `${address.slice(0, 10)}...${address.slice(-10)}`
                    : address}
                </p>
                <button
                  onClick={handleCopyClick}
                  className="text-white rounded text-sm sm:text-base ml-[10px]"
                >
                  <FaClipboard size={16} /> {/* Hiển thị icon sao chép */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div
        className="binance-chart"
        style={{ marginTop: "20px" }}
        ref={chartContainerRef}
      >
        {tooltipData && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 10,
              background: "transparent",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              pointerEvents: "none",
              zIndex: "999999",
            }}
          >
            {/* <div style={{ display: "flex", gap: "5px" }}>
              <span>H: {tooltipData.high}</span>
              <span>L: {tooltipData.low}</span>
              <span>O: {tooltipData.open}</span>
              <span>C: {tooltipData.close}</span>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default BinanceChart;
