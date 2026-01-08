import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tourVendors = [
  { id: 1, name: "Aman Resorts", service: "Luxury Suite", basePrice: 600, policy: "Flexible (24h)", icon: "🏨" },
  { id: 2, name: "Ceylon Tour Guides", service: "Private Chauffeur", basePrice: 150, policy: "No Refund", icon: "🚗" },
  { id: 3, name: "Beachside Boutique", service: "Ocean Villa", basePrice: 320, policy: "7-Day Limit", icon: "🌊" }
];

export default function Compare() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [season, setSeason] = useState('Standard'); // Peak, Standard, Low

  const getFinalPrice = (base) => {
    let price = base;
    // Seasonal Pricing Logic
    if (season === 'Peak') price = base * 1.35; // +35% for peak
    if (season === 'Low') price = base * 0.85;  // -15% for off-peak
    
    // Currency Conversion Logic
    if (currency === 'LKR') return `Rs. ${(price * 300).toLocaleString()}`;
    if (currency === 'EUR') return `€${(price * 0.92).toFixed(0)}`;
    return `$${price.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      <button onClick={() => navigate('/')} className="text-mint font-black mb-10 text-[10px] uppercase border-b border-mint pb-1 cursor-pointer">← Back to Explore</button>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">Booking<br/>Analysis</h1>
            <p className="text-gray-500 font-bold text-xs uppercase mt-4 tracking-[0.3em]">Project 10: Multi-Vendor Engine</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* SEASON SELECTOR */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              {['Peak', 'Standard', 'Low'].map(s => (
                <button key={s} onClick={() => setSeason(s)} className={`px-6 py-2 rounded-xl text-[9px] font-black transition ${season === s ? 'bg-white text-forest' : 'text-gray-500'}`}>{s}</button>
              ))}
            </div>
            {/* CURRENCY SELECTOR */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
              {['USD', 'LKR', 'EUR'].map(curr => (
                <button key={curr} onClick={() => setCurrency(curr)} className={`px-8 py-3 rounded-full text-[10px] font-black transition ${currency === curr ? 'bg-mint text-forest shadow-xl' : 'text-gray-400'}`}>{curr}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {tourVendors.map((v) => (
            <div key={v.id} className="luxury-card p-10 rounded-[45px] flex flex-col md:flex-row items-center justify-between border border-white/5 hover:bg-white/5 transition shadow-2xl">
              <div className="flex items-center gap-8">
                <div className="text-5xl bg-white/5 w-24 h-24 flex items-center justify-center rounded-[30px] shadow-inner">{v.icon}</div>
                <div>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">{v.name}</h3>
                  <p className="text-mint font-bold uppercase text-[10px] tracking-widest mt-1 underline decoration-mint/30 underline-offset-4">{v.service}</p>
                </div>
              </div>

              <div className="hidden lg:block text-center border-x border-white/10 px-14">
                <p className="text-gray-500 font-black uppercase text-[9px] mb-2 tracking-widest">Policy</p>
                <p className="font-bold text-gray-300 italic text-sm">{v.policy}</p>
              </div>

              <div className="text-right">
                <p className="text-gray-500 font-black uppercase text-[9px] mb-1 tracking-widest italic">
                  {season} Pricing Applied
                </p>
                <p className="text-5xl font-black text-white italic tracking-tighter">
                  {getFinalPrice(v.basePrice)}
                </p>
                <button className="bg-white text-forest px-8 py-3 rounded-xl font-black text-[10px] uppercase mt-4 hover:bg-mint transition shadow-lg transform active:scale-95">Check Availability</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}