// components/signals/signal-filters.tsx

import { ChangeEvent } from "react";

export interface Filters {
  strategy: string;
  timeframe: string;
  minVolume: number;
}

export interface FilterProps {
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

export function SignalFilters({ filters, onFiltersChange }: FilterProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onFiltersChange({ ...filters, [name]: name === "minVolume" ? Number(value) : value });
  };

  return (
    <div>
      <label>
        Strategy:
        <select name="strategy" value={filters.strategy} onChange={handleChange}>
          <option value="all">All</option>
          <option value="scalping">Scalping</option>
          <option value="dca">DCA</option>
          {/* другие стратегии */}
        </select>
      </label>

      <label>
        Timeframe:
        <select name="timeframe" value={filters.timeframe} onChange={handleChange}>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
          {/* другие таймфреймы */}
        </select>
      </label>

      <label>
        Min Volume:
        <input
          type="number"
          name="minVolume"
          value={filters.minVolume}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
