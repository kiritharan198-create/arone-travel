import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  const platformStats = [
    { label: "Total Platform GMV", value: "$142,500", icon: "📈" },
    { label: "Net Commission (15%)", value: "$21,375", icon: "💎" },
    { label: "Active Vendors", value: "48", icon: "🏨" },
    { label: "Featured Revenue", value: "$2,400", icon: "🌟" }
  ];

  const vendorRequests = [
    { name: "Hill Country Tea Villas", type: "Hotel", status: "Pending Approval", fee: "$50 Paid" },
    { name: "Ocean Diver Lanka", type: "Experience", status: "Verified", fee: "$50 Paid" }
  ];

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => navigate('/')} className="text-mint font-black text-[10px] uppercase border-b border-mint pb-1">← System Logout</button>
        <div className="bg-white/5 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black text-mint uppercase tracking-widest">
          Admin Session: Lokisha & Sinthuja
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none">Global <br/> Controller</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.4em] mt-4">Tourism Platform Management v1.0</p>
        </header>

        {/* PLATFORM OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {platformStats.map((stat, i) => (
            <div key={i} className="luxury-card p-8 rounded-[40px] border border-white/5 bg-white/[0.01]">
              <div className="text-2xl mb-4">{stat.icon}</div>
              <p className="text-gray-500 font-black uppercase text-[9px] tracking-widest">{stat.label}</p>
              <h2 className="text-3xl font-black italic mt-1">{stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* VENDOR MANAGEMENT */}
          <div className="luxury-card p-10 rounded-[50px] border border-white/5">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Vendor Onboarding</h3>
            <div className="space-y-4">
              {vendorRequests.map((v, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div>
                    <p className="font-black uppercase text-sm tracking-tighter">{v.name}</p>
                    <p className="text-[9px] text-mint font-bold uppercase mt-1">{v.type} • {v.fee} Onboarding</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-4 py-1 rounded-full ${v.status === 'Verified' ? 'bg-mint/10 text-mint' : 'bg-gold/10 text-gold'}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COMMISSION TRACKER */}
          <div className="luxury-card p-10 rounded-[50px] border border-white/5 bg-white/[0.03]">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Revenue Distribution</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-black uppercase text-[10px]">Monthly Commission Goal</span>
                <span className="text-xl font-black italic">$25,000</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-mint w-[85%] shadow-[0_0_15px_rgba(167,196,188,0.5)]" />
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                Total platform commission is calculated at a flat 15% across all bookings. 
                Featured listing fees ($200/mo) are billed separately.
              </p>
              <button className="w-full py-4 bg-white text-forest rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition">
                Export Financial Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}