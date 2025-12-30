"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GoogleButton from "@/components/google-button"; 
import { Mail, Lock, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. STRICT: Get API URL from Environment Variable
    // If this is missing (undefined), the app will stop here safe.
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      setError("Configuration Error: NEXT_PUBLIC_API_URL is missing.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Send Login Request to AWS
      // We use the variable + "/auth/login" (Removing '/api' to match your API domain)
      // Result: https://api.autobuyguard.store/auth/login
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // 3. Success: Save Token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ userId: data.userId, email: data.email }));

      // 4. Redirect to Dashboard
      router.push("/dashboard");

    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Connection failed. Please check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00f3ff] selection:text-black overflow-hidden relative flex items-center justify-center">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ff00ff]/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00f3ff]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HEADER (Absolute top) --- */}
      <header className="absolute top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc] drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            AutoBuy Guard
          </Link>
          <Link href="/signup" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Don't have an account? <span className="text-[#ff00ff]">Sign up</span>
          </Link>
        </div>
      </header>

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="relative p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
          
          {/* Neon Border Glow (Top) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff00ff] via-[#00f3ff] to-[#ff00ff] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Enter the portal to access your snipers.</p>
          </div>

          {/* FANCY ERROR MESSAGE */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#ff0055]/10 border border-[#ff0055]/50 text-[#ff0055] text-sm flex items-center gap-3 animate-in slide-in-from-top-2 shadow-[0_0_15px_rgba(255,0,85,0.2)]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* --- GOOGLE LOGIN SECTION --- */}
          <div className="space-y-4 mb-6">
            <GoogleButton />
          </div>

          {/* --- DIVIDER --- */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/50 px-2 text-gray-500 backdrop-blur-md">Or continue with email</span>
            </div>
          </div>

          {/* --- MANUAL FORM --- */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group/input">
                <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within/input:text-[#00f3ff] transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] focus:bg-white/5 transition-all duration-300"
                  placeholder="hunter@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#00f3ff] hover:text-[#00ffcc] hover:underline">Forgot?</Link>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within/input:text-[#ff00ff] transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff] focus:bg-white/5 transition-all duration-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-[#00f3ff] hover:text-black font-bold py-6 text-lg tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Launch Dashboard <ArrowRight size={18} />
                </span>
              )}
            </Button>

          </form>

        </div>
      </div>

    </div>
  );
}