"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Database,
  Download,
  Upload,
  Trash2,
  FileText,
  Shield,
  Clock,
  HardDrive,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

export function DataManagement() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const dataCategories = [
    {
      name: "Trading Data",
      description: "All your trades, orders, and transaction history",
      size: "2.3 GB",
      records: "15,247",
      lastBackup: "2024-01-14",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "Bot Configurations",
      description: "Trading bot settings, strategies, and parameters",
      size: "45 MB",
      records: "23",
      lastBackup: "2024-01-14",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: "Portfolio Data",
      description: "Portfolio history, performance metrics, and analytics",
      size: "156 MB",
      records: "8,934",
      lastBackup: "2024-01-14",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "User Preferences",
      description: "Settings, notifications, and customization data",
      size: "12 MB",
      records: "156",
      lastBackup: "2024-01-14",
      icon: <Clock className="h-5 w-5" />,
    },
  ]

  const storageUsage = {
    used: 2.5,
    total: 5.0,
    percentage: 50,
  }

  const handleExportData = async (category?: string) => {
    setIsExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Export Started",
        description: `Your ${category || "complete"} data export has been initiated. You'll receive an email when it's ready.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to start data export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = async () => {
    setIsImporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Import Completed",
        description: "Your data has been successfully imported.",
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check your file and try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearData = async (category: string) => {
    setIsClearing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Data Cleared",
        description: `${category} has been permanently deleted.`,
      })
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
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
          <CardDescription className="text-gray-400">Monitor your data storage and usage limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Used Storage</span>
            <span className="text-white font-medium">
              {storageUsage.used} GB / {storageUsage.total} GB
            </span>
          </div>
          <Progress value={storageUsage.percentage} className="h-3" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{storageUsage.percentage}% used</span>
            <span>{storageUsage.total - storageUsage.used} GB remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Categories */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Categories
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage different types of data stored in your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataCategories.map((category, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-600/50 rounded-lg text-gray-400">{category.icon}</div>
                  <div>
                    <h3 className="text-white font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{category.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{category.size}</span>
                      <span>{category.records} records</span>
                      <span>Last backup: {category.lastBackup}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData(category.name)}
                    disabled={isExporting}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClearData(category.name)}
                    disabled={isClearing}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription className="text-gray-400">Export your data for backup or migration purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-white font-medium mb-2">Complete Export</h3>
              <p className="text-sm text-gray-400 mb-4">
                Export all your data including trades, bots, portfolio, and settings
              </p>
              <Button
                onClick={() => handleExportData()}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export All Data"}
              </Button>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <h3 className="text-white font-medium mb-2">Selective Export</h3>
              <p className="text-sm text-gray-400 mb-4">Choose specific data categories to export</p>
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                <Archive className="h-4 w-4 mr-2" />
                Custom Export
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Export Information</h4>
                <ul className="text-sm text-gray-300 mt-2 space-y-1">
                  <li>• Exports are generated in JSON format for easy import</li>
                  <li>• Large exports may take several minutes to complete</li>
                  <li>• You'll receive an email notification when ready</li>
                  <li>• Export links expire after 7 days for security</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Data Import
          </CardTitle>
          <CardDescription className="text-gray-400">
            Import data from previous exports or other platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Import Data File</h3>
            <p className="text-gray-400 text-sm mb-4">Drag and drop your export file here, or click to browse</p>
            <Button
              onClick={handleImportData}
              disabled={isImporting}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Importing..." : "Choose File"}
            </Button>
          </div>

          <div className="p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-medium">Import Guidelines</h4>
                <ul className="text-sm text-gray-300 mt-2 space-y-1">
                  <li>• Only import files exported from Coinwayfinder</li>
                  <li>• Importing will merge with existing data, not replace it</li>
                  <li>• Large imports may take time to process</li>
                  <li>• Create a backup before importing new data</li>
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
            <Clock className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure how long different types of data are stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Trade History</span>
                <span className="text-gray-400">2 years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Bot Logs</span>
                <span className="text-gray-400">6 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Activity Logs</span>
                <span className="text-gray-400">1 year</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Portfolio Snapshots</span>
                <span className="text-gray-400">1 year</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">News Data</span>
                <span className="text-gray-400">3 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Analytics Data</span>
                <span className="text-gray-400">6 months</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Retention Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
