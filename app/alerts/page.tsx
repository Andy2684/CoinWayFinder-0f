import { PriceAlertManager } from "@/components/alerts/price-alert-manager"

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Price Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Set up intelligent price alerts with multiple trigger conditions and notification methods
        </p>
      </div>
      <PriceAlertManager />
    </div>
  )
}
