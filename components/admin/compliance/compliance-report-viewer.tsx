"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Calendar,
  Target,
  AlertCircle,
} from "lucide-react"
import type { ComplianceReport } from "@/lib/compliance-report-generator"

interface ComplianceReportViewerProps {
  report: ComplianceReport
}

export function ComplianceReportViewer({ report }: ComplianceReportViewerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "non-compliant":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500"
      case "non-compliant":
        return "bg-red-500"
      case "partial":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50"
      case "high":
        return "border-orange-500 bg-orange-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      default:
        return "border-blue-500 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {report.title}
              </CardTitle>
              <CardDescription>
                Generated on {report.generatedAt.toLocaleString()} • Period: {report.period.start.toLocaleDateString()}{" "}
                - {report.period.end.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(report.status)} text-white`}>{report.status.toUpperCase()}</Badge>
              <Badge variant="outline" className="text-sm">
                {report.framework}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{report.overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <Progress value={report.overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{report.summary.compliantControls}</div>
              <div className="text-sm text-muted-foreground">Compliant Controls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{report.summary.criticalFindings}</div>
              <div className="text-sm text-muted-foreground">Critical Findings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{report.summary.totalControls}</div>
              <div className="text-sm text-muted-foreground">Total Controls</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="controls">Controls Assessment</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {/* Compliance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Control Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{report.summary.compliantControls}</span>
                      <Progress
                        value={(report.summary.compliantControls / report.summary.totalControls) * 100}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{report.summary.partialControls}</span>
                      <Progress
                        value={(report.summary.partialControls / report.summary.totalControls) * 100}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Non-Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{report.summary.nonCompliantControls}</span>
                      <Progress
                        value={(report.summary.nonCompliantControls / report.summary.totalControls) * 100}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Findings by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Critical</span>
                    </div>
                    <Badge className="bg-red-500 text-white">{report.summary.criticalFindings}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">High</span>
                    </div>
                    <Badge className="bg-orange-500 text-white">{report.summary.highFindings}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                    <Badge className="bg-yellow-500 text-white">{report.summary.mediumFindings}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Low</span>
                    </div>
                    <Badge className="bg-blue-500 text-white">{report.summary.lowFindings}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk Assessment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge className={`${getRiskColor(report.riskAssessment.overallRisk)} text-white text-lg px-4 py-2`}>
                    {report.riskAssessment.overallRisk.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Overall Risk Level</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getRiskColor(report.riskAssessment.residualRisk)} text-white text-lg px-4 py-2`}>
                    {report.riskAssessment.residualRisk.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Residual Risk</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.riskAssessment.riskFactors.length}</div>
                  <p className="text-sm text-muted-foreground">Risk Factors</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Next Review Date</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{report.riskAssessment.nextReviewDate.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid gap-4">
            {report.controls.map((control, index) => (
              <Card key={index} className={`border-l-4 border-l-${getStatusColor(control.status).replace("bg-", "")}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(control.status)}
                        {control.id}: {control.title}
                      </CardTitle>
                      <CardDescription>{control.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(control.status)} text-white`}>
                        {control.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${getRiskColor(control.riskLevel)} text-white`}>
                        {control.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Requirement</h4>
                      <p className="text-sm text-muted-foreground">{control.requirement}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Category</h4>
                        <Badge variant="outline">{control.category}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Implementation Status</h4>
                        <Badge variant="secondary">{control.implementationStatus.replace("-", " ")}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Owner</h4>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{control.owner}</span>
                        </div>
                      </div>
                    </div>
                    {control.findings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Findings</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {control.findings.map((finding, idx) => (
                            <li key={idx}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {control.remediationPlan && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Remediation Plan</h4>
                        <p className="text-sm text-muted-foreground">{control.remediationPlan}</p>
                        {control.dueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              Due: {control.dueDate.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <div className="grid gap-4">
            {report.findings.map((finding, index) => (
              <Card key={index} className={`border-l-4 ${getSeverityColor(finding.severity)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle
                        className={`h-5 w-5 ${finding.severity === "critical" ? "text-red-500" : finding.severity === "high" ? "text-orange-500" : finding.severity === "medium" ? "text-yellow-500" : "text-blue-500"}`}
                      />
                      {finding.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRiskColor(finding.severity)} text-white`}>
                        {finding.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{finding.type}</Badge>
                    </div>
                  </div>
                  <CardDescription>Control: {finding.controlId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{finding.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Impact</h4>
                      <p className="text-sm text-muted-foreground">{finding.impact}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{finding.recommendation}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Status</h4>
                        <Badge variant="secondary">{finding.status.replace("-", " ")}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Owner</h4>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{finding.owner}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Identified Date</h4>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{finding.identifiedDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {finding.targetResolutionDate && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Target Resolution</h4>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{finding.targetResolutionDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {report.recommendations.map((rec, index) => (
              <Card key={index} className={`border-l-4 border-l-${getRiskColor(rec.priority).replace("bg-", "")}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRiskColor(rec.priority)} text-white`}>{rec.priority.toUpperCase()}</Badge>
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Implementation</h4>
                      <p className="text-sm text-muted-foreground">{rec.implementation}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Expected Benefit</h4>
                      <p className="text-sm text-muted-foreground">{rec.expectedBenefit}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Effort</h4>
                        <Badge variant="outline">{rec.estimatedEffort}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Cost</h4>
                        <Badge variant="outline">{rec.estimatedCost}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Timeline</h4>
                        <span className="text-sm">{rec.timeline}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Owner</h4>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{rec.owner}</span>
                        </div>
                      </div>
                    </div>
                    {rec.dependencies.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Dependencies</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.dependencies.map((dep, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <div className="grid gap-4">
            {report.evidence.map((evidence, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {evidence.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{evidence.type}</Badge>
                      {evidence.verified && (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>Control: {evidence.controlId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{evidence.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Collected By</h4>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{evidence.collector}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Collection Date</h4>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{evidence.collectedDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      {evidence.validUntil && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Valid Until</h4>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{evidence.validUntil.toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {evidence.verified && evidence.verifiedBy && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Verification</h4>
                        <p className="text-sm text-muted-foreground">
                          Verified by {evidence.verifiedBy} on {evidence.verifiedDate?.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk Assessment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Overall Risk Level</h4>
                    <Badge
                      className={`${getRiskColor(report.riskAssessment.overallRisk)} text-white text-lg px-4 py-2`}
                    >
                      {report.riskAssessment.overallRisk.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Residual Risk</h4>
                    <Badge
                      className={`${getRiskColor(report.riskAssessment.residualRisk)} text-white text-lg px-4 py-2`}
                    >
                      {report.riskAssessment.residualRisk.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Risk Factors</h4>
                  <div className="space-y-3">
                    {report.riskAssessment.riskFactors.map((factor, index) => (
                      <Card
                        key={index}
                        className={`border-l-4 border-l-${getRiskColor(factor.riskLevel).replace("bg-", "")}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{factor.category}</h5>
                            <Badge className={`${getRiskColor(factor.riskLevel)} text-white`}>
                              {factor.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{factor.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-xs font-medium">Likelihood:</span>
                              <Badge variant="outline" className="ml-1 text-xs">
                                {factor.likelihood.replace("-", " ")}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-xs font-medium">Impact:</span>
                              <Badge variant="outline" className="ml-1 text-xs">
                                {factor.impact.replace("-", " ")}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-xs font-medium">Owner:</span>
                              <span className="text-xs ml-1">{factor.owner}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-xs font-medium">Mitigation:</span>
                            <p className="text-xs text-muted-foreground mt-1">{factor.mitigation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Mitigation Strategies</h4>
                  <ul className="space-y-2">
                    {report.riskAssessment.mitigationStrategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Tolerance</h4>
                  <p className="text-sm text-muted-foreground">{report.riskAssessment.riskTolerance}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Review Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{report.riskAssessment.nextReviewDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attestations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Attestations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.attestations.map((attestation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium">{attestation.attestor}</h5>
                        <p className="text-sm text-muted-foreground">{attestation.role}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{attestation.framework}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {attestation.attestationDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{attestation.statement}</p>
                    {attestation.limitations && attestation.limitations.length > 0 && (
                      <div>
                        <h6 className="font-medium text-sm mb-1">Limitations:</h6>
                        <ul className="text-xs text-muted-foreground list-disc list-inside">
                          {attestation.limitations.map((limitation, idx) => (
                            <li key={idx}>{limitation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
