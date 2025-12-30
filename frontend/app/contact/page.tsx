"use client";

import { useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, MessageSquare, Clock, Send, Check, AlertCircle,
  Linkedin
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // EmailJS Credentials
    const serviceID = "service_5gcapii";
    const templateID = "template_w3z2ljd";
    const publicKey = "3yetahzWvgq09WKEX";

    // UPDATED: Sending to support@autobuyguard.store
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_email: "support@autobuyguard.store" 
    };

    try {
      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 3000);
      
    } catch (error) {
      console.error("Failed to send email:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
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
          <Link href="/help">
            <Button variant="outline" className="border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10">
              Help Center
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Hero Section */}
        <section className="pt-20 pb-12 text-center relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] text-xs font-bold mb-8">
              <MessageSquare size={12} />
              GET IN TOUCH
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              We're Here to Help
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Methods Cards */}
        <section className="py-12 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              
              {/* Email Card */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-xl text-center hover:border-[#00f3ff]/50 transition-all">
                <Mail className="mx-auto text-[#00f3ff] mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Email Support</h3>
                <p className="text-sm text-gray-400 mb-4">
                  For general inquiries
                </p>
                <a 
                  href="mailto:support@autobuyguard.store" 
                  className="text-[#00f3ff] hover:underline text-sm"
                >
                  support@autobuyguard.store
                </a>
              </div>

              {/* Support Hours Card */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-xl text-center hover:border-[#ff00ff]/50 transition-all">
                <Clock className="mx-auto text-[#ff00ff] mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Support Hours</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Monday - Friday
                </p>
                <p className="text-[#ff00ff] font-mono text-sm">
                  9:00 - 17:00 CET
                </p>
              </div>

              {/* LinkedIn Card - UPDATED LINK */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-xl text-center hover:border-[#00ff88]/50 transition-all">
                <Linkedin className="mx-auto text-[#00ff88] mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">Professional</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Connect for opportunities
                </p>
                <a 
                  href="https://www.linkedin.com/in/ahmad-farouk/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] hover:underline text-sm"
                >
                  LinkedIn Profile
                </a>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="max-w-2xl mx-auto">
              <div className="p-8 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name"
                      required
                      className="bg-black/60 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff]"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      required
                      className="bg-black/60 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff]"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Subject</Label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="What's this about?"
                      required
                      className="bg-black/60 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00f3ff]"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 block">Message</Label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us more..."
                      required
                      rows={6}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:border-[#00f3ff] focus:outline-none resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "sending" || status === "success"}
                    className="w-full bg-[#00f3ff] text-black hover:bg-[#00cceb] py-6 font-bold transition-all disabled:opacity-50"
                  >
                    {status === "sending" && (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                        Sending...
                      </span>
                    )}
                    {status === "success" && (
                      <span className="flex items-center gap-2">
                        <Check size={20} />
                        Message Sent!
                      </span>
                    )}
                    {status === "idle" && (
                      <span className="flex items-center gap-2">
                        <Send size={20} />
                        Send Message
                      </span>
                    )}
                    {status === "error" && (
                      <span className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        Failed. Try Again.
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    We typically respond within 24 hours during business days
                  </p>
                </form>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-16 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h3 className="text-2xl font-bold mb-6">Looking for Quick Answers?</h3>
            <p className="text-gray-400 mb-8">Check out our Help Center for instant solutions</p>
            <Link href="/help">
              <Button variant="outline" className="border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10">
                Browse Help Articles
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2025 AutoBuy Guard. Built with ❤️ for smart shoppers.</p>
        </div>
      </footer>
    </div>
  );
}