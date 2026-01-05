"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; 
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Loader2, ShoppingCart, Zap, ShoppingBag, Edit2, Check, X } from "lucide-react";

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

  // 🆕 Edit State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  // 2. Handle URL Paste (Auto-Preview)
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

  // 🆕 5. Start Editing Target Price
  const startEditing = (item: any) => {
    setEditingItemId(item.itemId);
    setEditTargetPrice(item.targetPrice.toString());
  };

  // 🆕 6. Cancel Editing
  const cancelEditing = () => {
    setEditingItemId(null);
    setEditTargetPrice("");
  };

  // 🆕 7. Save Updated Target Price
  const handleUpdateTargetPrice = async (itemId: string) => {
    const newPrice = parseFloat(editTargetPrice);
    
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid price");
      return;
    }

    setIsUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/items/${itemId}/target-price`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ targetPrice: newPrice })
      });

      if (!res.ok) throw new Error("Failed to update");

      // Update local state
      setItems(items.map(item => 
        item.itemId === itemId 
          ? { ...item, targetPrice: newPrice } 
          : item
      ));

      // Reset edit state
      setEditingItemId(null);
      setEditTargetPrice("");
    } catch (err) {
      alert("Error updating target price.");
    } finally {
      setIsUpdating(false);
    }
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
                  onBlur={handlePreview}
                />
                <Button variant="outline" onClick={handlePreview} disabled={isPreviewing} className="border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10">
                  {isPreviewing ? <Loader2 className="animate-spin" /> : "Check"}
                </Button>
              </div>
            </div>
          </div>

          {/* PREVIEW SECTION */}
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

      {/* --- ITEMS GRID --- */}
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
                  
                  {/* 🆕 EDITABLE TARGET PRICE */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Target</p>
                    
                    {editingItemId === item.itemId ? (
                      // EDIT MODE
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <Input 
                          type="number"
                          value={editTargetPrice}
                          onChange={(e) => setEditTargetPrice(e.target.value)}
                          className="h-8 w-20 text-sm bg-black/30 border-[#00f3ff] text-white text-right"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleUpdateTargetPrice(item.itemId)}
                          disabled={isUpdating}
                          className="text-green-500 hover:text-green-400 p-1"
                        >
                          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="text-red-500 hover:text-red-400 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      // VIEW MODE
                      <div className="flex items-center justify-end gap-2 group/edit">
                        <p className="text-xl font-mono text-[#00f3ff]">€{item.targetPrice}</p>
                        <button 
                          onClick={() => startEditing(item)}
                          className="opacity-0 group-hover/edit:opacity-100 text-gray-500 hover:text-[#00f3ff] transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
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