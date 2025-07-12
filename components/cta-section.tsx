import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#191A1E]">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#30D5C8]/10 to-transparent rounded-2xl p-8 sm:p-12 border border-[#30D5C8]/20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already using CoinWayfinder to
            maximize their crypto profits with AI-powered signals and automated
            bots.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/pricing">
              <Button
                size="lg"
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold px-8 py-3 text-lg"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link
              href="https://t.me/andis_fx_signals_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent"
              >
                <MessageSquare className="mr-2 w-5 h-5" />
                Try Telegram Bot
              </Button>
            </Link>
          </div>

          <p className="text-gray-400 text-sm">
            No credit card required • 3-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
