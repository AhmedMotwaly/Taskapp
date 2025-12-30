"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Key, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const t = useTranslations("Forgot-passwordPage");
  const [step, setStep] = useState<1 | 2>(1); // 1 = Request, 2 = Reset
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // USE AWS URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Step 1: Request Code
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always move to step 2 for security
      setStep(2);
    } catch (err) {
      setError(t("error.request"));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("error.reset"));

      setMessage(t("message.success"));
      setTimeout(() => router.push("/login"), 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00f3ff] selection:text-black flex items-center justify-center relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ff00ff]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
            <p className="text-gray-400 text-sm">
              {step === 1 ? t("desc.step1") : t("desc.step2")}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded text-center">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded text-center flex justify-center gap-2"><CheckCircle size={16}/> {message}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("label.email")}</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#00f3ff]" size={18} />
                  <input 
                    type="email" required
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f3ff] transition-all"
                    placeholder={t("placeholder.email")}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold py-6">
                {isLoading ? <Loader2 className="animate-spin" /> : t("button.request")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("label.code")}</label>
                <div className="relative group">
                  <Key className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#ff00ff]" size={18} />
                  <input 
                    type="text" required maxLength={6}
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white tracking-widest focus:outline-none focus:border-[#ff00ff] transition-all"
                    placeholder={t("placeholder.code")}
                    value={code} onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("label.password")}</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#ff00ff]" size={18} />
                  <input 
                    type="password" required
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff00ff] transition-all"
                    placeholder={t("placeholder.password")}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-[#ff00ff] text-white hover:bg-[#cc00cc] font-bold py-6">
                {isLoading ? <Loader2 className="animate-spin" /> : t("button.reset")}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-white flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> {t("link.back")}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}