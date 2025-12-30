"use client";

import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md relative">
      <div className="container mx-auto px-6 pt-16 pb-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc] drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                AutoBuy Guard
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Never miss a deal again. Real-time price tracking and instant alerts for smart shoppers.
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"></span>
              <span className="text-xs font-bold text-[#00f3ff]">PORTFOLIO PROJECT</span>
            </div>

            <div className="flex gap-4">
              {/* GitHub Link */}
              <a 
                href="https://github.com/AhmedMotwaly/Frontend" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00f3ff] transition-all"
              >
                <Github size={18} />
              </a>
              {/* LinkedIn Link */}
              <a 
                href="https://www.linkedin.com/in/ahmad-farouk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00f3ff] transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/features" className="text-gray-400 hover:text-[#00f3ff] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-[#00f3ff] transition-colors">Pricing</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-[#00ff88] transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-[#ff00ff] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#ff00ff] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-[#00ff88] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-[#00ff88] transition-colors">Terms of Service</Link></li>
              <li><Link href="/gdpr" className="text-gray-400 hover:text-[#00ff88] transition-colors">GDPR Rights</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col xl:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <p>© {currentYear} AutoBuy Guard. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00f3ff]/10 text-[#00f3ff] rounded text-[10px] font-bold">DEMO</span>
              <span className="text-gray-700">|</span>
              <span>Built for portfolio demonstration</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
              <span className="text-[#00ff88]">All systems operational</span>
            </div>
            <span className="hidden md:inline text-gray-700">|</span>
            <div className="flex items-center gap-2">
              <img src="https://flagcdn.com/w20/de.png" alt="Germany" className="w-4 h-3" />
              <span>Hosted in EU (Frankfurt)</span>
            </div>
            <span className="hidden md:inline text-gray-700">|</span>
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}