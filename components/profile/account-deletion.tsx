"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Trash2, AlertTriangle, Shield, Download, Clock, CheckCircle, XCircle } from "lucide-react"

export function AccountDeletion() {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [acknowledgedConsequences, setAcknowledgedConsequences] = useState<string[]>([])

  const consequences = [
    {
      id: "data-loss",
      title: "Permanent Data Loss",
      description: "All your trading data, bot configurations, and analytics will be permanently deleted",
      severity: "high",
    },
    {
      id: "subscription-cancel",
      title: "Subscription Cancellation",
      description: "Your current subscription will be cancelled immediately without refund",
      severity: "medium",
    },
    {
      id: "api-keys",
      title: "API Keys Revoked",
      description: "All API keys will be immediately revoked and external integrations will stop working",
      severity: "high",
    },
    {
      id: "recovery-period",
      title: "30-Day Recovery Period",
      description: "You have 30 days to recover your account before permanent deletion",
      severity: "low",
    },
    {
      id: "username-release",
      title: "Username Release",
      description: "Your username will be released and may be claimed by other users",
      severity: "medium",
    },
  ]

  const deletionProcess = [
    {
      step: 1,
      title: "Account Deactivation",
      description: "Your account will be immediately deactivated and you'll be logged out",
      duration: "Immediate",
    },
    {
      step: 2,
      title: "Grace Period",
      description: "30-day period where you can still recover your account",
      duration: "30 days",
    },
    {
      step: 3,
      title: "Data Anonymization",
      description: "Personal information is removed while keeping anonymized trading data for compliance",
      duration: "After 30 days",
    },
    {
      step: 4,
      title: "Complete Deletion",
      description: "All remaining data is permanently deleted from our systems",
      duration: "After 90 days",
    },
  ]

  const handleConsequenceAcknowledge = (consequenceId: string) => {
    setAcknowledgedConsequences((prev) =>
      prev.includes(consequenceId) ? prev.filter((id) => id !== consequenceId) : [...prev, consequenceId],
    )
  }

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE MY ACCOUNT") {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE MY ACCOUNT' to confirm deletion.",
        variant: "destructive",
      })
      return
    }

    if (acknowledgedConsequences.length !== consequences.length) {
      toast({
        title: "Acknowledgment Required",
        description: "Please acknowledge all consequences before proceeding.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Account Deletion Initiated",
        description: "Your account deletion has been scheduled. You have 30 days to recover it.",
      })

      setIsDeleteDialogOpen(false)
      // In a real app, this would redirect to a confirmation page or log out the user
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportBeforeDeletion = () => {
    toast({
      title: "Export Started",
      description: "Your complete data export has been initiated. Check your email for the download link.",
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 border-red-500/20 bg-red-500/10"
      case "medium":
        return "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
      case "low":
        return "text-green-400 border-green-500/20 bg-green-500/10"
      default:
        return "text-gray-400 border-gray-500/20 bg-gray-500/10"
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <Card className="bg-red-500/10 border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-8 w-8 text-red-400 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Account Deletion</h3>
              <p className="text-red-200">
                This action will permanently delete your CoinWayFinder account and all associated data. This process
                cannot be undone after the 30-day recovery period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data First */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data First
          </CardTitle>
          <CardDescription>We strongly recommend exporting your data before deleting your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Complete Data Export</h4>
                <p className="text-sm text-blue-200 mt-1">
                  Export all your trading data, bot configurations, signals, and account information before proceeding
                  with deletion.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleExportBeforeDeletion} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
        </CardContent>
      </Card>

      {/* Deletion Consequences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            What Happens When You Delete Your Account
          </CardTitle>
          <CardDescription>Please review these consequences carefully before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {consequences.map((consequence) => (
            <div key={consequence.id} className={`p-4 rounded-lg border ${getSeverityColor(consequence.severity)}`}>
              <div className="flex items-start gap-3">
                {consequence.severity === "high" ? (
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                ) : consequence.severity === "medium" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{consequence.title}</h4>
                  <p className="text-sm opacity-90">{consequence.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deletion Process */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deletion Process Timeline
          </CardTitle>
          <CardDescription>Understanding the account deletion timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deletionProcess.map((process, index) => (
              <div key={process.step} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                    {process.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">{process.title}</h4>
                    <span className="text-sm text-gray-400">{process.duration}</span>
                  </div>
                  <p className="text-sm text-gray-400">{process.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Button */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Delete Account</CardTitle>
          <CardDescription>Once you delete your account, there is no going back after 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Confirm Account Deletion
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Please confirm that you understand the consequences.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Acknowledge Consequences */}
                <div className="space-y-3">
                  <Label className="text-white font-medium">
                    Please acknowledge that you understand the following:
                  </Label>
                  {consequences.map((consequence) => (
                    <div key={consequence.id} className="flex items-start gap-3">
                      <Checkbox
                        id={consequence.id}
                        checked={acknowledgedConsequences.includes(consequence.id)}
                        onCheckedChange={() => handleConsequenceAcknowledge(consequence.id)}
                      />
                      <div>
                        <Label htmlFor={consequence.id} className="text-white text-sm font-medium">
                          {consequence.title}
                        </Label>
                        <p className="text-xs text-gray-400 mt-1">{consequence.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirmation Text */}
                <div className="space-y-2">
                  <Label htmlFor="confirmation" className="text-white">
                    Type "DELETE MY ACCOUNT" to confirm:
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {/* Final Warning */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-red-400 font-medium">Final Warning</h4>
                      <p className="text-sm text-red-200 mt-1">
                        Your account "{user?.email}" will be permanently deleted after 30 days. All data will be lost
                        forever.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    loading ||
                    confirmationText !== "DELETE MY ACCOUNT" ||
                    acknowledgedConsequences.length !== consequences.length
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
