"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Crosshair, PackageSearch, History, Settings, LogOut, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Crosshair, label: "Deal Sniper", href: "/dashboard/deal-sniper" },
  { icon: PackageSearch, label: "Restock Sniper", href: "/dashboard/restock-sniper" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#00f3ff] selection:text-black flex relative">

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl z-20 h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group",
                  isActive 
                    ? "bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={18} className={cn("transition-colors", isActive ? "text-[#00f3ff]" : "text-gray-500 group-hover:text-white")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <span className="font-bold text-[#00f3ff]">AutoBuy Guard</span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative z-10 p-6 md:p-10 pt-20 md:pt-10 min-h-screen overflow-y-auto scrollbar-hide">
        {children}
      </main>

    </div>
  );
}