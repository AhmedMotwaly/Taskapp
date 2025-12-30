"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle, Shield, AlertTriangle, FileText } from "lucide-react";

export default function TermsOfServicePage() {
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
        <section className="pt-16 pb-8 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] text-xs font-bold mb-6">
              <Scale size={12} />
              TERMS OF SERVICE
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            
            <p className="text-gray-400 mb-6">
              <strong>Effective Date:</strong> December 23, 2025 | <strong>Governing Law:</strong> Germany (German Civil Code - BGB)
            </p>

            <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
              <p className="text-sm text-gray-300 leading-relaxed">
                These Terms of Service ("Terms") govern your use of AutoBuy Guard's price tracking service ("Service"). 
                By creating an account or using our Service, you agree to be bound by these Terms. 
                If you do not agree, please do not use our Service.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-6 max-w-4xl space-y-12">

            {/* Acceptance */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <CheckCircle className="text-[#00ff88]" size={24} />
                1. Acceptance of Terms
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-3 text-gray-300">
                <p>
                  By accessing or using AutoBuy Guard, you confirm that:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>You are at least 16 years old (GDPR requirement)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>You have the legal capacity to enter into binding contracts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>All registration information you provide is accurate and current</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>You will comply with all applicable laws and regulations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Service Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">2. Service Description</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-4 text-gray-300">
                <p><strong className="text-[#00f3ff]">2.1 What We Provide:</strong></p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00ff88]">✓</span>
                    <span>Price tracking for products from supported retailers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00ff88]">✓</span>
                    <span>Automated notifications when price thresholds are met</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00ff88]">✓</span>
                    <span>Historical price data and analytics</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00ff88]">✓</span>
                    <span>Restock monitoring for out-of-stock items</span>
                  </li>
                </ul>

                <p className="mt-4"><strong className="text-[#ff00ff]">2.2 What We Do NOT Provide:</strong></p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">✗</span>
                    <span>We do not sell products directly</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">✗</span>
                    <span>We do not guarantee price accuracy at all times</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>We do not guarantee product availability</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>We are not responsible for retailer policies or transactions</span>
                  </li>
                </ul>

                <div className="mt-4 p-4 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded-lg">
                  <p className="text-sm text-[#ff00ff]">
                    <strong>Important:</strong> We act as an information service only. All purchases are made directly with retailers. 
                    We are not a party to any transaction between you and third-party sellers.
                  </p>
                </div>
              </div>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl space-y-4 text-gray-300">
                <p><strong className="text-[#00f3ff]">3.1 Account Creation:</strong></p>
                <p>You must create an account to use our Service. You agree to:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Provide accurate, complete information</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Maintain the security of your password</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Immediately notify us of unauthorized access</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Not share your account with others</span>
                  </li>
                </ul>

                <p className="mt-4"><strong className="text-[#ff00ff]">3.2 Account Termination:</strong></p>
                <p>We reserve the right to suspend or terminate accounts that:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Violate these Terms</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Engage in fraudulent activity</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Attempt to abuse or exploit the Service</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Violate applicable laws</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Subscription & Payment */}
            <div>
              <h2 className="text-2xl font-bold mb-4">4. Subscription & Payment</h2>
              <div className="space-y-4">
                
                <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                  <h3 className="font-bold text-lg mb-3 text-[#00f3ff]">4.1 Plans & Pricing</h3>
                  <p>We offer Free, Pro, and Ultra subscription plans. Prices are listed on our Pricing page and may change with 30 days notice.</p>
                </div>

                <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                  <h3 className="font-bold text-lg mb-3 text-[#00f3ff]">4.2 Billing</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span>Subscriptions are billed monthly or yearly in advance</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span>Payments are processed securely via Stripe</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span>All prices include applicable VAT (German MwSt.)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00ff88]">•</span>
                      <span>Automatic renewal unless cancelled before billing date</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                  <h3 className="font-bold text-lg mb-3 text-[#ff00ff]">4.3 Cancellation & Refunds</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Cancel Anytime:</strong> You may cancel your subscription at any time via the dashboard.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>7-Day Technical Guarantee:</strong> Refund provided if the software fails to perform technically (as described in our Help Center).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#00f3ff]">•</span>
                      <span><strong>Service Continues:</strong> Access remains until the end of the current billing period after cancellation.</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-400">
                    German law provides a 14-day statutory withdrawal right (Widerrufsrecht) for distance sales contracts. See Section 13 for details on how to exercise this right.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield className="text-[#00ff88]" size={24} />
                5. Acceptable Use Policy
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p><strong className="text-[#ff00ff]">You agree NOT to:</strong></p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Use automated scraping tools or bots beyond normal Service usage</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Attempt to reverse engineer or decompile the Service</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Sell, resell, or commercialize access to the Service</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Use the Service for illegal purposes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Violate third-party intellectual property rights</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Transmit viruses, malware, or harmful code</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Overload or interfere with Service infrastructure</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Violation may result in immediate termination without refund and potential legal action.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p>
                  All content, features, and functionality of AutoBuy Guard (including but not limited to software, text, graphics, logos, design) 
                  are owned by us or our licensors and protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="mt-3">
                  You may not copy, modify, distribute, sell, or create derivative works without express written permission.
                </p>
              </div>
            </div>

            {/* Data & Privacy */}
            <div>
              <h2 className="text-2xl font-bold mb-4">7. Data & Privacy</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p className="mb-3">
                  Your use of the Service is also governed by our <Link href="/privacy" className="text-[#00f3ff] underline">Privacy Policy</Link>, 
                  which is incorporated into these Terms by reference. By using our Service, you consent to:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Collection and processing of your data as described in the Privacy Policy</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Use of cookies and similar technologies</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Data storage in EU-based servers (AWS Frankfurt)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Disclaimers */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <AlertTriangle className="text-[#ff00ff]" size={24} />
                8. Disclaimers & Warranties
              </h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-4">
                <div className="p-4 bg-[#ff00ff]/10 border border-[#ff00ff]/30 rounded-lg">
                  <p className="text-sm uppercase font-bold text-[#ff00ff] mb-2">IMPORTANT LEGAL NOTICE</p>
                  <p className="text-sm">
                    The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, 
                    including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                </div>

                <p><strong>We do not warrant that:</strong></p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>The Service will be uninterrupted or error-free</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Price data is always 100% accurate</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Products will be available at tracked prices</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>All notifications will be delivered instantly</span>
                  </li>
                </ul>

                <p className="text-sm text-gray-400 mt-3">
                  Note: Under German law (BGB), certain mandatory warranties cannot be excluded for consumer contracts. 
                  This disclaimer does not affect your statutory rights.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p>
                  To the maximum extent permitted by applicable law, AutoBuy Guard shall not be liable for:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Indirect, incidental, special, or consequential damages</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Loss of profits, revenue, or business opportunities</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Missed deals or price increases</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Actions or omissions of third-party retailers</span>
                  </li>
                </ul>
                <p className="mt-4">
                  <strong>Maximum Liability:</strong> Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
                <p className="text-sm text-gray-400 mt-3">
                  This limitation does not apply to liability for intentional misconduct (Vorsatz) or gross negligence (grobe Fahrlässigkeit) under German law.
                </p>
              </div>
            </div>

            {/* Indemnification */}
            <div>
              <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p>
                  You agree to indemnify and hold harmless AutoBuy Guard from any claims, damages, losses, or expenses 
                  (including legal fees) arising from:
                </p>
                <ul className="space-y-2 ml-6 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Your violation of these Terms</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Your violation of any laws or regulations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Your infringement of third-party rights</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#00f3ff]">•</span>
                    <span>Unauthorized use of your account</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-bold mb-4">11. Modifications to Service & Terms</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p><strong className="text-[#00f3ff]">Service Changes:</strong></p>
                <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice.</p>
                
                <p className="mt-4"><strong className="text-[#00f3ff]">Terms Updates:</strong></p>
                <p>
                  We may update these Terms periodically. Material changes will be notified via email or prominent website notice at least 30 days in advance. 
                  Continued use after changes constitutes acceptance.
                </p>
              </div>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-bold mb-4">12. Third-Party Links & Services</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p>
                  Our Service contains links to third-party websites and retailers. We are not responsible for:
                </p>
                <ul className="space-y-2 ml-6 mt-3">
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Content, policies, or practices of third-party sites</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Transactions between you and retailers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ff00ff]">•</span>
                    <span>Product quality, delivery, or customer service</span>
                  </li>
                </ul>
                <p className="mt-3">
                  Your dealings with third parties are solely between you and them.
                </p>
              </div>
            </div>

            {/* Right of Withdrawal (German Law) */}
            <div>
              <h2 className="text-2xl font-bold mb-4">13. Right of Withdrawal (Widerrufsrecht - German Law)</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p className="font-bold text-[#00ff88]">14-Day Withdrawal Right:</p>
                <p>
                  As a consumer in Germany/EU, you have the right to withdraw from this contract within 14 days without giving any reason.
                </p>
                
                <div className="p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg mt-3">
                  <p className="text-sm">
                    <strong>To exercise this right:</strong> Send clear written notice to <span className="font-mono">legal@autobuyguard.store</span> within 14 days 
                    of subscription purchase. We will refund all payments received from you within 14 days of receiving your withdrawal notice.
                  </p>
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  <strong>Note:</strong> If you request immediate service start, you acknowledge that your withdrawal right expires once the Service is fully provided.
                </p>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div>
              <h2 className="text-2xl font-bold mb-4">14. Dispute Resolution & Governing Law</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300 space-y-3">
                <p><strong className="text-[#00f3ff]">Governing Law:</strong></p>
                <p>These Terms are governed by the laws of Germany, excluding conflict-of-law provisions.</p>
                
                <p className="mt-3"><strong className="text-[#ff00ff]">Jurisdiction:</strong></p>
                <p>
                  For disputes with consumers, jurisdiction is determined by applicable consumer protection laws. 
                  For commercial users, exclusive jurisdiction is Berlin, Germany.
                </p>

                <p className="mt-3"><strong className="text-[#00ff88]">EU Online Dispute Resolution:</strong></p>
                <p>
                  EU consumers can use the ODR platform: <a href="https://ec.europa.eu/consumers/odr" className="text-[#00ff88] underline" target="_blank">ec.europa.eu/consumers/odr</a>
                </p>
              </div>
            </div>

            {/* Severability */}
            <div>
              <h2 className="text-2xl font-bold mb-4">15. Severability & Entire Agreement</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p>
                  If any provision of these Terms is found unenforceable, the remaining provisions remain in full effect. 
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and AutoBuy Guard.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold mb-4">16. Contact Information</h2>
              <div className="p-6 bg-black/40 border border-white/10 rounded-xl text-gray-300">
                <p className="mb-3">For questions about these Terms:</p>
                <div className="p-4 bg-black/60 rounded-lg font-mono text-sm">
                  <strong className="text-[#00f3ff]">Legal Department:</strong><br />
                  Email: legal@autobuyguard.store<br />
                  Address: Balatonstraße, Berlin, Germany
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
              <Link href="/privacy">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00f3ff]/50 transition-all text-center">
                  <Shield className="mx-auto text-[#00f3ff] mb-3" size={32} />
                  <p className="font-bold">Privacy Policy</p>
                </div>
              </Link>
              <Link href="/gdpr">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#00ff88]/50 transition-all text-center">
                  <FileText className="mx-auto text-[#00ff88] mb-3" size={32} />
                  <p className="font-bold">GDPR Rights</p>
                </div>
              </Link>
              <Link href="/contact">
                <div className="p-6 bg-black/60 border border-white/10 rounded-xl hover:border-[#ff00ff]/50 transition-all text-center">
                  <Scale className="mx-auto text-[#ff00ff] mb-3" size={32} />
                  <p className="font-bold">Contact Legal</p>
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