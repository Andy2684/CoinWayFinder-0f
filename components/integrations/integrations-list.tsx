// components/integrations/integrations-list.tsx
"use client";

import { useEffect, useState } from "react";

interface Integration {
  id: string;
  name: string;
  enabled: boolean;
}

export function IntegrationsList() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    // TODO: fetch real data from your API
    setIntegrations([
      { id: "1", name: "Slack", enabled: true },
      { id: "2", name: "Discord", enabled: false },
      { id: "3", name: "Telegram", enabled: true },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Integrations</h1>
      <ul className="space-y-2">
        {integrations.map((int) => (
          <li
            key={int.id}
            className={`p-4 border rounded flex justify-between items-center ${
              int.enabled ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <span>{int.name}</span>
            <button
              className={`px-3 py-1 rounded ${
                int.enabled ? "bg-red-500 text-white" : "bg-blue-500 text-white"
              }`}
              onClick={() =>
                setIntegrations((prev) =>
                  prev.map((i) =>
                    i.id === int.id ? { ...i, enabled: !i.enabled } : i
                  )
                )
              }
            >
              {int.enabled ? "Disable" : "Enable"}
            </button>
          </li>
        ))}
        {integrations.length === 0 && <li>No integrations found.</li>}
      </ul>
    </div>
  );
}
