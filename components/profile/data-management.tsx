"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Trash2, HardDrive, Archive, Shield, Clock, CheckCircle } from "lucide-react"

export function DataManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const storageUsage = {
    total: 10, // GB
    used: 2.3, // GB
    percentage: 23,
  }

  const dataCategories = [
    {
      id: "trades",
      name: "Trading Data",
      description: "All your trade history, orders, and execution data",
      size: "850 MB",
      records: "12,450 trades",
      lastBackup: "2024-01-14",
    },
    {
      id: "bots",
      name: "Bot Configurations",
      description: "Trading bot settings, strategies, and performance data",
      size: "125 MB",
      records: "15 bots",
      lastBackup: "2024-01-14",
    },
    {
      id: "signals",
      name: "Signal Data",
      description: "Custom signals, alerts, and notification history",
      size: "95 MB",
      records: "89 signals",
      lastBackup: "2024-01-13",
    },
    {
      id: "portfolio",
      name: "Portfolio Data",
      description: "Portfolio history, allocations, and performance metrics",
      size: "180 MB",
      records: "Daily snapshots",
      lastBackup: "2024-01-14",
    },
    {
      id: "analytics",
      name: "Analytics Data",
      description: "Market analysis, reports, and custom dashboards",
      size: "320 MB",
      records: "Various reports",
      lastBackup: "2024-01-12",
    },
    {
      id: "settings",
      name: "Account Settings",
      description: "Profile information, preferences, and configurations",
      size: "5 MB",
      records: "User data",
      lastBackup: "2024-01-15",
    },
  ]

  const retentionPolicies = [
    {
      category: "Trading Data",
      period: "7 years",
      reason: "Regulatory compliance",
      canModify: false,
    },
    {
      category: "Bot Performance",
      period: "2 years",
      reason: "Performance analysis",
      canModify: true,
    },
    {
      category: "Activity Logs",
      period: "1 year",
      reason: "Security auditing",
      canModify: true,
    },
    {
      category: "Analytics Data",
      period: "6 months",
      reason: "Storage optimization",
      canModify: true,
    },
  ]

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleExportData = async () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one data category to export.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Export Started",
        description: `Exporting ${selectedCategories.length} data categories. You'll receive an email when ready.`,
      })

      setSelectedCategories([])
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to start data export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportData = () => {
    // In a real app, this would open a file picker
    toast({
      title: "Import Feature",
      description: "Data import functionality will be available soon.",
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    toast({
      title: "Data Deleted",
      description: "Selected data category has been permanently deleted.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
          <CardDescription>Your current data storage utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Used Storage</span>
              <span className="text-gray-400">
                {storageUsage.used} GB / {storageUsage.total} GB
              </span>
            </div>
            <Progress value={storageUsage.percentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{storageUsage.used} GB</p>
                <p className="text-sm text-gray-400">Used</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {(storageUsage.total - storageUsage.used).toFixed(1)} GB
                </p>
                <p className="text-sm text-gray-400">Available</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{storageUsage.percentage}%</p>
                <p className="text-sm text-gray-400">Utilized</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download your data for backup or migration purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {dataCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-400">{category.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{category.size}</span>
                      <span>{category.records}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last backup: {category.lastBackup}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.size}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-600">
            <div className="text-sm text-gray-400">{selectedCategories.length} categories selected</div>
            <Button
              onClick={handleExportData}
              disabled={loading || selectedCategories.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Exporting..." : "Export Selected"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>Import data from previous exports or other platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Import Your Data</h3>
            <p className="text-gray-400 text-sm mb-4">Upload exported data files to restore your information</p>
            <Button onClick={handleImportData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Supported Formats</h4>
                <ul className="text-sm text-blue-200 mt-1 space-y-1">
                  <li>• JSON exports from CoinWayFinder</li>
                  <li>• CSV files for trading data</li>
                  <li>• ZIP archives containing multiple data types</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Data Retention Policies
          </CardTitle>
          <CardDescription>How long we keep different types of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {retentionPolicies.map((policy, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{policy.category}</h4>
                  <p className="text-sm text-gray-400">{policy.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {policy.period}
                  </Badge>
                  {policy.canModify ? (
                    <Button variant="outline" size="sm">
                      Modify
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Data Deletion
          </CardTitle>
          <CardDescription>Permanently delete specific data categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium">Permanent Deletion</h4>
                <p className="text-sm text-red-200 mt-1">
                  Deleted data cannot be recovered. Please export important data before deletion.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dataCategories
              .filter((cat) => !["trades", "settings"].includes(cat.id))
              .map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-400">
                      {category.size} • {category.records}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ))}
          </div>

          <div className="text-sm text-gray-400 bg-slate-700/30 rounded-lg p-3">
            <strong>Note:</strong> Trading data and account settings cannot be deleted due to regulatory requirements
            and platform functionality.
          </div>
        </CardContent>
      </Card>

      {/* Backup Status */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Backup Status
          </CardTitle>
          <CardDescription>Automatic backup information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-400">Daily backups of critical data</p>
              </div>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Enabled
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-400">Daily</p>
                <p className="text-sm text-gray-400">Frequency</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">30 days</p>
                <p className="text-sm text-gray-400">Retention</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-400">Encrypted</p>
                <p className="text-sm text-gray-400">Security</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">2024-01-15</p>
                <p className="text-sm text-gray-400">Last Backup</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
