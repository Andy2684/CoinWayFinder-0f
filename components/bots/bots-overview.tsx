// components/bots/bots-overview.tsx

"use client";

import { useEffect, useState } from "react";

interface BotStat {
  id: string;
  name: string;
  value: number;
  changeType: "positive" | "neutral"; // Removed 'negative'
  changePercent: number;
}

export function BotsOverview() {
  const [stats, setStats] = useState<BotStat[]>([]);

  useEffect(() => {
    // Здесь ваш код для загрузки статистики, пример-заглушка:
    setStats([
      { id: "1", name: "Bot A", value: 1200, changeType: "positive", changePercent: 5 },
      { id: "2", name: "Bot B", value: 950, changeType: "neutral", changePercent: 0 },
      // …
    ]);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        // Определяем класс цвета в зависимости от changeType
        const colorClass =
          stat.changeType === "positive"
            ? "border-green-500/20 text-green-400"
            : "border-gray-500/20 text-gray-400";

        return (
          <div
            key={stat.id}
            className={`p-4 border rounded-lg ${colorClass}`}
          >
            <h3 className="text-lg font-semibold">{stat.name}</h3>
            <p className="text-2xl">{stat.value}</p>
            <p className="text-sm">
              {stat.changePercent > 0 && "+"}
              {stat.changePercent}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
