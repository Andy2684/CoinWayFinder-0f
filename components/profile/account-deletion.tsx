"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Trash2, AlertTriangle, Shield, Download, Clock, XCircle } from "lucide-react"

export function AccountDeletion() {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [checkedItems, setCheckedItems] = useState({
    dataExport: false,
    consequences: false,
    irreversible: false,
    finalConfirmation: false,
  })

  const requiredText = "DELETE MY ACCOUNT"
  const isFormValid = confirmationText === requiredText && Object.values(checkedItems).every(Boolean)

  const deletionConsequences = [
    {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: "All data will be permanently deleted",
      description: "Trading history, bots, portfolios, and all associated data",
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: "Active subscriptions will be cancelled",
      description: "All paid plans and recurring billing will be terminated",
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: "API keys will be revoked",
      description: "All API access will be immediately terminated",
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: "Connected exchanges will be disconnected",
      description: "All exchange integrations will be removed",
    },
    {
      icon: <Clock className="h-5 w-5 text-yellow-400" />,
      title: "30-day grace period",
      description: "Account can be recovered within 30 days of deletion",
    },
  ]

  const handleDeleteAccount = async () => {
    if (!isFormValid) {
      toast({
        title: "Form Incomplete",
        description: "Please complete all required fields and confirmations.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Account Deletion Initiated",
        description: "Your account has been scheduled for deletion. You have 30 days to recover it if needed.",
      })
      // In a real app, this would redirect to a confirmation page or logout
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [key]: checked }))
  }

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <Card className="bg-red-900/20 backdrop-blur-sm border-red-600/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-300">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Export Reminder */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data First
          </CardTitle>
          <CardDescription className="text-gray-400">
            Before deleting your account, consider exporting your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Recommended Actions</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Export your trading history and portfolio data</li>
                  <li>• Save your bot configurations and strategies</li>
                  <li>• Download any important reports or analytics</li>
                  <li>• Cancel any active subscriptions manually</li>
                </ul>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Go to Data Export
          </Button>
        </CardContent>
      </Card>

      {/* Deletion Consequences */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">What Happens When You Delete Your Account</CardTitle>
          <CardDescription className="text-gray-400">
            Understanding the consequences of account deletion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deletionConsequences.map((consequence, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              {consequence.icon}
              <div>
                <h4 className="text-white font-medium">{consequence.title}</h4>
                <p className="text-sm text-gray-400">{consequence.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deletion Form */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Complete the form below to permanently delete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataExport"
                checked={checkedItems.dataExport}
                onCheckedChange={(checked) => handleCheckboxChange("dataExport", checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="dataExport"
                  className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have exported all data I want to keep
                </Label>
                <p className="text-xs text-gray-400">Confirm that you have backed up any important information</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consequences"
                checked={checkedItems.consequences}
                onCheckedChange={(checked) => handleCheckboxChange("consequences", checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="consequences"
                  className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand the consequences of account deletion
                </Label>
                <p className="text-xs text-gray-400">
                  All data, subscriptions, and integrations will be permanently removed
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="irreversible"
                checked={checkedItems.irreversible}
                onCheckedChange={(checked) => handleCheckboxChange("irreversible", checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="irreversible"
                  className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand this action cannot be undone after 30 days
                </Label>
                <p className="text-xs text-gray-400">
                  Account recovery is only possible within the 30-day grace period
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="finalConfirmation"
                checked={checkedItems.finalConfirmation}
                onCheckedChange={(checked) => handleCheckboxChange("finalConfirmation", checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="finalConfirmation"
                  className="text-white text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I want to permanently delete my account
                </Label>
                <p className="text-xs text-gray-400">Final confirmation that you want to proceed with deletion</p>
              </div>
            </div>
          </div>

          {/* Confirmation Text Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmText" className="text-white">
              Type "{requiredText}" to confirm
            </Label>
            <Input
              id="confirmText"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={requiredText}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
            <p className="text-xs text-gray-400">This confirmation is required to prevent accidental deletions</p>
          </div>

          {/* Account Info */}
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <h4 className="text-white font-medium mb-2">Account to be deleted:</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-300">Email: {user?.email}</p>
              <p className="text-gray-300">Username: {user?.username}</p>
              <p className="text-gray-300">Account ID: {user?.id}</p>
            </div>
          </div>

          {/* Delete Button */}
          <div className="flex justify-end pt-4 border-t border-slate-700">
            <Button
              onClick={handleDeleteAccount}
              disabled={!isFormValid || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting Account..." : "Delete My Account"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Information */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Recovery
          </CardTitle>
          <CardDescription className="text-gray-400">Information about recovering a deleted account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-600/10 rounded-lg border border-yellow-600/20">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">30-Day Grace Period</h4>
                <p className="text-sm text-gray-300 mb-2">
                  After deletion, your account enters a 30-day grace period during which it can be recovered.
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Contact support within 30 days to recover your account</li>
                  <li>• All data and settings will be restored as they were</li>
                  <li>• After 30 days, deletion becomes permanent and irreversible</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
