'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Check, 
  Loader2, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Rocket, 
  CreditCard, 
  X 
} from 'lucide-react';

import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js';

const stripePromise: Promise<StripeClient | null> = loadStripe('pk_live_51MF2soBscOYnMBsvMKuwoqh1sEEUHrqLpY0LgEAzqpGaMUUA3nHG7U1TnMvLNs2ppKevC9mncaPSZLBVKmqbDKeN00WlcQrTPQ');

type StripeCheckoutClient = StripeClient & {
  redirectToCheckout: (options: { sessionId: string }) => Promise<unknown>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface SubscriptionData {
  tier: string;
  status: string;
  price: number;
  nextBillingDate: string;
}

export default function ManageSubscriptionClient() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // --- PLANS CONFIGURATION ---
  const plans = [
    {
      id: 'free',
      name: 'Free Forever',
      price: 0,
      description: "Perfect for getting started",
      features: ['1 tracked product', 'Checks every 24 hours', 'Email notifications'],
      color: 'green',
      glow: 'from-green-500 to-emerald-500',
      btnText: 'Current Plan',
      icon: Shield
    },
    {
      id: 'pro', 
      name: 'Pro Hunter',
      price: 5,
      popular: true,
      description: "For serious deal hunters",
      features: ['50 tracked products', 'Checks every 5 minutes', 'Email + SMS alerts', 'Priority support'],
      color: 'fuchsia', 
      glow: 'from-fuchsia-600 to-pink-600',
      btnText: 'Turbocharge Your Tracking',
      icon: Zap
    },
    {
      id: 'ultra',
      name: 'Maximum Power',
      price: 10,
      description: "Maximum power for power users",
      features: ['Unlimited products', 'Checks every 30 seconds', 'All alerts', 'Auto-checkout'],
      color: 'cyan',
      glow: 'from-cyan-500 to-blue-500',
      btnText: 'Unlock Limitless Power',
      icon: Rocket
    }
  ];

  // --- EFFECTS & API CALLS ---
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/subscription/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(res.data);
      setCurrentPlan(res.data.tier);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handlePlanChange = async (planId: string) => {
    if (planId === currentPlan) return;
    
    if (planId === 'free') {
      alert('Contact support to downgrade');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.post(`${API_URL}/subscription/create-checkout`, 
        { tier: planId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start checkout');
      setLoading(false);
    }
  };

  const handleCheckoutCancel = () => {
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
    setPaymentMethod('');
  };

  const handleCheckoutConfirm = async () => {
    if (!selectedPlan) return;
    if (!paymentMethod) {
      alert('Please select a payment method to continue');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await axios.post(`${API_URL}/subscription/change`, 
        { tier: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setCurrentPlan(selectedPlan);
      setIsCheckoutOpen(false);
      fetchSubscription();
      alert('Plan updated successfully!');
    } catch (error) {
      alert('Failed to change plan. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-cyan-500 bg-[#0a0a0a]">
        <Loader2 className="animate-spin" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 animate-in fade-in zoom-in duration-500 relative">
      <div className="max-w-7xl mx-auto mb-12">
        <button 
            onClick={() => router.push('/dashboard/settings')} 
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group"
        >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Settings
        </button>
        
        <div className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                Choose Your <span className="text-fuchsia-500">Power Level</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Upgrade anytime to unlock faster tracking, more items, and exclusive features.
            </p>
        </div>

        {subscription && (
            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl mx-auto backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-500/20 rounded-full text-fuchsia-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Current Active Plan</p>
                        <p className="text-xl font-bold capitalize text-white">{subscription.tier}</p>
                    </div>
                </div>
                {subscription.nextBillingDate && (
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Renews on</p>
                        <p className="font-mono text-white">{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPopular = plan.popular;
            
            const glowColor = plan.color === 'green' ? 'shadow-green-500/20' 
                            : plan.color === 'fuchsia' ? 'shadow-fuchsia-500/40' 
                            : 'shadow-cyan-500/30';
            
            const btnBg = plan.color === 'green' ? 'bg-green-500 hover:bg-green-400' 
                        : plan.color === 'fuchsia' ? 'bg-fuchsia-600 hover:bg-fuchsia-500' 
                        : 'bg-cyan-500 hover:bg-cyan-400';

            const borderColor = isCurrent 
                ? (plan.color === 'green' ? 'border-green-500' : plan.color === 'fuchsia' ? 'border-fuchsia-500' : 'border-cyan-500')
                : 'border-white/10 hover:border-white/20';

            return (
                <div 
                    key={plan.id}
                    className={`relative group rounded-3xl bg-[#0f0f0f] border ${borderColor} p-8 flex flex-col transition-all duration-300 ${isPopular ? 'scale-105 z-10 shadow-2xl' : 'hover:scale-[1.02]'}`}
                >
                    <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-b ${plan.glow} opacity-0 group-hover:opacity-20 transition duration-500 blur-xl`}></div>
                    
                    {isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fuchsia-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(192,38,211,0.6)]">
                            MOST POPULAR
                        </div>
                    )}

                    <div className="relative z-10 text-center mb-8">
                        <div className={`inline-block px-3 py-1 rounded-full border border-${plan.color}-500/30 bg-${plan.color}-500/10 text-${plan.color}-400 text-[10px] font-bold uppercase tracking-wider mb-4`}>
                            {plan.name}
                        </div>
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                            <span className="text-5xl font-bold">€{plan.price}</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>

                    <div className="relative z-10 flex-1 space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-${plan.color}-500/20 flex items-center justify-center text-${plan.color}-400`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePlanChange(plan.id)}
                        disabled={isCurrent}
                        className={`relative z-10 w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isCurrent ? 'bg-gray-800 cursor-default border border-white/10 text-gray-400' : `${btnBg} ${glowColor}`}`}
                    >
                        {isCurrent ? 'Current Plan' : plan.btnText}
                    </button>
                </div>
            );
        })}
      </div>

      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button 
                onClick={handleCheckoutCancel}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-2 text-white">Confirm Subscription</h3>
            <p className="text-gray-400 mb-6 text-sm">Select a payment method to upgrade.</p>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Selected Plan</p>
                <p className="text-lg font-bold text-white">{plans.find(p => p.id === selectedPlan)?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-fuchsia-500">€{plans.find(p => p.id === selectedPlan)?.price}</p>
                <p className="text-xs text-gray-500">/month</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {['Credit Card', 'PayPal', 'Google Pay'].map((method) => (
                <label 
                    key={method} 
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method 
                        ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(192,38,211,0.2)]' 
                        : 'border-white/10 bg-black/20 hover:bg-white/5'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-fuchsia-500 w-5 h-5"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-white/10">
                        <CreditCard size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-white">{method}</span>
                  </div>
                </label>
              ))}
            </div>

            <button
                onClick={handleCheckoutConfirm}
                disabled={processing || !paymentMethod}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </>
                ) : (
                    'Confirm & Pay'
                )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}