import { useCallback, useEffect, useState } from "react";

// ...другой код

const fetchTechnicalData = useCallback(async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/analysis/technical?symbol=${selectedCrypto}`);
    const data = await response.json();
    setChartData(data.chartData);
    setIndicators(data.indicators);
  } catch (error) {
    console.error("Failed to fetch technical data:", error);
  } finally {
    setLoading(false);
  }
}, [selectedCrypto]);

useEffect(() => {
  fetchTechnicalData();
}, [fetchTechnicalData]);
