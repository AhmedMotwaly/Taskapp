"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Check, Shield, ChevronDown, ChevronUp, 
  Globe, Clock, Activity, Zap, Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- Data & Configuration ---

const plans = [
  {
    id: "free",
    name: "Free Plan",
    badge: "ALWAYS FREE",
    badgeColor: "text-[#00ff88] border-[#00ff88] shadow-[0_0_10px_#00ff88]",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Perfect for casual deal hunting",
    accentColor: "group-hover:shadow-[0_0_30px_#00ff88]",
    buttonColor: "bg-[#00ff88] text-black hover:bg-[#00cc6a] shadow-[0_0_20px_#00ff88]",
    features: [
      "Track 1 Product",
      "Restock Sniper (1 Item)",
      "24-Hour Cloud Monitoring", 
      "Instant Email Alerts",
      "Basic Price History",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    badge: "MOST POPULAR",
    badgeColor: "text-[#ff00ff] border-[#ff00ff] bg-[#ff00ff]/10 shadow-[0_0_15px_#ff00ff] animate-pulse",
    priceMonthly: 5,
    priceYearly: 48, 
    description: "For serious deal hunters",
    accentColor: "shadow-[0_0_40px_rgba(255,0,255,0.4)] border-[#ff00ff]/50 scale-105 z-10",
    buttonColor: "bg-[#ff00ff] text-white hover:bg-[#cc00cc] shadow-[0_0_25px_#ff00ff]",
    features: [
      "Track 10 Products",
      "Restock Sniper (10 Items)",
      "12-Hour Cloud Monitoring", 
      "Email & SMS Alerts",
      "Advanced Price History",
      "Browser Extension Access",
    ],
    highlight: true,
  },
  {
    id: "ultra",
    name: "Ultra Plan",
    badge: "MAXIMUM POWER",
    badgeColor: "text-[#00f3ff] border-[#00f3ff] shadow-[0_0_10px_#00f3ff]",
    priceMonthly: 10,
    priceYearly: 96, 
    description: "Maximum power for power users",
    accentColor: "group-hover:shadow-[0_0_30px_#00f3ff]",
    buttonColor: "bg-[#00f3ff] text-black hover:bg-[#00cceb] shadow-[0_0_20px_#00f3ff]",
    features: [
      "Unlimited Tracking",
      "Unlimited Restock Sniper",
      "6-Hour Cloud Monitoring", 
      "Priority SMS Alerts",
      "Direct Product Links", 
      "Dedicated Support",
    ],
  },
];

const faqs = [
  { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade instantly. Prorated charges will apply automatically." },
  { q: "Is there a free trial?", a: "We offer a 'Free Forever' plan so you can test the core features without spending a cent. No credit card required." },
  { q: "How do Direct Product Links work?", a: "Our alerts include a direct link to the product page. One click and you are ready to add to cart, saving you valuable seconds." },
  { q: "What happens if I exceed my product limit?", a: "You'll be prompted to upgrade, or you can archive old items to make room for new ones." },
  { q: "Do you offer refunds?", a: "Yes, we offer a 30-day money-back guarantee if you are not satisfied with the service." },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getButtonText = (id: string) => {
    switch (id) {
      case "free": return "Get Started Free";
      case "pro": return "Upgrade to Pro"; 
      case "ultra": return "Get Ultra Power"; 
      default: return "Select Plan";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00f3ff] selection:text-black overflow-x-hidden relative">
      
      {/* === RESTORED BACKGROUND IMAGE === */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-black/60"></div> {/* Dimmer overlay */}
      </div>

      {/* 1. CUSTOM NEON HEADER (Overlay) */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc] drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            AutoBuy Guard
          </Link>

          <nav className="hidden md:flex gap-8">
            {["Features", "Pricing"].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className={cn(
                  "text-sm font-medium transition-all hover:text-[#00f3ff] hover:drop-shadow-[0_0_8px_#00f3ff]",
                  item === "Pricing" ? "text-[#00f3ff] drop-shadow-[0_0_5px_#00f3ff]" : "text-gray-400"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-gray-400">
              Login
            </Link>
            <Link href="/signup">
                <Button className="bg-transparent border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all duration-300 font-bold">
                Join the Hunt
                </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* 2. HERO SECTION */}
        <section className="relative pt-24 pb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-2xl"
          >
            Track Prices <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00f3ff]">Like a Pro</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto drop-shadow-md"
          >
            Transparent pricing. No hidden fees. Cancel anytime.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={cn("text-sm font-medium transition-colors", !isYearly ? "text-white" : "text-gray-500")}>
              Monthly Billing
            </span>
            <div 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-white/10 rounded-full cursor-pointer border border-white/20 shadow-inner hover:border-[#00f3ff]/50 transition-all backdrop-blur-sm"
            >
              <div className={cn(
                "absolute top-1 left-1 w-5 h-5 bg-[#00f3ff] rounded-full shadow-[0_0_10px_#00f3ff] transition-all duration-300",
                isYearly ? "translate-x-7" : "translate-x-0"
              )} />
            </div>
            <span className={cn("text-sm font-medium transition-colors flex items-center gap-2", isYearly ? "text-white" : "text-gray-500")}>
              Yearly Billing
              <span className="text-[10px] bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded-full border border-[#00ff88]/50">
                SAVE 20%
              </span>
            </span>
          </div>

          {/* 3. PRICING CARDS - GLASS EFFECT APPLIED */}
          <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 items-center max-w-6xl">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:-translate-y-2 flex flex-col",
                  plan.highlight ? plan.accentColor : "hover:border-white/30"
                )}
              >
                {/* Neon Glow Hover Effect */}
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none bg-gradient-to-b from-white/5 to-transparent")} />

                <div className="mb-8 relative z-10">
                  <span className={cn("inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 border", plan.badgeColor)}>
                    {plan.badge}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      €{isYearly && plan.priceYearly > 0 ? (plan.priceYearly / 12).toFixed(0) : plan.priceMonthly}
                    </span>
                    <span className="text-gray-400">/mo</span>
                  </div>
                  {isYearly && plan.priceMonthly > 0 && (
                     <p className="text-xs text-gray-500 mt-1">Billed €{plan.priceYearly} yearly</p>
                  )}
                  <p className="text-gray-400 mt-4 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className={cn("p-0.5 rounded-full bg-white/5 border border-white/10", 
                        plan.id === 'free' ? "text-[#00ff88]" : plan.id === 'pro' ? "text-[#ff00ff]" : "text-[#00f3ff]")}>
                        <Check size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="relative z-10">
                    <Button className={cn("w-full py-6 font-bold tracking-wide transition-all duration-300", plan.buttonColor)}>
                    {getButtonText(plan.id)}
                    </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. TRUST & SOCIAL PROOF */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-6 text-center">
            
            <div className="flex flex-wrap justify-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {[
                { icon: Shield, text: "Bank-Level Security", color: "text-[#00f3ff]" },
                { icon: Server, text: "99.9% Uptime", color: "text-[#00ff88]" },
                { icon: Clock, text: "30-Day Guarantee", color: "text-[#ff00ff]" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/40 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md hover:border-white/30 transition-colors">
                  <badge.icon className={badge.color} size={20} />
                  <span className="text-sm font-medium text-gray-300">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. INTERACTIVE FAQ */}
        <section className="py-20 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={cn(
                  "cursor-pointer p-6 rounded-xl border transition-all duration-300 overflow-hidden backdrop-blur-md",
                  openFaq === i 
                    ? "bg-black/60 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.1)]" 
                    : "bg-black/30 border-white/10 hover:border-white/30"
                )}
              >
                <div className="flex justify-between items-center">
                  <h3 className={cn("font-medium text-lg", openFaq === i ? "text-[#00f3ff]" : "text-white")}>
                    {faq.q}
                  </h3>
                  {openFaq === i ? <ChevronUp className="text-[#00f3ff]" /> : <ChevronDown className="text-gray-500" />}
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="pt-4 text-gray-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section className="py-24 relative overflow-hidden border-t border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff]/20 via-[#00f3ff]/20 to-[#00ff88]/20 blur-3xl opacity-30 pointer-events-none" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Start Tracking in 60 Seconds
            </h2>
            <p className="text-xl text-gray-300 mb-10">Join smart shoppers already saving money</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/signup">
                <Button size="lg" className="bg-[#00f3ff] text-black hover:bg-[#00cceb] shadow-[0_0_30px_#00f3ff] font-bold text-lg px-12 py-6 rounded-full transition-transform hover:scale-105">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. ENHANCED FOOTER */}
      <footer className="border-t border-white/10 bg-black/80 pt-16 pb-8 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <Link href="/" className="text-2xl font-bold text-white mb-4 block">AutoBuy Guard</Link>
              <p className="text-gray-500 text-sm">Never miss a deal again.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {["Features", "Pricing"].map(l => (
                  <li key={l}><Link href="#" className="hover:text-[#00f3ff] transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {["About", "Contact"].map(l => (
                  <li key={l}><Link href="#" className="hover:text-[#ff00ff] transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {["Privacy", "Terms", "Cookies", "GDPR"].map(l => (
                  <li key={l}><Link href="#" className="hover:text-[#00ff88] transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>© 2024 AutoBuy Guard. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Globe size={16} /> <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}