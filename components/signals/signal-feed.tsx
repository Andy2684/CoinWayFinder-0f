// components/signals/signal-feed.tsx

import { Filters } from "./signal-filters";

interface Signal {
  id: string;
  strategy: string;
  timeframe: string;
  volume: number;
  description: string;
}

export interface FeedProps {
  filters: Filters;
}

export function SignalFeed({ filters }: FeedProps) {
  // Здесь должна быть логика фильтрации и отображения сигналов, пример-заглушка:
  const allSignals: Signal[] = [
    { id: "1", strategy: "scalping", timeframe: "1h", volume: 100, description: "Signal A" },
    { id: "2", strategy: "dca", timeframe: "4h", volume: 50, description: "Signal B" },
    // …
  ];

  const filtered = allSignals.filter((s) => {
    return (
      (filters.strategy === "all" || s.strategy === filters.strategy) &&
      s.timeframe === filters.timeframe &&
      s.volume >= filters.minVolume
    );
  });

  return (
    <div>
      {filtered.map((s) => (
        <div key={s.id} className="mb-4 p-4 border rounded">
          <h3>{s.description}</h3>
          <p>Strategy: {s.strategy}</p>
          <p>Timeframe: {s.timeframe}</p>
          <p>Volume: {s.volume}</p>
        </div>
      ))}
      {filtered.length === 0 && <p>No signals match the filters.</p>}
    </div>
  );
}
