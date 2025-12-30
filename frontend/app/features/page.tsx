"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Zap, Shield, Activity, Globe, 
  Check, X, ChevronDown, ChevronUp, 
  ArrowRight, BarChart3, Clock, 
  Bell, Lock, Smartphone, Laptop
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- REVISED & HONEST DATA ---
const featuresList = [
  { 
    icon: BarChart3, 
    title: "Price History Charts", 
    desc: "Visualize price trends over time to decide if a deal is actually a deal.", 
    color: "text-[#0afcff]" 
  },
  { 
    icon: Activity, 
    title: "24/7 Cloud Monitoring", 
    desc: "Our servers scan for you day and night. Fully compliant with EU data privacy standards.", 
    color: "text-[#ff00ff]" 
  },
  { 
    icon: Shield, 
    title: "Secure Data Vault", 
    desc: "Your tracking data is encrypted. We strictly adhere to GDPR privacy protocols.", 
    color: "text-[#00ff9d]" 
  },
  { 
    icon: Bell, 
    title: "Instant Notifications", 
    desc: "Get alerts via Email or SMS the moment your target price is hit.", 
    color: "text-[#0afcff]" 
  },
  { 
    icon: Zap, 
    title: "Restock Sniper", 
    desc: "Track sold-out items. Be the first to know when inventory returns to stock.", 
    color: "text-[#ff00ff]" 
  },
  { 
    icon: Lock, 
    title: "Custom Triggers", 
    desc: "Set your exact target price. We only alert you when it matches your budget.", 
    color: "text-[#00ff9d]" 
  },
  { 
    icon: Globe, 
    title: "Global Store Support", 
    desc: "One dashboard for Amazon, Zalando, MediaMarkt, and more.", 
    color: "text-[#0afcff]" 
  },
  { 
    icon: Smartphone, 
    title: "Mobile Optimized", 
    desc: "Manage your trackers and receive alerts on the go with our responsive design.", 
    color: "text-[#ff00ff]" 
  },
  { 
    icon: Laptop, 
    title: "Browser Extension", 
    desc: "Add items directly from product pages with our Chrome extension.", 
    color: "text-[#00ff9d]" 
  },
];

const comparisonData = [
  { feature: "Check Frequency", free: "24 Hours", pro: "12 Hours", ultra: "6 Hours" },
  { feature: "Product Limit", free: "1 Item", pro: "10 Items", ultra: "Unlimited" },
  { feature: "Restock Checks", free: "1 Item", pro: "10 Items", ultra: "Unlimited" },
  { feature: "SMS Alerts", free: false, pro: true, ultra: true },
  { feature: "Browser Extension", free: true, pro: true, ultra: true },
  { feature: "Priority Support", free: false, pro: true, ultra: true },
];

const faqs = [
  { q: "How fast are the alerts?", a: "Alerts are sent immediately after our system detects a price drop during its scheduled check cycle (based on your plan)." },
  { q: "Is this legal in Europe (GDPR)?", a: "Yes. We only track public product prices, not personal data. Your account data is encrypted and never sold." },
  { q: "Do I need to keep my computer on?", a: "No! Our cloud servers do all the work 24/7, so you can turn your device off and still get alerts." },
  { q: "What stores are supported?", a: "We support major retailers like Amazon, Zalando, and MediaMarkt. We are constantly adding more." },
];

// --- COMPONENTS ---

