"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export const ActiveBots = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Bots</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Here will be a list of your active bots.</p>
      </CardContent>
    </Card>
  )
}
