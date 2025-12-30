"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; 
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Loader2, ShoppingCart, Zap, ShoppingBag } from "lucide-react";

export default function DealSniperClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [autoBuy, setAutoBuy] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // USE THE REAL AWS BACKEND URL (Fallback to localhost for dev)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Fetch Real Items on Load
  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 2. Handle URL Paste (Auto-Preview) - WITH DEBUG
  const handlePreview = async () => {
    if (!url) return;
    setIsPreviewing(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/items/preview`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      
      // 🔥🔥🔥 CRITICAL DEBUG BLOCK 🔥🔥🔥
      console.log('═══════════════════════════════════');
      console.log('FRONTEND DEBUG - API Response:');
      console.log('Price:', data.price, '| Type:', typeof data.price);
      console.log('Full response:', data);
      console.log('═══════════════════════════════════');
      // 🔥🔥🔥 END DEBUG 🔥🔥🔥
      
      if (!res.ok) throw new Error("Failed to preview");
      
      setPreviewData(data);
      // Auto-set a suggestion for target price (e.g. 10% off)
      if (data.price) setTargetPrice((data.price * 0.9).toFixed(2));
    } catch (err) {
      alert("Could not fetch product details. Check the link.");
    } finally {
      setIsPreviewing(false);
    }
  };

  // 3. Add Item to Database
  const handleAddItem = async () => {
    if (!previewData || !targetPrice) return;
    setIsAdding(true);
    const token = localStorage.getItem("token");

    try {
      const payload = {
        url: previewData.url,
        title: previewData.title,
        targetPrice: parseFloat(targetPrice),
        mode: "deal",
        currentPrice: previewData.price,
        imageUrl: previewData.image,
        autoBuy: autoBuy
      };

      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to add");

      // Reset form and reload list
      setUrl("");
      setTargetPrice("");
      setPreviewData(null);
      setAutoBuy(false);
      fetchItems(); 
    } catch (err) {
      alert("Error saving item.");
    } finally {
      setIsAdding(false);
    }
  };

  // 4. Delete Item
  const handleDelete = async (id: string) => {
    if (!confirm("Stop tracking this item?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Deal Sniper</h1>
        <p className="text-gray-400">Track products and get notified (or auto-buy) when prices drop.</p>
      </div>

      {/* --- ADD NEW ITEM CARD --- */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* URL Input */}
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Product URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://amazon.com/dp/..."
                  className="bg-black/20 border-white/10 text-white"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handlePreview} // Auto-preview when clicking away
                />
                <Button variant="outline" onClick={handlePreview} disabled={isPreviewing} className="border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10">
                  {isPreviewing ? <Loader2 className="animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>
          </div>

          {/* PREVIEW SECTION (Only shows after valid URL) */}
          {previewData && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col md:flex-row gap-6 animate-in zoom-in-95">
              {previewData.image && (
                <img src={previewData.image} alt="Preview" className="w-24 h-24 object-contain bg-white rounded-md p-2" />
              )}
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-bold text-white line-clamp-1">{previewData.title}</h3>
                  <p className="text-[#00f3ff] text-xl font-mono mt-1">
                    Current: €{previewData.price}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="space-y-2 w-full md:w-48">
                    <label className="text-xs font-bold text-gray-500 uppercase">Target Price (€)</label>
                    <Input 
                      type="number" 
                      className="bg-black/20 border-white/10 text-white font-mono text-lg"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                    />
                  </div>

                  {/* AUTO BUY TOGGLE */}
                  <div className="flex items-center gap-3 border border-white/10 p-3 rounded-lg bg-black/20">
                    <Switch 
                      checked={autoBuy}
                      onCheckedChange={setAutoBuy}
                      className="data-[state=checked]:bg-[#ff00ff]"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        Auto-Buy <Zap size={14} className={autoBuy ? "text-[#ff00ff] fill-[#ff00ff]" : "text-gray-500"} />
                      </p>
                      <p className="text-[10px] text-gray-500">Attempt purchase automatically</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddItem} 
                    disabled={isAdding}
                    className="w-full md:w-auto bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                  >
                    {isAdding ? <Loader2 className="animate-spin" /> : "Start Tracking"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- ITEMS GRID (REAL DATA) --- */}
      {loading ? (
        <div className="text-center text-[#00f3ff] py-10"><Loader2 className="animate-spin mx-auto" size={40}/></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-600" />
          <p>No items tracked yet. Add one above!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.itemId} className="bg-black/40 border-white/10 backdrop-blur-md group hover:border-[#00f3ff]/50 transition-all">
              <CardContent className="p-5 relative">
                <button 
                  onClick={() => handleDelete(item.itemId)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-md p-2 flex items-center justify-center shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="max-h-full max-w-full" /> : <ShoppingBag size={24} className="text-black"/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-white line-clamp-2 text-sm h-10 mb-1">{item.title}</h3>
                    <a href={item.url} target="_blank" className="text-xs text-[#00f3ff] flex items-center gap-1 hover:underline">
                      View Product <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Current</p>
                    <p className="text-xl font-mono text-white">€{item.lastPrice || "---"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Target</p>
                    <p className="text-xl font-mono text-[#00f3ff]">€{item.targetPrice}</p>
                  </div>
                </div>
                
                {item.autoBuy && (
                   <div className="absolute bottom-2 right-2">
                      <Zap size={12} className="text-[#ff00ff] fill-[#ff00ff]" />
                   </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}