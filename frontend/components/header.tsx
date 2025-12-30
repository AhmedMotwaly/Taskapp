import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc] drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
          AutoBuy Guard
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          {["Features", "Pricing"].map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`}
              className={cn(
                "text-sm font-medium transition-all hover:text-[#00f3ff] hover:drop-shadow-[0_0_8px_#00f3ff]",
                "text-gray-400"
              )}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
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
  );
}