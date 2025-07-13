"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicalAnalysis } from "@/components/analysis/technical-analysis";
import { SentimentAnalysis } from "@/components/analysis/sentiment-analysis";
import { PortfolioAnalysis } from "@/components/analysis/portfolio-analysis";
import { MarketAnalysis } from "@/components/analysis/market-analysis";
import { AIInsights } from "@/components/analysis/ai-insights";
import { CryptoScreener } from "@/components/analysis/crypto-screener";
import {
  BarChart3,
  Brain,
  TrendingUp,
  PieChart,
  Globe,
  Search,
} from "lucide-react";

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("technical");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crypto Analysis Tools</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis tools for cryptocurrency trading and investment decisions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="screener" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Screener
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-6">
          <TechnicalAnalysis
            selectedCrypto={selectedCrypto}
            onChange={setSelectedCrypto}
          />
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <SentimentAnalysis selectedCrypto={selectedCrypto} />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioAnalysis />
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <MarketAnalysis />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIInsights selectedCrypto={selectedCrypto} />
        </TabsContent>

        <TabsContent value="screener" className="space-y-6">
          <CryptoScreener
            selectedCrypto={selectedCrypto}
            onSelect={setSelectedCrypto}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
