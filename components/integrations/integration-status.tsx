"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Activity,
  Globe,
} from "lucide-react";

export function IntegrationStatus() {
  const stats = [
    {
      title: "Connected Exchanges",
      value: "3",
      total: "12",
      icon: CheckCircle,
      color: "text-green-400",
      description: "Active connections",
    },
    {
      title: "API Keys",
      value: "5",
      total: "∞",
      icon: Shield,
      color: "text-[#30D5C8]",
      description: "Securely stored",
    },
    {
      title: "Trading Pairs",
      value: "2,847",
      total: "",
      icon: Activity,
      color: "text-blue-400",
      description: "Available pairs",
    },
    {
      title: "Global Coverage",
      value: "150+",
      total: "",
      icon: Globe,
      color: "text-purple-400",
      description: "Countries supported",
    },
  ];

  const recentActivity = [
    {
      exchange: "Binance",
      action: "API Key Connected",
      status: "success",
      time: "2 hours ago",
    },
    {
      exchange: "Coinbase Pro",
      action: "Balance Sync",
      status: "success",
      time: "15 minutes ago",
    },
    {
      exchange: "Bybit",
      action: "Connection Test",
      status: "pending",
      time: "5 minutes ago",
    },
    {
      exchange: "KuCoin",
      action: "API Limit Reached",
      status: "warning",
      time: "1 hour ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "pending":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <section className="mb-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.total && (
                  <Badge
                    variant="outline"
                    className="border-gray-600 text-gray-300 text-xs"
                  >
                    {stat.value}/{stat.total}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                  {stat.total && (
                    <span className="text-gray-500">/{stat.total}</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {activity.exchange}
                    </p>
                    <p className="text-xs text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs border-gray-600 ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
