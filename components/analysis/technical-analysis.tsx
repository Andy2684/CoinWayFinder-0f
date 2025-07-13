"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartPoint {
  time: string;
  price: number;
}

interface Indicators {
  rsi: number;
  macd: number;
  signal: string;
}

function TechnicalAnalysis() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{selectedCrypto} Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || !indicators ? (
            <Skeleton className="w-full h-24" />
          ) : (
            <ul className="space-y-2 text-sm">
              <li><strong>RSI:</strong> {indicators.rsi}</li>
              <li><strong>MACD:</strong> {indicators.macd}</li>
              <li><strong>Signal:</strong> {indicators.signal}</li>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TechnicalAnalysis;
