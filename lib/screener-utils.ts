export interface ScreenerFilter {
  priceRange?: [number, number];
  marketCapRange?: [number, number];
  volumeRange?: [number, number];
  change24hRange?: [number, number];
  rsiRange?: [number, number];
  volatilityRange?: [number, number];
  sectors?: string[];
  exchanges?: string[];
  watchlistOnly?: boolean;
}

export interface ScreenerColumn {
  key: string;
  label: string;
  type: "text" | "number" | "currency" | "percentage";
  sortable: boolean;
}

export const defaultColumns: ScreenerColumn[] = [
  { key: "symbol", label: "Symbol", type: "text", sortable: true },
  { key: "name", label: "Name", type: "text", sortable: true },
  { key: "price", label: "Price", type: "currency", sortable: true },
  { key: "change24h", label: "24h Change", type: "percentage", sortable: true },
  { key: "change7d", label: "7d Change", type: "percentage", sortable: true },
  { key: "marketCap", label: "Market Cap", type: "currency", sortable: true },
  { key: "volume24h", label: "Volume 24h", type: "currency", sortable: true },
  { key: "rank", label: "Rank", type: "number", sortable: true },
  { key: "sector", label: "Sector", type: "text", sortable: true },
  { key: "exchange", label: "Exchange", type: "text", sortable: true },
  { key: "rsi", label: "RSI", type: "number", sortable: true },
  { key: "macd", label: "MACD", type: "number", sortable: true },
  {
    key: "volatility",
    label: "Volatility",
    type: "percentage",
    sortable: true,
  },
  { key: "beta", label: "Beta", type: "number", sortable: true },
];

export const formatValue = (
  value: any,
  type: ScreenerColumn["type"],
): string => {
  if (value === null || value === undefined) return "-";

  switch (type) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case "percentage":
      return `${value.toFixed(2)}%`;

    case "number":
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
      return value.toFixed(2);

    default:
      return String(value);
  }
};

export const exportToCSV = (
  data: any[],
  columns: string[],
  filename = "screener-export.csv",
) => {
  const headers = columns.join(",");
  const rows = data
    .map((item) =>
      columns
        .map((col) => {
          const value = item[col];
          // Escape commas and quotes in CSV
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    )
    .join("\n");

  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const saveScreenerConfig = (config: ScreenerFilter, name: string) => {
  const savedConfigs = JSON.parse(
    localStorage.getItem("screenerConfigs") || "{}",
  );
  savedConfigs[name] = config;
  localStorage.setItem("screenerConfigs", JSON.stringify(savedConfigs));
};

export const loadScreenerConfig = (name: string): ScreenerFilter | null => {
  const savedConfigs = JSON.parse(
    localStorage.getItem("screenerConfigs") || "{}",
  );
  return savedConfigs[name] || null;
};

export const getSavedConfigs = (): Record<string, ScreenerFilter> => {
  return JSON.parse(localStorage.getItem("screenerConfigs") || "{}");
};
