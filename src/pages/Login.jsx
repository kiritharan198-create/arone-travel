import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('traveler'); 

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'vendor') {
      navigate('/agents');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1812] flex items-center justify-center p-6 relative">
      
      {/* --- BACK NAVIGATION --- */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-12 left-12 text-mint font-black text-[10px] uppercase tracking-[0.3em] border-b border-mint/30 pb-1 hover:border-mint transition-all flex items-center gap-2"
      >
        <span className="text-lg">←</span> Back to Home
      </button>

      {/* --- CLOSE ICON --- */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-12 right-12 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition"
      >
        ✕
      </button>

      <div className="max-w-md w-full luxury-card p-12 rounded-[60px] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-mint/5 blur-[80px] rounded-full" />
        
        <div className="text-center mb-10 relative">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Access <br/> Portal</h1>
          <p className="text-[10px] text-mint font-bold uppercase tracking-[0.3em] mt-4 opacity-70">Project 10: Tourism Management</p>
        </div>

        {/* ROLE SWITCHER */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5 relative">
          <button 
            onClick={() => setRole('traveler')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-500 ${role === 'traveler' ? 'bg-mint text-forest shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Traveler
          </button>
          <button 
            onClick={() => setRole('vendor')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-500 ${role === 'vendor' ? 'bg-mint text-forest shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Vendor
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative">
          <div className="group">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4 group-focus-within:text-mint transition">Email Identifier</label>
            <input 
              type="email" 
              required 
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 mt-2 text-white focus:outline-none focus:border-mint focus:bg-white/[0.07] transition-all" 
              placeholder="e.g. traveler@arone.com" 
            />
          </div>
          <div className="group">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-4 group-focus-within:text-mint transition">Secure Password</label>
            <input 
              type="password" 
              required 
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 mt-2 text-white focus:outline-none focus:border-mint focus:bg-white/[0.07] transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-white text-forest py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-mint hover:scale-[1.02] transition-all active:scale-95 mt-4"
          >
            Authenticate {role}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            New to Arone? <span className="text-mint cursor-pointer hover:underline underline-offset-4">Create Account</span>
          </p>
        </div>
      </div>
    </div>
  );
}