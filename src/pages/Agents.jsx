import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Agents() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      <button onClick={() => navigate('/')} className="text-mint font-black mb-10 text-[10px] uppercase border-b border-mint pb-1">← Exit Portal</button>
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Vendor <br/> Dashboard</h1>
          <p className="text-mint font-bold text-xs uppercase tracking-[0.3em] mt-4">Manage Listings & Revenue</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="luxury-card p-10 rounded-[40px] border border-white/5">
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-2">Total Earnings</p>
            <h2 className="text-4xl font-black italic">$12,840.00</h2>
          </div>
          <div className="luxury-card p-10 rounded-[40px] border border-white/5">
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-2">Commission (15%)</p>
            <h2 className="text-4xl font-black italic text-red-400">-$1,926.00</h2>
          </div>
          <div className="luxury-card p-10 rounded-[40px] border border-white/5">
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-2">Net Payout</p>
            <h2 className="text-4xl font-black italic text-mint">$10,914.00</h2>
          </div>
        </div>

        <div className="luxury-card rounded-[50px] p-12 border border-white/5">
           <div className="flex justify-between items-center mb-10">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter">Your Active Listings</h3>
             <button className="bg-mint text-forest px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg">Featured: On</button>
           </div>
           <div className="space-y-4">
             {["Boutique Villa - Unawatuna", "Private Guide - Ella Rock", "Airport Transfer Luxury"].map((item, i) => (
               <div key={i} className="flex justify-between p-8 bg-white/5 rounded-3xl border border-white/5 items-center">
                 <span className="font-black uppercase tracking-widest text-sm">{item}</span>
                 <span className="bg-mint/10 text-mint px-6 py-2 rounded-full text-[10px] font-black uppercase">Live & Booking</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}