// 1. Neural Network Visualization (Hero Right Side)
const NeuralNetworkHero = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0afcff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff00ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0afcff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Animated Connections */}
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1="50%" y1="50%"
            x2={`${20 + i * 15}%`} y2={`${20 + (i % 2) * 60}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>
      
      {/* Central Node */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px rgba(10,252,255,0.2)", "0 0 40px rgba(10,252,255,0.6)", "0 0 20px rgba(10,252,255,0.2)"] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative z-10 w-24 h-24 bg-black/80 border border-[#0afcff] rounded-full flex items-center justify-center backdrop-blur-md"
      >
        <Zap size={40} className="text-[#0afcff]" />
      </motion.div>

      {/* Satellite Nodes */}
      {[
        { icon: Bell, color: "#ff00ff", x: -90, y: -70 },
        { icon: Shield, color: "#00ff9d", x: 90, y: -70 },
        { icon: Globe, color: "#0afcff", x: -90, y: 70 },
        { icon: Activity, color: "#ff00ff", x: 90, y: 70 },
      ].map((node, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: node.x, y: node.y, opacity: 1 }}
          transition={{ duration: 1, delay: i * 0.2 }}
          className="absolute w-14 h-14 bg-black/90 border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
          style={{ borderColor: node.color, boxShadow: `0 0 15px ${node.color}40` }}
        >
          <node.icon size={22} style={{ color: node.color }} />
        </motion.div>
      ))}
    </div>
  );
};

// 2. UPDATED Feature Card with "Fantastic" Animations & Glass Effect
const FeatureCard = ({ item, index }: { item: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 50 }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="group relative p-6 bg-black/30 border border-white/10 hover:border-[#0afcff]/30 rounded-2xl transition-all duration-300 overflow-hidden backdrop-blur-xl"
  >
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0afcff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className={cn("mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-[#0afcff]/10 transition-colors duration-300", item.color)}>
      <item.icon size={28} className="transition-transform group-hover:rotate-12 duration-300" />
    </div>
    
    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#0afcff] transition-colors">{item.title}</h3>
    <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
  </motion.div>
);

export default function FeaturesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0afcff] selection:text-black overflow-x-hidden relative">
      
      {/* === RESTORED BACKGROUND IMAGE === */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-20">

          {/* === 1. HERO SECTION === */}
          <section className="container mx-auto px-6 mb-32">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 text-center lg:text-left z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#0afcff]/30 text-[#0afcff] text-xs font-bold tracking-wide mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-[#0afcff] animate-ping"></span>
                  LIVE TRACKING ACTIVE
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-2xl">
                  Intelligent <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0afcff] via-[#ff00ff] to-[#0afcff] bg-[length:200%_auto] animate-gradient">
                    Deal Sniper
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md">
                  Stop checking pages manually. Our automated cloud bots track prices and restocks 24/7, so you never miss a deal again.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/signup">
                    <Button className="h-12 px-8 bg-[#0afcff] text-black font-bold text-lg hover:bg-[#00e0e5] shadow-[0_0_20px_rgba(10,252,255,0.4)] hover:shadow-[0_0_30px_rgba(10,252,255,0.6)] transition-all rounded-full">
                      Start Tracking Free
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <NeuralNetworkHero />
              </div>
            </div>
          </section>

          {/* === 2. HONEST CORE FEATURES === */}
          <section className="container mx-auto px-6 mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Core Intelligence System</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Real tools for real shoppers. No fluff, just powerful tracking technology.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuresList.map((item, i) => (
                <FeatureCard key={i} item={item} index={i} />
              ))}
            </div>
          </section>

          {/* === 3. PLAN COMPARISON === */}
          <section className="container mx-auto px-6 mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
              <p className="text-gray-300">Simple plans. No hidden fees. Cancel anytime.</p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40">
                      <th className="p-6 text-gray-300 font-medium">Features</th>
                      <th className="p-6 text-center text-white font-bold text-lg">Free</th>
                      <th className="p-6 text-center text-[#ff00ff] font-bold text-lg">Pro</th>
                      <th className="p-6 text-center text-[#0afcff] font-bold text-lg">Ultra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6 text-gray-300 font-medium">{row.feature}</td>
                        <td className="p-6 text-center text-gray-500">
                          {typeof row.free === 'boolean' ? (row.free ? <Check className="mx-auto text-[#00ff9d]" /> : <X className="mx-auto" />) : row.free}
                        </td>
                        <td className="p-6 text-center text-gray-300">
                          {typeof row.pro === 'boolean' ? (row.pro ? <Check className="mx-auto text-[#00ff9d]" /> : <X className="mx-auto" />) : row.pro}
                        </td>
                        <td className="p-6 text-center text-white bg-[#0afcff]/5 shadow-[inset_0_0_20px_rgba(10,252,255,0.05)]">
                          {typeof row.ultra === 'boolean' ? (row.ultra ? <Check className="mx-auto text-[#00ff9d]" /> : <X className="mx-auto" />) : row.ultra}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* === 4. FAQ === */}
          <section className="container mx-auto px-6 mb-24 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  className="border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className={cn("font-medium text-lg", activeFaq === i ? "text-[#0afcff]" : "text-white")}>
                      {faq.q}
                    </span>
                    {activeFaq === i ? <ChevronUp className="text-[#0afcff]" /> : <ChevronDown className="text-gray-500" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/5">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* === 5. FINAL CTA === */}
          <section className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto bg-gradient-to-b from-black/60 to-transparent border border-white/10 rounded-3xl p-12 relative overflow-hidden group backdrop-blur-xl">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#ff00ff]/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#ff00ff]/30 transition-colors duration-500"></div>
               
               <h2 className="text-4xl font-bold mb-6 relative z-10">Stop Overpaying Today</h2>
               <p className="text-gray-300 mb-8 relative z-10 max-w-xl mx-auto">
                 Join smart shoppers who save hundreds of euros every month by waiting for the right moment.
               </p>
               
               <div className="relative z-10">
                  <Link href="/signup">
                    <Button size="lg" className="bg-[#0afcff] text-black hover:bg-[#00dce0] font-bold px-12 py-6 text-xl rounded-full shadow-[0_0_30px_rgba(10,252,255,0.4)] hover:scale-105 transition-transform">
                      Get Started <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <p className="mt-4 text-xs text-gray-500">No credit card required for Free Plan</p>
               </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}