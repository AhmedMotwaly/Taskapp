"use client";

import { useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser"; // <--- Added Import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, Eye, Download, Trash2, Edit, Lock, 
  XCircle, FileText, Check, Send, AlertCircle
} from "lucide-react";

const rights = [
  {
    icon: Eye,
    title: "Right to Access",
    subtitle: "Article 15 GDPR",
    description: "Request a copy of all personal data we hold about you",
    color: "text-[#00f3ff]",
    action: "Request Access"
  },
  {
    icon: Edit,
    title: "Right to Rectification",
    subtitle: "Article 16 GDPR",
    description: "Correct inaccurate or incomplete data",
    color: "text-[#ff00ff]",
    action: "Request Correction"
  },
  {
    icon: Trash2,
    title: "Right to Erasure",
    subtitle: "Article 17 GDPR",
    description: "Request deletion of your personal data ('Right to be Forgotten')",
    color: "text-[#ff0055]",
    action: "Request Deletion"
  },
  {
    icon: Lock,
    title: "Right to Restrict Processing",
    subtitle: "Article 18 GDPR",
    description: "Limit how we use your data under certain circumstances",
    color: "text-[#00ff88]",
    action: "Request Restriction"
  },
  {
    icon: Download,
    title: "Right to Data Portability",
    subtitle: "Article 20 GDPR",
    description: "Receive your data in a machine-readable format",
    color: "text-[#00f3ff]",
    action: "Export My Data"
  },
  {
    icon: XCircle,
    title: "Right to Object",
    subtitle: "Article 21 GDPR",
    description: "Object to processing based on legitimate interests",
    color: "text-[#ff00ff]",
    action: "File Objection"
  },
];

