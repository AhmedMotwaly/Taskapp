"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ExternalLink, Loader2, ShoppingBag, Crosshair, Clock, CheckCircle, XCircle } from "lucide-react";
import { VariantSelector } from '@/components/VariantSelector';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function RestockSniperClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string> | null>(null);

  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchItems = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_URL}/restock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) setItems(res.data);
    } catch (err) {
      console.error("Failed to load restock items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsAdding(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const previewRes = await axios.post(`${API_URL}/restock/preview`, 
        { url },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setPreviewData(previewRes.data);

      if (previewRes.data.hasVariants && previewRes.data.variants && previewRes.data.variants.length > 0) {
        setShowVariantSelector(true);
        setIsAdding(false);
        return;
      }

      await addRestockItem(null);

    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to fetch product");
      setIsAdding(false);
    }
  };

  const addRestockItem = async (variants: Record<string, string> | null) => {
    try {
      setIsAdding(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/restock`, {
        url,
        notes,
        selectedVariants: variants,
        notifyEmail: true,
        notifySMS: false,
        notifyBrowser: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUrl('');
      setNotes('');
      setShowVariantSelector(false);
      setPreviewData(null);
      setSelectedVariants(null);
      
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to add item");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Stop monitoring this item?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/restock/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return "text-green-500";
      case 'OUT_OF_STOCK': return "text-red-500";
      default: return "text-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return <CheckCircle size={16} className="text-green-500" />;
      case 'OUT_OF_STOCK': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Restock Sniper</h1>
        <p className="text-gray-400">Monitor out-of-stock items and get alerts the moment they return.</p>
      </div>

      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Product URL</label>
              <Input 
                placeholder="https://store.com/product..." 
                className="bg-black/20 border-white/10 text-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="w-full md:w-1/3 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Notes (Optional)</label>
              <Input 
                placeholder="e.g. Size 10" 
                className="bg-black/20 border-white/10 text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleAddItem} 
              disabled={isAdding || !url}
              className="w-full md:w-auto bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold shadow-[0_0_20px_rgba(0,243,255,0.2)] min-w-[140px]"
            >
              {isAdding ? <Loader2 className="animate-spin" /> : "Track Restock"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center text-[#00f3ff] py-10"><Loader2 className="animate-spin mx-auto" size={40}/></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <Crosshair size={48} className="mx-auto mb-4 text-gray-600" />
          <p>No items monitored. Add a target above!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.restockId} className="bg-black/40 border-white/10 backdrop-blur-md group hover:border-[#00f3ff]/50 transition-all">
              <CardContent className="p-5 relative">
                <button 
                  onClick={() => handleDelete(item.restockId)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-md p-2 flex items-center justify-center shrink-0">
                    {item.imageUrl && item.imageUrl.startsWith('http') ? (
                      <img src={item.imageUrl} className="max-h-full max-w-full object-contain" alt="Product" />
                    ) : (
                      <ShoppingBag size={24} className="text-black"/>
                    )}
                  </div>
                  <div className="pr-6">
                    <h3 className="font-bold text-white line-clamp-2 text-sm h-10 mb-1" title={item.title}>
                      {item.title || "Tracking..."}
                    </h3>
                    <a href={item.url} target="_blank" className="text-xs text-[#00f3ff] flex items-center gap-1 hover:underline">
                      View Product <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {item.notes && (
                   <p className="text-xs text-gray-500 mb-4 italic truncate">Note: {item.notes}</p>
                )}

                {item.selectedVariants && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.entries(item.selectedVariants).map(([key, value]) => (
                      <span 
                        key={key}
                        className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded text-[10px] uppercase font-bold"
                      >
                        {key}: {value as string}
                      </span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                    <div className={`flex items-center gap-2 font-bold ${getStatusColor(item.currentStatus)}`}>
                      {getStatusIcon(item.currentStatus)}
                      <span className="text-sm">
                        {item.currentStatus === 'IN_STOCK' ? "IN STOCK" : "OUT OF STOCK"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase mb-1">Last Checked</p>
                    <p className="text-sm font-mono text-white">
                      {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Pending"}
                    </p>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showVariantSelector && previewData && (
        <VariantSelector
          variants={previewData.variants}
          productTitle={previewData.title}
          productImage={previewData.image}
          onConfirm={(selected) => {
            setSelectedVariants(selected);
            addRestockItem(selected);
          }}
          onCancel={() => {
            setShowVariantSelector(false);
            setIsAdding(false);
          }}
        />
      )}
    </div>
  );
}