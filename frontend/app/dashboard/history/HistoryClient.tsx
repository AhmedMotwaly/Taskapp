"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";

// Use environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface HistoryItem {
  id: string;
  item: string;
  lastKnownPrice: number;
  status: "simulated" | "purchased" | "expired";
  timestamp: string;
  type?: string;
}

const statusStyles: Record<string, string> = {
  simulated: "bg-blue-500/10 text-blue-400 border-blue-500/20", // Pending/Tracking
  purchased: "bg-green-500/10 text-green-400 border-green-500/20", // Success
  expired: "bg-red-500/10 text-red-400 border-red-500/20", // Out of Stock/Failed
};

const statusLabels: Record<string, string> = {
  simulated: "Tracking",
  purchased: "Success",
  expired: "Stopped",
};

export default function HistoryClient() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryData(res.data);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-cyan-500" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Purchase History</h1>
        <p className="text-gray-400">View your tracked items and successful finds.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Price / Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="mx-auto mb-3 opacity-20" size={48} />
                    <p>No history found. Start tracking items to see them here.</p>
                  </td>
                </tr>
              ) : (
                historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {item.item}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {item.type || "Standard"}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-mono">
                      {item.lastKnownPrice > 0 ? `€${item.lastKnownPrice}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border backdrop-blur-sm shadow-lg ${statusStyles[item.status] || statusStyles.simulated}`}>
                        {statusLabels[item.status] || "Tracking"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}