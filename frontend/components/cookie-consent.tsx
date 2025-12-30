"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem("cookie-consent", JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem("cookie-consent", JSON.stringify(essentialOnly));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          // Main Banner
          <div className="relative p-6 md:p-8 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.3)]">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-[#00f3ff]/10 border border-[#00f3ff]/30 rounded-xl flex items-center justify-center">
                  <Cookie className="text-[#00f3ff]" size={32} />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">We Value Your Privacy</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or decline non-essential cookies.
                </p>
                <a href="/privacy" className="text-[#00f3ff] hover:underline text-sm">
                  Learn more in our Privacy Policy →
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 whitespace-nowrap"
                >
                  <Settings size={16} className="mr-2" />
                  Customize
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/10 whitespace-nowrap"
                >
                  Reject All
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)] whitespace-nowrap"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="relative p-6 md:p-8 bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.3)] max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-white">Cookie Preferences</h3>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="p-5 bg-black/60 border border-white/10 rounded-xl">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                      Essential Cookies
                    </h4>
                    <p className="text-sm text-gray-400">
                      Required for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 bg-[#00ff88]/20 border border-[#00ff88] rounded-full text-xs font-bold text-[#00ff88]">
                      ALWAYS ON
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Used for: Authentication, security, load balancing, form submissions
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="p-5 bg-black/60 border border-white/10 rounded-xl">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${preferences.functional ? 'bg-[#00f3ff]' : 'bg-gray-600'}`}></span>
                      Functional Cookies
                    </h4>
                    <p className="text-sm text-gray-400">
                      Remember your preferences and settings.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f3ff]"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Used for: Language preferences, theme settings, remembered choices
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-5 bg-black/60 border border-white/10 rounded-xl">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${preferences.analytics ? 'bg-[#ff00ff]' : 'bg-gray-600'}`}></span>
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-gray-400">
                      Help us understand how you use our site.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff00ff]"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Used for: AWS CloudWatch anonymized analytics, page views, feature usage
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1 border-[#ff00ff]/30 text-[#ff00ff] hover:bg-[#ff00ff]/10"
              >
                Reject All
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="flex-1 bg-[#00f3ff] text-black hover:bg-[#00cceb] font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                Save Preferences
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1 bg-[#00ff88] text-black hover:bg-[#00cc6a] font-bold"
              >
                Accept All
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change your preferences anytime in your account settings or by clearing your browser cookies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}