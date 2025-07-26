"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PricingFAQ() {
  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer:
        "Yes! We offer a 14-day free trial for both Pro and Enterprise plans. No credit card required to start your trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and cryptocurrency payments (Bitcoin, Ethereum, USDC).",
    },
    {
      question: "Are there any setup fees or hidden costs?",
      answer:
        "No, there are no setup fees or hidden costs. The price you see is exactly what you pay. We believe in transparent pricing.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us within 30 days for a full refund.",
    },
    {
      question: "What happens to my bots if I downgrade?",
      answer:
        "If you downgrade to a plan with fewer bots, you'll need to deactivate the excess bots. Your bot configurations and historical data are preserved.",
    },
    {
      question: "Is my trading data secure?",
      answer:
        "Yes, we use bank-grade encryption and security measures. We never store your exchange API secret keys in plain text, and all data is encrypted at rest and in transit.",
    },
    {
      question: "Do you offer volume discounts?",
      answer:
        "Yes, we offer custom pricing for high-volume traders and institutions. Contact our sales team to discuss volume discounts and custom solutions.",
    },
    {
      question: "Can I use the platform without connecting real exchanges?",
      answer:
        "Yes! All plans include paper trading mode where you can test strategies with virtual money before risking real capital.",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300">Everything you need to know about our pricing and plans</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                  <AccordionTrigger className="text-white hover:text-blue-300 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
