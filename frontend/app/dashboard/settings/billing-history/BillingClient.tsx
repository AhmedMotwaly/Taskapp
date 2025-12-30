'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// --- ICONS ---
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);
const InvoiceIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
);

interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  status: string;
  pdfUrl?: string;
}

export default function BillingClient() {
  const t = useTranslations("Billing-historyPage");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPaid: 0, count: 0 });
  // Use the env variable, fallback to localhost only if missing
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/subscription/billing-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data || [];
      setInvoices(data);
      
      const total = data.reduce((acc: number, item: Invoice) => acc + (Number(item.amount) || 0), 0);
      setStats({ totalPaid: total, count: data.length });

    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- HEADER --- */}
        <div>
          <Link href="/dashboard/settings" className="inline-flex items-center text-gray-400 hover:text-cyan-400 mb-6 transition-all duration-300 group">
            <span className="group-hover:-translate-x-1 transition-transform inline-flex items-center"><ArrowLeftIcon /> {t("backToSettings")}</span>
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            {t("title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{t("history")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl border-l-4 border-cyan-500 pl-4 bg-gradient-to-r from-white/10 to-transparent py-2 rounded-r-lg backdrop-blur-md">
            {t("desc")}
          </p>
        </div>

        {/* --- STATS GRID (AERO GLASS STYLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Total Invested */}
          <div className="relative group p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl">€</span>
            </div>
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">{t("totalInvested")}</div>
            <div className="text-4xl font-black text-white tracking-tight">
              €{stats.totalPaid.toFixed(2)}
            </div>
          </div>

          {/* Total Invoices */}
          <div className="relative group p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/50 transition-all duration-300">
            <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">{t("totalInvoices")}</div>
            <div className="text-4xl font-black text-white tracking-tight">{stats.count}</div>
          </div>

          {/* Status */}
          <div className="relative group p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] hover:border-green-500/50 transition-all duration-300">
            <div className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">{t("accountStatus")}</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{t("active")}</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
              </span>
            </div>
          </div>
        </div>

        {/* --- INVOICES TABLE (AERO GLASS CONTAINER) --- */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl overflow-hidden shadow-2xl relative">
          
          {/* Table Header Gradient Line */}
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50"></div>

          {loading ? (
            <div className="p-32 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-6 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
              <p className="text-gray-400 font-medium">{t("loading")}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 shadow-inner">
                <InvoiceIcon />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t("noInvoices")}</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">{t("noInvoicesDesc")}</p>
              <Link 
                href="/dashboard/settings/manage-subscription" 
                className="inline-flex px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 shadow-lg border border-white/10"
              >
                {t("viewPlans")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("tableDescription")}</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("tableDate")}</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("tableAmount")}</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">{t("tableStatus")}</th>
                    <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t("tableAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceId} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Description */}
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-400 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all shadow-lg">
                            <InvoiceIcon />
                          </div>
                          <span className="font-medium text-white group-hover:text-cyan-200 transition-colors">{inv.description}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-6 text-gray-400 font-mono text-sm">{formatDate(inv.date)}</td>

                      {/* Amount */}
                      <td className="p-6">
                        <span className="font-bold text-white text-lg tracking-tight">€{inv.amount.toFixed(2)}</span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${
                          inv.status === 'paid' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Download Button */}
                      <td className="p-6 text-right">
                        {inv.pdfUrl ? (
                          <a 
                            href={inv.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-b from-white/10 to-transparent border border-white/10 hover:border-cyan-400 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                          >
                            <DownloadIcon />
                            <span>{t("pdf")}</span>
                          </a>
                        ) : (
                          <span className="text-gray-600 text-sm italic">{t("unavailable")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {t("footer")}
          </p>
        </div>

      </div>
    </div>
  );
}