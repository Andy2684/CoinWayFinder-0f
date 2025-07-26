"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Calendar, Target } from "lucide-react"

interface Framework {
  id: string
  name: string
  description: string
  category: string
  applicability: string
  keyFocus: string[]
  reportingPeriod: string
  controlCount: number
}

interface ComplianceFrameworkOverviewProps {
  frameworks: Framework[]
}

export function ComplianceFrameworkOverview({ frameworks }: ComplianceFrameworkOverviewProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      "Security & Trust": "bg-blue-500",
      "Privacy & Data Protection": "bg-purple-500",
      "Healthcare Privacy": "bg-green-500",
      "Payment Security": "bg-orange-500",
      "Information Security": "bg-red-500",
      Cybersecurity: "bg-indigo-500",
      "Privacy & Consumer Rights": "bg-pink-500",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Compliance Frameworks</h2>
        <p className="text-muted-foreground">Overview of supported regulatory and compliance frameworks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework) => (
          <Card key={framework.id} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  {framework.id}
                </CardTitle>
                <Badge className={`${getCategoryColor(framework.category)} text-white`}>{framework.category}</Badge>
              </div>
              <CardDescription className="font-medium">{framework.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{framework.description}</p>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Applicability
                </h4>
                <p className="text-xs text-muted-foreground">{framework.applicability}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Key Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {framework.keyFocus.map((focus, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Reporting
                  </h4>
                  <p className="text-xs text-muted-foreground">{framework.reportingPeriod}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Controls</h4>
                  <p className="text-xs text-muted-foreground">{framework.controlCount} controls</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Framework Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Comparison</CardTitle>
          <CardDescription>Quick comparison of key characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Framework</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Controls</th>
                  <th className="text-left p-2">Reporting</th>
                  <th className="text-left p-2">Primary Focus</th>
                </tr>
              </thead>
              <tbody>
                {frameworks.map((framework) => (
                  <tr key={framework.id} className="border-b">
                    <td className="p-2 font-medium">{framework.id}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {framework.category}
                      </Badge>
                    </td>
                    <td className="p-2">{framework.controlCount}</td>
                    <td className="p-2">{framework.reportingPeriod}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {framework.keyFocus.slice(0, 2).map((focus, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                        {framework.keyFocus.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{framework.keyFocus.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
