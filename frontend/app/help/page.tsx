"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, BookOpen, Zap, CreditCard, Settings, 
  Bell, HelpCircle, ChevronRight, ChevronDown
} from "lucide-react";

// --- SANITIZED CONTENT DATA (Realistic MVP Features) ---
const helpData = [
  {
    id: "getting-started",
    icon: BookOpen,
    title: "Getting Started",
    description: "Everything you need to set up your first tracker.",
    articles: [
      { 
        id: "gs-1",
        title: "How to Create Your First Product Tracker", 
        content: `Welcome to AutoBuy Guard! Setting up your first tracker takes less than 60 seconds. Here's your complete guide:

📍 STEP 1: FIND YOUR PRODUCT
Navigate to any supported retailer (Amazon, MediaMarkt, Saturn, Otto, etc.). Find the product you want to track and copy the COMPLETE URL from your browser's address bar.

📍 STEP 2: ACCESS THE DASHBOARD
Log into your AutoBuy Guard dashboard. Click the "New Tracker" button.

📍 STEP 3: CONFIGURE YOUR TRACKER
Paste the URL into the input field. Our system will:
✓ Detect the retailer
✓ Fetch the current price
✓ Identify stock status

Set your "Target Price" — this is the maximum amount you're willing to pay. We recommend setting this 10-20% below the current price.

📍 STEP 4: LAUNCH & MONITOR
Click "Start Tracking". Your tracker status will show:
• 🟢 Active: Successfully monitoring
• 🟡 Checking: Currently fetching data
• 🔴 Error: Issue detected (check URL)

💡 PRO TIP: Create multiple trackers for the same product across different retailers (e.g., check both Amazon and MediaMarkt) to maximize your chances!`
      },
      { 
        id: "gs-2",
        title: "Understanding Price Alerts", 
        content: `Price alerts are the core feature of AutoBuy Guard.

🎯 HOW THEY WORK
Our system continuously monitors your tracked products. When the price drops BELOW your set target price, we instantly notify you via Email or SMS (depending on your plan).

⚡ ALERT TRIGGERS
An alert fires when:
1. Current price ≤ Your target price
2. Product is in stock
3. Alert cooldown has passed (to prevent spam)

📊 CHECK FREQUENCY
Your plan determines how often we check:
• Free Plan: Daily checks
• Pro Plan: Every 12 Hours
• Ultra Plan: Every 6 Hours

⏰ COOLDOWN SYSTEM
After sending an alert, we pause notifications for that specific item for 2 hours so your inbox doesn't get flooded, unless the price drops *further*.`
      },
    ]
  },
  {
    id: "features",
    icon: Zap,
    title: "Features Guide",
    description: "Deep dive into Restock monitoring and Multi-store support.",
    articles: [
      { 
        id: "feat-1",
        title: "Restock Alerts Explained", 
        content: `Restock Alerts help you catch out-of-stock items the moment they become available.

🔄 HOW IT WORKS
Instead of tracking price, we monitor the "Add to Cart" button.
If an item is "Sold Out" or "Currently Unavailable," our system watches for that status to change to "In Stock."

🎯 SETTING UP
1. Add a product URL (even if sold out).
2. The system detects the "Out of Stock" status.
3. You will be automatically notified based on your plan settings.
4. As soon as stock returns, you get an alert.`
      },
      { 
        id: "feat-3",
        title: "Multi-Store Tracking", 
        content: `Track the same product across multiple retailers simultaneously.

The best way to secure a deal is to cast a wide net.
Example: A Sony Headset might be out of stock on Amazon, but available on Saturn.

How to maximize success:
1. Find the product on Amazon and create a new tracker for it.
2. Find the same product on MediaMarkt and create a second, separate tracker.
3. Repeat for other stores (Saturn, Otto, etc.).
4. You can now monitor all these sources from your main dashboard view.`
      },
    ]
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Manage your subscription and payments.",
    articles: [
      { 
        id: "bill-1",
        title: "Choosing the Right Plan", 
        content: `Find the perfect plan for your deal-hunting needs.

🆓 FREE PLAN — €0/mo
• 1 Tracker
• Daily Price Checks
• Email Support

⭐ PRO PLAN — €5/mo
• 10 Trackers
• 12 Hours Price Checks
• Email & SMS Alerts
• Priority Support

👑 ULTRA PLAN — €10/mo
• Unlimited Trackers
• 6 Hours "Turbo" Checks
• Multi-Store Support
• Fastest Alert Speeds

💡 You can upgrade or downgrade at any time from your account settings.`
      },
      { 
        id: "bill-3",
        title: "Payment Methods", 
        content: `We use Stripe for secure payment processing.

💳 ACCEPTED METHODS
• Visa
• Mastercard
• American Express
• Cartes Bancaires (Europe)

🔒 SECURITY
• All transactions are encrypted (SSL).
• We do NOT store your credit card numbers on our servers.
• Payments are processed directly by Stripe, a global leader in payment security.`
      },
      { 
        id: "bill-4",
        title: "Refund Policy", 
        content: `We offer a 7-day money-back guarantee for technical failures.

✅ ELIGIBLE FOR REFUND
• Service features not working as described.
• Billing errors.

❌ NOT ELIGIBLE
• Missing a deal because an item sold out too fast (market demand is outside our control).
• Changing your mind after the 7-day window.

To request a refund, please contact support via the dashboard.`
      },
    ]
  },
  {
    id: "account",
    icon: Settings,
    title: "Account Settings",
    description: "Manage profile and privacy.",
    articles: [
      { 
        id: "acc-1",
        title: "Managing Your Profile", 
        content: `You can update your details in the Settings tab.

📧 EMAIL
Used for login and alerts. If you change this, you will need to re-verify your new address.

🌍 TIMEZONE
Ensure your timezone is set correctly so that your "Last Checked" timestamps match your local time.`
      },
      { 
        id: "acc-3",
        title: "Deleting Your Account", 
        content: `⚠️ DANGER ZONE

Deleting your account is permanent.
• All trackers will be stopped.
• Your subscription will be cancelled immediately.
• Your data will be wiped from our database.

This action cannot be undone. If you just want to take a break, consider cancelling your subscription instead of deleting your account entirely.`
      },
    ]
  },
  {
    id: "troubleshooting",
    icon: HelpCircle,
    title: "Troubleshooting",
    description: "Common issues and how to fix them.",
    articles: [
      { 
        id: "ts-1",
        title: "Tracker Error / Not Working", 
        content: `If your tracker status is Red (Error):

1. CHECK THE URL
Did you copy the full link? Short links (like amzn.to) sometimes fail. Use the full browser URL.

2. SUPPORTED STORE?
Check if the retailer is on our supported list. We primarily support major EU/US retailers (Amazon, Otto, MediaMarkt, etc.).

3. OUT OF STOCK
Sometimes a retailer page changes completely when out of stock, causing our scanner to fail. Try clicking "Refresh" on the tracker.`
      },
      { 
        id: "ts-2",
        title: "Not Receiving Emails", 
        content: `If the dashboard says "Alert Sent" but you didn't get it:

1. SPAM FOLDER
Check your Spam or Junk folder. This is the #1 cause.

2. GMAIL PROMOTIONS
If you use Gmail, check the "Promotions" tab.

3. EMAIL TYPO
Check your Profile settings to ensure your email address doesn't have a typo.`
      },
    ]
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [expandedArticle, setExpandedArticle] = useState<string | null>("gs-1");

  const selectedCategoryData = helpData.find(c => c.id === activeCategory);

  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return null;

    const lowerQuery = searchQuery.toLowerCase();
    const results: any[] = [];

    helpData.forEach(category => {
      category.articles.forEach(article => {
        if (
          article.title.toLowerCase().includes(lowerQuery) || 
          article.content.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ ...article, categoryTitle: category.title });
        }
      });
    });

    return results;
  };

  const searchResults = getSearchResults();

  return (
    <div className="min-h-screen bg-black/60 text-white font-sans flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/contact">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                Contact Support
              </Button>
            </Link>
            <Link href="/">
               <Button className="bg-[#00f3ff] text-black hover:bg-[#00cceb]">
                 Back to Home
               </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 max-w-7xl">
        
        {/* Page Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff00ff]/10 border border-[#ff00ff]/30 text-[#ff00ff] text-xs font-bold mb-6">
            <HelpCircle size={12} />
            KNOWLEDGE BASE
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Documentation & Support
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="text-gray-500" size={20} />
            </div>
            <Input 
              type="text" 
              placeholder="Search guides, errors, or settings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00f3ff] rounded-xl"
            />
          </div>
        </div>

        {/* MASTER - DETAIL LAYOUT */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
          
          {/* LEFT SIDEBAR (Navigation) */}
          <div className="space-y-2 sticky top-24">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">Categories</h3>
            
            {helpData.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedArticle(null);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat.id && !searchQuery
                    ? "bg-[#00f3ff]/10 border-[#00f3ff]/50 text-[#00f3ff]" 
                    : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <cat.icon size={18} className={activeCategory === cat.id && !searchQuery ? "text-[#00f3ff]" : "text-gray-500"} />
                {cat.title}
                {activeCategory === cat.id && !searchQuery && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="min-h-[500px]">
             
             {searchQuery ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8 border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Search size={32} className="text-[#ff00ff]" />
                      <h2 className="text-3xl font-bold">Search Results</h2>
                    </div>
                    <p className="text-gray-400 text-lg">
                      Found {searchResults?.length} article{searchResults?.length !== 1 && 's'} for "{searchQuery}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    {searchResults && searchResults.length > 0 ? (
                      searchResults.map((article: any) => {
                         const isOpen = expandedArticle === article.id;
                         return (
                          <div 
                            key={article.id} 
                            className={`
                              border rounded-xl transition-all duration-300
                              ${isOpen ? "bg-white/5 border-[#00f3ff]/30" : "bg-black/20 border-white/10 hover:border-white/20"}
                            `}
                          >
                            <button
                              onClick={() => toggleArticle(article.id)}
                              className="w-full flex flex-col text-left p-6 focus:outline-none"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`font-semibold text-lg ${isOpen ? "text-[#00f3ff]" : "text-gray-200"}`}>
                                  {article.title}
                                </span>
                                <div className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? "bg-[#00f3ff]/20 rotate-180" : "bg-white/5"}`}>
                                  <ChevronDown size={20} className={isOpen ? "text-[#00f3ff]" : "text-gray-400"} />
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                                Found in: {article.categoryTitle}
                              </span>
                            </button>

                            <div 
                              className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                            >
                              <div className="overflow-hidden">
                                <div className="px-6 pb-6 pt-0 text-gray-300 leading-relaxed whitespace-pre-line border-t border-white/5 mt-2 pt-4">
                                  {article.content}
                                </div>
                              </div>
                            </div>
                          </div>
                         )
                      })
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400">No matching articles found.</p>
                        <Button 
                          variant="link" 
                          className="text-[#00f3ff]"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
             ) : (
               selectedCategoryData && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 border-b border-white/10 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <selectedCategoryData.icon size={32} className="text-[#00f3ff]" />
                        <h2 className="text-3xl font-bold">{selectedCategoryData.title}</h2>
                      </div>
                      <p className="text-gray-400 text-lg">{selectedCategoryData.description}</p>
                    </div>

                    <div className="space-y-4">
                      {selectedCategoryData.articles.map((article) => {
                        const isOpen = expandedArticle === article.id;
                        
                        return (
                          <div 
                            key={article.id} 
                            className={`
                              border rounded-xl transition-all duration-300
                              ${isOpen ? "bg-white/5 border-[#00f3ff]/30" : "bg-black/20 border-white/10 hover:border-white/20"}
                            `}
                          >
                            <button
                              onClick={() => toggleArticle(article.id)}
                              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                              <span className={`font-semibold text-lg ${isOpen ? "text-[#00f3ff]" : "text-gray-200"}`}>
                                {article.title}
                              </span>
                              <div className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? "bg-[#00f3ff]/20 rotate-180" : "bg-white/5"}`}>
                                <ChevronDown size={20} className={isOpen ? "text-[#00f3ff]" : "text-gray-400"} />
                              </div>
                            </button>

                            <div 
                              className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                            >
                              <div className="overflow-hidden">
                                <div className="px-6 pb-6 pt-0 text-gray-300 leading-relaxed whitespace-pre-line border-t border-white/5 mt-2 pt-4">
                                  {article.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Contextual Help */}
                    <div className="mt-12 p-6 bg-black/40 border border-dashed border-white/20 rounded-xl text-center">
                      <p className="text-gray-400 mb-4">Did not find the answer you were looking for?</p>
                      <Link href="/contact">
                        <Button variant="link" className="text-[#00f3ff] hover:text-[#00ffcc] p-0 h-auto font-bold">
                          Message our Support Team &rarr;
                        </Button>
                      </Link>
                    </div>
                 </div>
               )
             )}
          </div>

        </div>

      </main>
    </div>
  );
}