"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Bell, TrendingUp, Loader2, Crosshair, PackageSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axios from "axios";

// Helper to calculate potential savings
const calculateSavings = (items: any[]) => {
  return items.reduce((acc, item) => {
    if (item.lastPrice && item.targetPrice && item.lastPrice > item.targetPrice) {
      return acc + (item.lastPrice - item.targetPrice);
    }
    return acc;
  }, 0);
};

export default function DashboardClient() {
  // State for data
  const [dealItems, setDealItems] = useState<any[]>([]);
  const [restockItems, setRestockItems] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch User Profile (For correct Full Name)
        const userRes = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(userRes.data);

        // 2. Fetch Deal Sniper Items
        const dealsRes = await axios.get(`${API_URL}/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDealItems(Array.isArray(dealsRes.data) ? dealsRes.data : []);

        // 3. Fetch Restock Sniper Items
        const restockRes = await axios.get(`${API_URL}/restock`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRestockItems(Array.isArray(restockRes.data) ? restockRes.data : []);

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- STATS LOGIC ---
  
  // 1. Total Items Tracked (Deals + Restocks)
  const totalItems = dealItems.length + restockItems.length;

  // 2. Active Alerts (Simulated for now, or based on 'in-stock' / 'price-drop' status)
  const activeRestocks = restockItems.filter(i => i.currentStatus === 'IN_STOCK').length;
  const activeDeals = dealItems.filter(i => i.lastPrice && i.lastPrice <= i.targetPrice).length;
  const totalAlerts = activeRestocks + activeDeals;

  // 3. Potential Savings (Only applies to Deal Sniper)
  const potentialSavings = calculateSavings(dealItems);

  // 4. User Name Logic
  const displayName = userProfile?.fullName || 
                      userProfile?.email?.split('@')[0] || 
                      "Hunter";

  if (loading) {
    return <div className="h-full flex items-center justify-center text-[#00f3ff]"><Loader2 className="animate-spin" size={40} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}</h1>
        <p className="text-gray-400">Here is what's happening with your tracked items.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Card 1: Items */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md text-white group hover:border-[#00f3ff]/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Items Tracked</CardTitle>
            <ShoppingCart className="text-[#00f3ff] group-hover:scale-110 transition-transform" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">
              {dealItems.length} Deals · {restockItems.length} Restocks
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Alerts */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md text-white group hover:border-[#ff00ff]/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Alerts</CardTitle>
            <Bell className="text-[#ff00ff] group-hover:scale-110 transition-transform" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-gray-500 mt-1">Items currently available/discounted</p>
          </CardContent>
        </Card>

        {/* Card 3: Savings */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-md text-white group hover:border-[#00ff88]/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Potential Savings</CardTitle>
            <TrendingUp className="text-[#00ff88] group-hover:scale-110 transition-transform" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">€{potentialSavings.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Based on your target prices</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/deal-sniper" className="group block">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-[#00f3ff]/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <div className="w-12 h-12 rounded-full bg-[#00f3ff]/10 flex items-center justify-center mb-4 text-[#00f3ff] group-hover:scale-110 transition-transform">
              <Crosshair size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#00f3ff]">Deal Sniper Mode</h3>
            <p className="text-gray-400 text-sm">Track products and get notified when prices drop to your target.</p>
          </div>
        </Link>

        <Link href="/dashboard/restock-sniper" className="group block">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-[#ff00ff]/50 hover:shadow-[0_0_20px_rgba(255,0,255,0.1)]">
            <div className="w-12 h-12 rounded-full bg-[#ff00ff]/10 flex items-center justify-center mb-4 text-[#ff00ff] group-hover:scale-110 transition-transform">
              <PackageSearch size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#ff00ff]">Restock Sniper Mode</h3>
            <p className="text-gray-400 text-sm">Monitor out-of-stock items and get alerted when they return.</p>
          </div>
        </Link>
      </div>

    </div>
  );
}