export default function GDPRRightsPage() {
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    requestType: "",
    details: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // --- EMAILJS CONFIGURATION (Client-Side) ---
    const serviceID = "service_5gcapii";
    const templateID = "template_w3z2ljd";
    const publicKey = "3yetahzWvgq09WKEX";

    // Map GDPR fields to the existing Contact Template variables
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      // We format the subject so you know it's a GDPR request in your inbox
      subject: `[GDPR REQUEST] ${formData.requestType}`, 
      message: `Request Details: ${formData.details}`,
      to_email: "privacy@autobuyguard.store"
    };

    try {
      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setStatus("success");
      
      // Clear form after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setSelectedRight(null);
        setFormData({ name: "", email: "", requestType: "", details: "" });
      }, 3000);

    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please check your connection.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-black/60 text-white font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </Link>
          <Link href="/privacy">
            <Button variant="outline" className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 text-sm">
              Privacy Policy
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Hero */}
        <section className="pt-20 pb-12 relative z-10">
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold mb-8">
              <Shield size={12} />
              YOUR PRIVACY RIGHTS
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              GDPR Rights Center
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Take control of your personal data. Exercise your rights under the EU General Data Protection Regulation.
            </p>

            <div className="p-6 bg-black/40 border border-white/10 rounded-xl max-w-3xl mx-auto">
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong className="text-[#00ff88]">Response Time:</strong> We will respond to your request within <strong>30 days</strong> (or 60 days for complex requests). 
                All requests are <strong>free of charge</strong> unless manifestly unfounded or excessive.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights Grid */}
        <section className="py-12 border-t border-white/10 relative z-10">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Your Privacy Rights</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rights.map((right, i) => (
                <div 
                  key={i}
                  className="group p-6 bg-black/40 border border-white/10 rounded-xl hover:border-white/30 transition-all cursor-pointer hover:-translate-y-1"
                  onClick={() => {
                    setSelectedRight(right.title);
                    setFormData({...formData, requestType: right.title});
                  }}
                >
                  <right.icon className={`${right.color} mb-4 group-hover:scale-110 transition-transform`} size={32} />
                  <h3 className="font-bold text-lg mb-1">{right.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{right.subtitle}</p>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{right.description}</p>
                  <Button 
                    size="sm" 
                    className={`w-full ${
                      right.color.includes('00f3ff') ? 'bg-[#00f3ff] text-black hover:bg-[#00cceb]' :
                      right.color.includes('ff00ff') ? 'bg-[#ff00ff] text-white hover:bg-[#cc00cc]' :
                      right.color.includes('ff0055') ? 'bg-[#ff0055] text-white hover:bg-[#cc0044]' :
                      'bg-[#00ff88] text-black hover:bg-[#00cc6a]'
                    }`}
                  >
                    {right.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request Form */}
        {selectedRight && (
          <section className="py-12 border-t border-white/10 bg-black/40 relative z-10">
            <div className="container mx-auto px-6 max-w-3xl">
              <div className="p-8 bg-black/60 border border-[#00f3ff]/50 rounded-xl shadow-[0_0_30px_rgba(0,243,255,0.2)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Submit Your Request</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRight(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle size={20} />
                  </Button>
                </div>

                {status === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="text-[#00ff88]" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#00ff88]">Request Submitted!</h3>
                    <p className="text-gray-400 mb-6">
                      We've received your request and will respond within 30 days to <strong>{formData.email}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      Reference Number: <span className="font-mono text-[#00f3ff]">GDPR-{Date.now().toString().slice(-6)}</span>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="text-gray-300 mb-2 block">Selected Right</Label>
                      <div className="p-4 bg-[#00f3ff]/10 border border-[#00f3ff]/30 rounded-lg">
                        <p className="font-bold text-[#00f3ff]">{selectedRight}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300 mb-2 block">Full Name *</Label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Your full legal name"
                        required
                        className="bg-black/60 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff]"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300 mb-2 block">Email Address *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="your@email.com (must match account email)"
                        required
                        className="bg-black/60 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Must match the email registered with your account for verification
                      </p>
                    </div>

                    <div>
                      <Label className="text-gray-300 mb-2 block">Additional Details</Label>
                      <textarea
                        value={formData.details}
                        onChange={(e) => setFormData({...formData, details: e.target.value})}
                        placeholder="Provide any additional context that might help us process your request..."
                        rows={5}
                        className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:border-[#00f3ff] focus:outline-none resize-none"
                      />
                    </div>

                    <div className="p-4 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong className="text-[#ff00ff]">Verification Required:</strong> To protect your privacy, 
                        we may request additional verification (e.g., government ID) for certain requests, especially data access and deletion.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full bg-[#00f3ff] text-black hover:bg-[#00cceb] py-6 font-bold transition-all disabled:opacity-50"
                    >
                      {status === "sending" ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={20} />
                          Submit GDPR Request
                        </span>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you confirm the information provided is accurate and complete
                    </p>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="py-16 border-t border-white/10 relative z-10">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl font-bold mb-12 text-center">How the Process Works</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Submit Request", desc: "Fill out the form with your details", icon: Send },
                { step: "2", title: "Verification", desc: "We verify your identity (if needed)", icon: Shield },
                { step: "3", title: "Processing", desc: "We review and process your request", icon: FileText },
                { step: "4", title: "Response", desc: "Receive our response within 30 days", icon: Check },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-[#00f3ff]/10 border-2 border-[#00f3ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="text-[#00f3ff]" size={24} />
                  </div>
                  <div className="w-12 h-12 bg-black/60 border border-[#00f3ff] rounded-full flex items-center justify-center mx-auto mb-4 -mt-8 relative z-10">
                    <span className="text-2xl font-bold text-[#00f3ff]">{item.step}</span>
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-white/10 bg-black/40 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "How long does it take to process my request?",
                  a: "We aim to respond within 30 days. For complex requests, this may be extended to 60 days, and we will inform you if this is the case."
                },
                {
                  q: "Is there a fee for exercising my rights?",
                  a: "No. Exercising your GDPR rights is completely free of charge, unless your request is manifestly unfounded or excessive."
                },
                {
                  q: "What verification do you require?",
                  a: "For security, we may ask for government-issued ID or additional information to confirm your identity before processing sensitive requests like data deletion."
                },
                {
                  q: "Can I withdraw consent for data processing?",
                  a: "Yes. You can withdraw consent at any time via your account settings or by contacting us. Note that withdrawal doesn't affect previous lawful processing."
                },
                {
                  q: "What if I'm not satisfied with your response?",
                  a: "You have the right to lodge a complaint with your local data protection authority (for Berlin: Berliner Beauftragte für Datenschutz)."
                },
              ].map((faq, i) => (
                <div key={i} className="p-6 bg-black/60 border border-white/10 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-[#00f3ff]">{faq.q}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 border-t border-white/10 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="p-8 bg-black/40 border border-white/10 rounded-xl text-center">
              <AlertCircle className="mx-auto text-[#ff00ff] mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-400 mb-6">
                If you have questions about your privacy rights or need assistance with a request
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-[#00f3ff] text-black hover:bg-[#00cceb]">
                    Contact Privacy Team
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="outline" className="border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10">
                    Read Privacy Policy
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6 font-mono">
                Email: privacy@autobuyguard.store
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2024 AutoBuy Guard • Your Privacy, Your Control • Portfolio Project</p>
        </div>
      </footer>
    </div>
  );
}