"use client";

import { useState } from "react";
import { SignalFilters, type FilterProps } from "@/components/signals/signal-filters";
import { SignalFeed } from "@/components/signals/signal-feed";

export default function SignalsPage() {
  const [filters, setFilters] = useState<FilterProps["filters"]>({
    strategy: "all",
    timeframe: "1h",
    minVolume: 0,
  });

  const handleFiltersChange: FilterProps["onFiltersChange"] = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trading Signals</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <SignalFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
        <div className="lg:col-span-3">
          <SignalFeed filters={filters} />
        </div>
      </div>
    </div>
  );
}
