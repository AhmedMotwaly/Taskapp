"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Zap, Crosshair, History, ExternalLink, 
  Shield, Smartphone, Check, 
  ArrowRight, Search, Server, Wifi, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- CUSTOM ANIMATION STYLES ---
const animationStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
  .animate-gradient-text { 
    background-size: 200% auto;
    animation: gradient-x 4s linear infinite;
  }
`;

// Honest Feature Badge Component
const StatusBadge = ({ icon: Icon, label, status, colorClass }: { icon: any, label: string, status: string, colorClass: string }) => (
  <div className="flex flex-col items-center p-6 bg-black/30 border border-white/10 rounded-xl backdrop-blur-md hover:border-white/20 transition-all hover:-translate-y-1 group">
    <div className={`mb-3 p-3 rounded-full bg-black/50 border border-white/10 ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-lg font-bold text-white flex items-center gap-2">
      {status}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass.replace('text-', 'bg-')}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass.replace('text-', 'bg-')}`}></span>
      </span>
    </span>
  </div>
);

export default function HomePage() {
  const [urlInput, setUrlInput] = useState("");
  const [sniperMode, setSniperMode] = useState<"price" | "stock">("price");
  const router = useRouter();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    router.push(`/signup?ref=home_hero`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00f3ff] selection:text-black overflow-x-hidden relative">
      <style>{animationStyles}</style>
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <main className="relative">
          
          {/* HERO */}
          <section className="relative pt-32 pb-24 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#00f3ff]/20 text-[#00f3ff] text-xs font-bold tracking-widest uppercase mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-ping"></span>
                System Operational
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl">
                Stop Browsing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00f3ff] animate-gradient-text">
                  Start Sniping
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                The professional way to track prices and snipe restocks. 
                Join the platform built for speed, accuracy, and smart savings.
              </p>

              <div className="max-w-xl mx-auto mb-20 relative animate-float">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] rounded-2xl blur opacity-30 animate-pulse"></div>
                <form onSubmit={handleTrackSubmit} className="relative flex items-center bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
                  <div className="pl-4 text-gray-500">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste product URL to track..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-4 py-3 outline-none"
                  />
                  <Button 
                    type="submit"
                    className="bg-[#00f3ff] text-black hover:bg-[#00cceb] min-w-[120px] font-bold h-12 rounded-lg transition-all hover:scale-105"
                  >
                    Track Now
                  </Button>
                </form>
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-2">
                  <Lock size={12} /> Secure Tracking • No Credit Card Required
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <StatusBadge icon={Wifi} label="Monitoring Engine" status="Online" colorClass="text-[#00ff88]" />
                <StatusBadge icon={Server} label="Cloud Infrastructure" status="24/7 Active" colorClass="text-[#00f3ff]" />
                <StatusBadge icon={Lock} label="Data Protection" status="Encrypted" colorClass="text-[#ff00ff]" />
              </div>
            </div>
          </section>

          {/* DUAL-MODE SNIPER */}
          <section className="py-24 bg-black/40 border-y border-white/5 backdrop-blur-md relative">
             <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-8">
                  Precision Tools for <br />Every Scenario
                </h2>
                
                <div className="flex justify-center gap-4 mb-12">
                  <button 
                    onClick={() => setSniperMode("price")}
                    className={cn(
                      "px-8 py-4 rounded-full font-bold transition-all border text-lg backdrop-blur-sm",
                      sniperMode === "price" 
                        ? "bg-[#ff00ff]/10 border-[#ff00ff] text-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.3)] scale-105" 
                        : "bg-black/20 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                    )}
                  >
                    Price Sniper
                  </button>
                  <button 
                    onClick={() => setSniperMode("stock")}
                    className={cn(
                      "px-8 py-4 rounded-full font-bold transition-all border text-lg backdrop-blur-sm",
                      sniperMode === "stock" 
                        ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-105" 
                        : "bg-black/20 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                    )}
                  >
                    Restock Sniper
                  </button>
                </div>
                
                <div className="min-h-[120px]">
                  <p 
                    key={sniperMode}
                    className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {sniperMode === "price" 
                      ? "Visualize price history and set your target zone. Our bots watch the charts 24/7, detecting price drops the moment they happen so you never overpay."
                      : "Inventory levels updated in milliseconds. When that 'Sold Out' button turns 'Add to Cart', you'll be the first to know. Perfect for limited drops."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* HUNTER'S ARSENAL */}
          <section className="py-24 relative">
            <div className="container mx-auto px-6">
              <h2 className="text-4xl font-bold text-center mb-16 drop-shadow-lg">The Hunter's Arsenal</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Zap, title: "Instant Alerts", desc: "Get notified immediately via Email or SMS when a price drops or stock returns.", color: "text-[#00f3ff]" },
                  { icon: History, title: "Price History", desc: "We track price changes over time so you can spot trends and know if a deal is real.", color: "text-[#ff00ff]" },
                  { icon: Crosshair, title: "Multi-Store Support", desc: "One dashboard for major retailers like Amazon, Zalando, and more.", color: "text-[#00ff88]" },
                  { icon: ExternalLink, title: "Direct Buy Links", desc: "One-click links take you directly to the product page to complete your purchase fast.", color: "text-[#00f3ff]" },
                  { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted. We focus on privacy and client-side security.", color: "text-[#ff00ff]" },
                  { icon: Smartphone, title: "Mobile Friendly", desc: "Our responsive dashboard works perfectly on any device. Track on the go.", color: "text-[#00ff88]" },
                ].map((f, i) => (
                  <div key={i} className="group p-8 rounded-2xl bg-black/30 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-2 hover:bg-white/5 backdrop-blur-xl">
                    <div className={`w-14 h-14 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                      <f.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white/90">
                      {f.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-32 relative text-center overflow-hidden border-t border-white/10">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00f3ff]/10 via-black to-black opacity-80 -z-10"></div>
             
             <div className="container mx-auto px-6 relative z-10 animate-float-delayed">
               <div className="inline-block px-4 py-1.5 rounded-full border border-[#00f3ff]/30 bg-[#00f3ff]/10 text-[#00f3ff] text-xs font-bold mb-8">
                 LEVEL UP YOUR SAVINGS
               </div>
               
               <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight drop-shadow-xl">
                 Ready to Start the Hunt?
               </h2>
               
               <div className="flex flex-col items-center gap-6">
                 <Link href="/signup">
                   <Button className="h-auto py-6 px-16 text-xl font-bold bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                     Create Free Account <ArrowRight className="ml-2" />
                   </Button>
                 </Link>
                 
                 <div className="flex items-center gap-6 text-sm text-gray-400 mt-4">
                   <span className="flex items-center gap-2">
                     <Check size={14} className="text-[#00ff88]" /> Free Plan Available
                   </span>
                   <span className="flex items-center gap-2">
                     <Check size={14} className="text-[#00ff88]" /> No Credit Card Required
                   </span>
                 </div>
               </div>
             </div>
          </section>

        </main>
        <Footer />
      </div>
    </div>
  );
}