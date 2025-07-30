import { RealTimeScreener } from "@/components/screening/real-time-screener"

export default function ScreeningPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Real-Time Market Screening</h1>
        <p className="text-muted-foreground mt-2">
          Advanced cryptocurrency screening with technical analysis and real-time alerts
        </p>
      </div>
      <RealTimeScreener />
    </div>
  )
}
