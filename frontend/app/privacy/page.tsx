"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Download, Trash2, FileText, AlertCircle, Smartphone } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black/60 text-white font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10 bg-black/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ffcc]">
            AutoBuy Guard
          </Link>
          <Link href="/gdpr">
            <Button variant="outline" className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 text-sm">
              Your GDPR Rights
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Hero */}
        <section className="pt-16 pb-8 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold mb-6">
              <Shield size={12} />
              LEGAL DOCUMENT
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            
            <p className="text-gray-400 mb-6">
              <strong>Last Updated:</strong> December 23, 2025
            </p>

            <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
              <p className="text-sm text-gray-300 leading-relaxed">
                AutoBuy Guard ("we", "us", or "our") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our price tracking service. This policy complies with the 
                <strong className="text-[#00ff88]"> EU General Data Protection Regulation (GDPR)</strong> and 
                <strong className="text-[#00ff88]"> German Federal Data Protection Act (BDSG)</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl space-y-12">

            {/* Data Controller */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FileText className="text-[#00f3ff]" size={24} />
                1. Data Controller
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-3 text-gray-300">
                <p>The data controller responsible for your personal data is:</p>
                <div className="p-4 bg-black/60 border-l-4 border-[#00f3ff] rounded">
                  <p className="font-mono text-sm">
                    <strong>AutoBuy Guard</strong><br />
                    Ahmed Motwaly<br />
                    Balatonstraße<br />
                    10319, Berlin, Germany<br />
                    Email: <span className="text-[#00f3ff]">privacy@autobuyguard.store</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Data We Collect */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Eye className="text-[#ff00ff]" size={24} />
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                
                <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-[#ff00ff]">2.1 Information You Provide</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Account Data:</strong> Name, email address, password (encrypted), and phone number (if you enable SMS alerts).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Payment Information:</strong> Processed securely via Stripe (we do not store full credit card numbers).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Tracking Data:</strong> Product URLs and target price thresholds.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Communications:</strong> Support messages, feedback, survey responses.</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-400">
                    <strong>Legal Basis (GDPR Art. 6(1)):</strong> Contract performance (Art. 6(1)(b)) and your consent (Art. 6(1)(a)).
                  </p>
                </div>

                <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                  <h3 className="font-bold text-lg mb-3 text-[#ff00ff]">2.2 Automatically Collected Data</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span><strong>Technical Data:</strong> IP address, browser type, device information, operating system.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span><strong>Usage Data:</strong> Pages visited, time spent, features used, click patterns.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span><strong>Cookies:</strong> See our Cookie Policy section below.</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-400">
                    <strong>Legal Basis:</strong> Legitimate interests (Art. 6(1)(f)) - improving service performance and security.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Data */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Lock className="text-[#00ff88]" size={24} />
                3. How We Use Your Data
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                <p className="text-gray-300 mb-4">We process your personal data for the following purposes:</p>
                <div className="space-y-3 text-gray-300">
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Service Delivery:</strong> Track prices and send automated notifications (Email/SMS) based on your plan.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Payment Processing:</strong> Process subscriptions and manage billing via Stripe.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Communication:</strong> Send service updates, respond to inquiries, provide support.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Improvement:</strong> Analyze usage patterns to enhance features and performance.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Security:</strong> Detect fraud, prevent abuse, protect our systems.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-[#00f3ff]">✓</span>
                    <span><strong>Legal Compliance:</strong> Meet regulatory requirements and respond to legal requests.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing & Third Parties</h2>
              <div className="space-y-4">
                <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                  <p className="text-gray-300 mb-4">We share your data with the following trusted service providers:</p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-black/60 rounded-lg border-l-4 border-[#00f3ff]">
                      <p className="font-bold text-[#00f3ff] mb-1">Stripe (Payment Processing)</p>
                      <p className="text-sm text-gray-400">PCI-DSS compliant payment processor. Data stored in EU region.</p>
                    </div>
                    
                    <div className="p-4 bg-black/60 rounded-lg border-l-4 border-[#ff00ff]">
                      <p className="font-bold text-[#ff00ff] mb-1">Amazon Web Services (Hosting)</p>
                      <p className="text-sm text-gray-400">Cloud infrastructure in EU-Central-1 (Frankfurt). GDPR-compliant data processing agreement in place.</p>
                    </div>
                    
                    <div className="p-4 bg-black/60 rounded-lg border-l-4 border-[#00ff88]">
                      <p className="font-bold text-[#00ff88] mb-1">Email Service Provider</p>
                      <p className="text-sm text-gray-400">For transactional emails and account notifications. EU-based servers.</p>
                    </div>

                    <div className="p-4 bg-black/60 rounded-lg border-l-4 border-yellow-400">
                      <p className="font-bold text-yellow-400 mb-1">SMS Gateway (Optional)</p>
                      <p className="text-sm text-gray-400">If you are on a plan with SMS alerts, your phone number is processed by our SMS provider for delivery purposes only.</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-400">
                    <strong>Important:</strong> We never sell your personal data to third parties. All processors are bound by strict data processing agreements.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-bold mb-4">5. Data Retention</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-3 text-gray-300">
                <p>We retain your personal data only as long as necessary:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span><strong>Active Accounts:</strong> Duration of your subscription plus 30 days.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span><strong>Closed Accounts:</strong> Anonymized within 30 days; financial records kept for 10 years (German tax law).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span><strong>Logs/Analytics:</strong> 90 days maximum.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield className="text-[#00ff88]" size={24} />
                6. Your Rights (GDPR Articles 15-22)
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                <p className="text-gray-300 mb-4">Under GDPR, you have the following rights:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Eye, title: "Right to Access", desc: "Request a copy of your personal data" },
                    { icon: FileText, title: "Right to Rectification", desc: "Correct inaccurate data" },
                    { icon: Trash2, title: "Right to Erasure", desc: "Request deletion of your data" },
                    { icon: Lock, title: "Right to Restrict", desc: "Limit how we use your data" },
                    { icon: Download, title: "Right to Portability", desc: "Receive your data in machine-readable format" },
                    { icon: AlertCircle, title: "Right to Object", desc: "Object to certain data processing" },
                  ].map((right, i) => (
                    <div key={i} className="flex gap-3 p-4 bg-black/60 rounded-lg">
                      <right.icon className="text-[#00f3ff] flex-shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-sm mb-1">{right.title}</p>
                        <p className="text-xs text-gray-400">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg">
                  <p className="text-sm text-[#00ff88]">
                    <strong>To exercise your rights:</strong> Email us at <span className="font-mono">privacy@autobuyguard.store</span> or visit our <Link href="/gdpr" className="underline">GDPR Rights Center</Link>. We will respond within 30 days.
                  </p>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold mb-4">7. Cookies & Tracking Technologies</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-4 text-gray-300">
                <p>We use cookies and similar technologies to:</p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-black/60 rounded-lg">
                    <p className="font-bold text-[#00f3ff] mb-2">Essential Cookies (Required)</p>
                    <p className="text-sm text-gray-400">Authentication, security, load balancing. Cannot be disabled.</p>
                  </div>
                  
                  <div className="p-4 bg-black/60 rounded-lg">
                    <p className="font-bold text-[#ff00ff] mb-2">Functional Cookies (Optional)</p>
                    <p className="text-sm text-gray-400">Remember preferences, language settings, theme choices.</p>
                  </div>
                  
                  <div className="p-4 bg-black/60 rounded-lg">
                    <p className="font-bold text-[#00ff88] mb-2">Analytics Cookies (Optional)</p>
                    <p className="text-sm text-gray-400">Help us understand usage patterns. AWS CloudWatch anonymized data.</p>
                  </div>
                </div>

                <p className="text-sm">
                  You can manage cookie preferences via our cookie banner or browser settings. Disabling non-essential cookies may affect functionality.
                </p>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-2xl font-bold mb-4">8. Data Security</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p>We implement industry-standard security measures:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">✓</span>
                    <span>TLS/SSL encryption for data in transit</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">✓</span>
                    <span>AES-256 encryption for data at rest</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">✓</span>
                    <span>Regular security audits and penetration testing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">✓</span>
                    <span>Access controls and role-based permissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">✓</span>
                    <span>Automated backups stored in separate EU region</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Despite our efforts, no system is 100% secure. If you suspect a breach, contact us immediately at security@autobuyguard.store
                </p>
              </div>
            </div>

            {/* International Transfers */}
            <div>
              <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p className="mb-3">
                  Your data is primarily stored in the EU (AWS Frankfurt region). If transfers outside the EU occur, we ensure adequate safeguards:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>EU Standard Contractual Clauses (SCCs)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Adequacy decisions by EU Commission</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p>
                  Our service is not intended for children under 16. We do not knowingly collect data from children. 
                  If you believe a child has provided us with personal data, please contact us immediately for removal.
                </p>
              </div>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p>
                  We may update this Privacy Policy periodically. Material changes will be notified via email or prominent notice on our website. 
                  Continued use after changes constitutes acceptance. Last update: <strong className="text-[#00f3ff]">December 23, 2025</strong>.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold mb-4">12. Contact & Complaints</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-4">
                <p>For privacy-related questions or to exercise your rights:</p>
                
                <div className="p-4 bg-black/60 rounded-lg font-mono text-sm">
                  <strong className="text-[#00f3ff]">Privacy Contact:</strong><br />
                  Email: privacy@autobuyguard.store<br />
                  Mail: Balatonstraße, Berlin, Germany
                </div>

                <div className="p-4 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded-lg">
                  <p className="text-sm">
                    <strong className="text-[#ff00ff]">Right to Lodge a Complaint:</strong><br />
                    You have the right to file a complaint with your local data protection authority:<br />
                    <strong>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong><br />
                    Website: <a href="https://www.datenschutz-berlin.de" className="text-[#ff00ff] underline" target="_blank">datenschutz-berlin.de</a>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 border-t border-white/10 bg-black/40">
          <div className="container mx-auto px-6 max-w-4xl">
            <h3 className="text-xl font-bold mb-6 text-center">Related Documents</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/terms">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00f3ff]/50 transition-all text-center">
                  <FileText className="mx-auto text-[#00f3ff] mb-3" size={32} />
                  <p className="font-bold">Terms of Service</p>
                </div>
              </Link>
              <Link href="/gdpr">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00ff88]/50 transition-all text-center">
                  <Shield className="mx-auto text-[#00ff88] mb-3" size={32} />
                  <p className="font-bold">GDPR Rights</p>
                </div>
              </Link>
              <Link href="/contact">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#ff00ff]/50 transition-all text-center">
                  <AlertCircle className="mx-auto text-[#ff00ff] mb-3" size={32} />
                  <p className="font-bold">Contact Us</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2025 AutoBuy Guard • All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}