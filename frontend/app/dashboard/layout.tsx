"use client";

import { useState, useEffect } from "react";
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#00f3ff] selection:text-black flex relative">

      {/* --- SIDEBAR (Desktop Only) --- */}
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
          AutoBuy Guard
        </Link>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- MOBILE SLIDE-OUT MENU --- */}
      <div className={cn(
        "md:hidden fixed top-0 left-0 h-full w-72 bg-black/95 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out border-r border-white/10",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Menu Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </span>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Menu Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-300",
                  isActive 
                    ? "bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={20} className={isActive ? "text-[#00f3ff]" : "text-gray-500"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-4 text-base font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Alternative - Always Visible) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 px-2 py-2">
        <div className="flex justify-around items-center">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                  isActive 
                    ? "text-[#00f3ff]" 
                    : "text-gray-500 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative z-10 p-4 md:p-10 pt-20 md:pt-10 pb-24 md:pb-10 min-h-screen overflow-y-auto">
        {children}
      </main>

    </div>
  );
}