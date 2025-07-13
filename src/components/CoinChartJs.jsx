import {
  Box,
  Button,
  Center,
  CircularProgress,
  Flex,
  Heading,
  Select,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { chartDays } from "../configs/Data";
import { API_ENDPOINT } from "../constants";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale
);

const CoinChartJs = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(7);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${API_ENDPOINT}auth/get-mapchain-token-data`,
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    };

    axios
      .request(config)
      .then((response) => {
        setFlag(true);
        setHistoricData(response.data.prices);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const borderColor = useColorModeValue("#2a8fd3", "#2a8fd3");
  return (
    <Box m="2%" gap="5" className="mct-chart">
      {!historicData || !flag ? (
        <Flex justify="center" align="center">
          <CircularProgress
            isIndeterminate
            color="green.300"
            size="150px"
            thickness={1}
          />
        </Flex>
      ) : (
        <>
          <Line
            data={{
              labels: historicData.map((coin) => {
                let date = new Date(coin[0]);
                let time =
                  date.getHours() > 12
                    ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                    : `${date.getHours()}:${date.getMinutes()} AM`;
                return days === 1 ? time : date.toLocaleDateString();
              }),
              datasets: [
                {
                  data: historicData.map((coin) => coin[1]),
                  borderColor: borderColor,
                  fill: true,
                },
              ],
            }}
            options={{
              elements: {
                point: {
                  radius: 3,
                },
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  mode: 'nearest',
                  intersect: true, // Đặt false để hiển thị tooltip khi hover gần dấu chấm
                  callbacks: {
                    label: function (tooltipItem) {
                      return `Price: $${tooltipItem.dataset.data[tooltipItem.dataIndex]}`;
                    },
                  },
                },
              },
            }}
            
          />
        </>
      )}
    </Box>
  );
};

export default CoinChartJs;
