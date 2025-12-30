"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Target, Zap, Shield, Rocket, Heart,
  Terminal, Cpu, Lock
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black/60 text-white font-sans selection:bg-[#00f3ff] selection:text-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="/features" className="text-sm font-medium text-gray-400 hover:text-[#00f3ff] transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-400 hover:text-[#00f3ff] transition-colors">Pricing</Link>
          </nav>
          <Link href="/signup">
            <Button className="bg-[#00f3ff] text-black hover:bg-[#00cceb]">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff00ff]/10 border border-[#ff00ff]/30 text-[#ff00ff] text-xs font-bold tracking-wide uppercase mb-8">
              <Heart size={12} className="fill-[#ff00ff]" />
              The Philosophy
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              The End of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff88]">
                Overpaying
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-2xl mx-auto">
              Retailers use algorithms to maximize their profits. We built <strong>AutoBuy Guard</strong> to give that power back to you. It's not just a tracker; it's your unfair advantage.
            </p>

            {/* REPLACED FAKE STATS WITH CORE VALUES */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md group hover:border-[#00f3ff]/50 transition-all">
                <Target className="mx-auto mb-4 text-[#00f3ff] group-hover:scale-110 transition-transform" size={32} />
                <div className="font-bold text-white mb-1">Precision</div>
                <div className="text-sm text-gray-400">We track, you save.</div>
              </div>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md group hover:border-[#ff00ff]/50 transition-all">
                <Rocket className="mx-auto mb-4 text-[#ff00ff] group-hover:scale-110 transition-transform" size={32} />
                <div className="font-bold text-white mb-1">Speed</div>
                <div className="text-sm text-gray-400">Milliseconds matter.</div>
              </div>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md group hover:border-[#00ff88]/50 transition-all">
                <Shield className="mx-auto mb-4 text-[#00ff88] group-hover:scale-110 transition-transform" size={32} />
                <div className="font-bold text-white mb-1">Integrity</div>
                <div className="text-sm text-gray-400">No ads. No data selling.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why We Built This</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  We noticed that price drops often happen at 3 AM or last only for minutes. Manual checking is impossible.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  We didn't just want to build another tool. We wanted to build a "Guard" a tireless digital assistant that watches the market 24/7 so you can sleep, work, and live while still getting the best deals.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] blur-[60px] opacity-20 rounded-full"></div>
                <div className="relative p-8 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm text-gray-300">System Monitoring Active</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-[#00f3ff] animate-pulse"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      Scanning: Amazon, Zalando, MediaMarkt...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPLACED TECH STACK WITH "THE ENGINE" (Benefits over Features) */}
        <section className="py-20 border-t border-white/10 bg-black/40">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">Under The Hood</h2>
            <p className="text-xl text-gray-400 mb-12">
              Powered by enterprise-grade technology designed for speed.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00f3ff]/50 transition-colors">
                <Cpu className="mx-auto text-[#00f3ff] mb-4" size={28} />
                <div className="font-bold text-white mb-2">Real-Time Engine</div>
                <div className="text-sm text-gray-500">We don't cache old prices. When the price moves, you know instantly.</div>
              </div>
              
              <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#ff00ff]/50 transition-colors">
                <Terminal className="mx-auto text-[#ff00ff] mb-4" size={28} />
                <div className="font-bold text-white mb-2">Cloud-Native Scale</div>
                <div className="text-sm text-gray-500">Whether tracking 1 item or 1,000, our system scales automatically.</div>
              </div>
              
              <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00ff88]/50 transition-colors">
                <Lock className="mx-auto text-[#00ff88] mb-4" size={28} />
                <div className="font-bold text-white mb-2">Bank-Grade Security</div>
                <div className="text-sm text-gray-500">Payments via Stripe. Data encrypted at rest. Your privacy is paramount.</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-white/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Guessing. Start Saving.
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join the smart shoppers who let technology do the hard work for them.
            </p>
            <Link href="/signup">
              <Button className="bg-[#00f3ff] text-black hover:bg-[#00cceb] px-8 py-6 text-lg font-bold rounded-full shadow-[0_0_30px_#00f3ff] hover:scale-105 transition-all">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2025 AutoBuy Guard. Built with ❤️ for smart shoppers.</p>
        </div>
      </footer>
    </div>
  );
}