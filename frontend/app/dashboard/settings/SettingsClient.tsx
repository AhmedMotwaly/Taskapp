'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { User, Lock, CreditCard, Trash2, Save, Loader2, ShieldAlert, Smartphone, Bell } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface UserData {
  fullName: string;
  email: string;
  subscriptionTier?: string;
  smsNumber?: string;
}

export default function SettingsClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  
  // Forms
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [smsNumber, setSmsNumber] = useState(''); // SMS State

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(res.data);
      setProfileForm({ fullName: res.data.fullName, email: res.data.email });
      setSmsNumber(res.data.smsNumber || ''); // Load existing number
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: 'Failed to load user data', type: 'error' });
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      fetchUserData();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to update', type: 'error' });
    }
  };

  const handleUpdateSMS = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/profile`, {
        ...profileForm,
        smsNumber: smsNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Phone number saved!', type: 'success' });
      fetchUserData();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save phone number', type: 'error' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setMessage({ text: 'Type DELETE to confirm', type: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error: any) {
      setMessage({ text: 'Failed to delete account', type: 'error' });
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-cyan-500">
        <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-gray-400">Manage your profile, security, and billing preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg border backdrop-blur-md ${
            message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="float-right hover:text-white">×</button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* PROFILE CARD */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Profile Details</h2>
                        <p className="text-xs text-gray-500">Update your personal information</p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6 flex-1 flex flex-col">
                    <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider ml-1">Full Name</label>
                        <input
                            type="text"
                            value={profileForm.fullName || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            // AERO GLASS INPUT STYLE
                            className="w-full bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-cyan-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            type="email"
                            value={profileForm.email || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            // AERO GLASS INPUT STYLE
                            className="w-full bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-cyan-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="pt-4 mt-auto">
                        <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/10">
                            <Save size={18} />
                            Save Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* SECURITY CARD */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Security</h2>
                        <p className="text-xs text-gray-500">Protect your account with a strong password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider ml-1">Current Password</label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            // AERO GLASS INPUT STYLE (Purple Focus)
                            className="w-full bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-purple-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider ml-1">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                // AERO GLASS INPUT STYLE (Purple Focus)
                                className="w-full bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-purple-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider ml-1">Confirm</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                // AERO GLASS INPUT STYLE (Purple Focus)
                                className="w-full bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-purple-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/10">
                            <Lock size={18} />
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>

      {/* --- SMS NOTIFICATIONS SECTION (Orange/Amber Theme) --- */}
      <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex items-start gap-6 flex-1">
                      <div className="p-4 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                          <Smartphone size={32} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-white mb-2">SMS Notifications</h2>
                          <div className="flex items-center gap-2 mb-2">
                            <Bell size={14} className="text-orange-400"/>
                            <span className="text-sm font-medium text-orange-200">Instant Stock & Price Alerts</span>
                          </div>
                          <p className="text-gray-500 text-sm max-w-lg">
                              Add your phone number to receive instant text messages when items restock or drop in price. 
                              Requires <strong>Pro</strong> or <strong>Ultra</strong> plan.
                          </p>
                      </div>
                  </div>

                  <div className="w-full md:w-96">
                      <label className="block text-xs font-bold text-orange-400 mb-2 uppercase tracking-wider ml-1">Mobile Number</label>
                      <div className="flex gap-3">
                          <input
                              type="tel"
                              value={smsNumber}
                              onChange={(e) => setSmsNumber(e.target.value)}
                              // AERO GLASS INPUT STYLE (Orange Focus)
                              className="flex-1 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-orange-500/50 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 outline-none font-mono tracking-wide"
                              placeholder="+49 123 456789"
                          />
                          <button 
                            onClick={handleUpdateSMS}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold px-6 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10"
                          >
                            Save
                          </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-3 ml-1">
                          Format: Use international format (e.g., +49 for Germany, +1 for USA).
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* SUBSCRIPTION BANNER */}
      <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="flex items-start gap-6">
                  <div className="p-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                      <CreditCard size={32} />
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Subscription Plan</h2>
                      <div className="flex items-center gap-3">
                          <span className="text-gray-400">Current Status:</span>
                          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                              {user.subscriptionTier || 'FREE TIER'}
                          </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2 max-w-md">
                          Upgrade to unlock unlimited tracking, faster checks, and instant SMS alerts.
                      </p>
                  </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                   <button 
                      onClick={() => router.push('/dashboard/settings/manage-subscription')} 
                      className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all duration-300"
                   >
                      Manage Plan
                  </button>
                  <button 
                      onClick={() => router.push('/dashboard/settings/billing-history')} 
                      className="flex-1 md:flex-none px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                      View History
                  </button>
              </div>
          </div>
      </div>

      {/* DANGER ZONE */}
      <div className="border border-red-500/20 bg-red-950/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
                  <ShieldAlert size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white">Danger Zone</h3>
                  <p className="text-gray-400 text-sm">
                      Permanently delete your account and all data. This cannot be undone.
                  </p>
              </div>
          </div>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="px-6 py-2 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg font-bold transition-all whitespace-nowrap"
          >
            Delete Account
          </button>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-6 text-red-500">
                <Trash2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Delete Account?</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
                This will permanently delete your tracked items, subscription history, and settings.
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Type "DELETE" to confirm</label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-black/50 border border-red-900/50 rounded-lg p-3 text-red-500 focus:border-red-500 outline-none font-mono"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                className="flex-1 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}