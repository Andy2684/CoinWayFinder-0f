"use client";

import { useState } from "react";
import SignalFilters from "@/components/signals/signal-filters";
import { SignalPerformance } from "@/components/signals/signal-performance";
import { SignalAlerts } from "@/components/signals/signal-alerts";
import { CreateSignalDialog } from "@/components/signals/create-signal-dialog";

export default function SignalsPage() {
  const [filters, setFilters] = useState<string[]>([]);

  const handleFiltersChange = (newFilters: string[]) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Signals</h1>
        <CreateSignalDialog />
      </div>
      <SignalFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <SignalPerformance />
      <SignalAlerts />
    </div>
  );
}
