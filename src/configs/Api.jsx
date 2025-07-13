export const HistoricalChart = (id, days = 365, currency) =>
  `${
    import.meta.env.VITE_BASE_API_URL
  }/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;
