"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GoogleButton from "@/components/google-button"; // <--- IMPORT THIS
import { 
  Shield, Mail, Lock, Key, ArrowRight, Loader2 
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  
  // State for the 2-Step Flow
  const [step, setStep] = useState<1 | 2>(1); // 1 = Signup Form, 2 = Enter Code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: "" // For step 2
  });

  // --- HANDLERS ---

  // Step 1: Send Data to Backend -> Get Verification Code
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Success! Move to Step 2
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send Code to Backend -> Get Token -> Login
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: formData.email, code: formData.code }),
});

      if (!res.ok) {
  const text = await res.text();
  throw new Error(text);
}

const data = await res.json();


      if (!res.ok) throw new Error(data.error || "Verification failed");

      // Success! Save Token & Redirect
      localStorage.setItem("token", data.token); // Save JWT
      localStorage.setItem("user", JSON.stringify({ userId: data.userId, email: data.email }));
      
      router.push("/dashboard"); // Redirect to the dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00f3ff] selection:text-black overflow-hidden relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Gradient Blob for mood */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00f3ff]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <header className="absolute top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc] drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            AutoBuy Guard
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Already have an account? <span className="text-[#00f3ff]">Log in</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-20">
        
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="relative p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
            
            {/* Neon Border Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00f3ff] opacity-50" />

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* --- STEP 1: SIGNUP FORM --- */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                  <p className="text-gray-400 text-sm">Join the elite deal hunters today.</p>
                </div>

                {/* --- GOOGLE LOGIN SECTION --- */}
                <div className="space-y-4">
                  <GoogleButton />
                </div>

                {/* --- DIVIDER --- */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/50 px-2 text-gray-500 backdrop-blur-md">Or continue with email</span>
                  </div>
                </div>

                {/* --- MANUAL FORM --- */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00f3ff] focus:ring-1 focus:ring-[#00f3ff] transition-all"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#ff00ff] transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff00ff] focus:ring-1 focus:ring-[#ff00ff] transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold py-6 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Get Verification Code"}
                  </Button>
                </form>

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    By joining, you agree to our <Link href="/terms" className="text-[#00f3ff] cursor-pointer hover:underline">Terms</Link> & <Link href="/privacy" className="text-[#00f3ff] cursor-pointer hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            )}

            {/* --- STEP 2: VERIFICATION FORM --- */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                    <Mail className="text-[#00ff88]" size={32} />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-white">Check Your Email</h1>
                  <p className="text-gray-400 text-sm">
                    We sent a 6-digit code to <span className="text-[#00ff88]">{formData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center block">Verification Code</label>
                    <div className="relative group">
                      <Key className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#00ff88] transition-colors" size={18} />
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-center text-2xl tracking-[0.5em] font-mono text-[#00ff88] placeholder:text-gray-700 focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all uppercase"
                        placeholder="000000"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#00ff88] text-black hover:bg-[#00cc6a] font-bold py-6 shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Launch"}
                  </Button>
                </form>

                <div className="text-center">
                   <button 
                     type="button"
                     onClick={() => setStep(1)}
                     className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                   >
                     <ArrowRight className="rotate-180" size={14} /> Back to Email
                   </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}