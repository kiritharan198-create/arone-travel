import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  
  // Hardcoded example data for the demo
  const bookingRef = "ARN-" + Math.floor(Math.random() * 1000000);

  return (
    <div className="min-h-screen bg-[#0B1812] text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: SUCCESS MESSAGE */}
        <div>
          <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center text-forest text-4xl mb-8 animate-bounce">
            ✓
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none mb-6">Booking<br/>Confirmed</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-10">Your journey with Arone begins now.</p>
          
          <button 
            onClick={() => navigate('/')}
            className="text-mint font-black text-[10px] uppercase border-b border-mint pb-1 hover:text-white hover:border-white transition"
          >
            Return to Dashboard
          </button>
        </div>

        {/* RIGHT SIDE: LUXURY RECEIPT */}
        <div className="luxury-card p-10 rounded-[50px] border border-white/10 relative overflow-hidden bg-white/[0.02]">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Reference</p>
              <p className="text-sm font-black text-white">{bookingRef}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Date</p>
              <p className="text-sm font-black text-white">08 Jan 2026</p>
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase italic">Base Experience</span>
              <span className="text-sm font-black">$450.00</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase italic">Service Fee (15%)</span>
              <span className="text-sm font-black text-mint">$67.50</span>
            </div>
            <div className="flex justify-between pt-4">
              <span className="text-xl font-black uppercase italic italic">Total Paid</span>
              <span className="text-2xl font-black text-white italic tracking-tighter">$517.50</span>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-black uppercase text-mint tracking-widest mb-2">Cancellation Policy</h4>
            <p className="text-[9px] text-gray-500 leading-relaxed font-bold uppercase italic">
              Free cancellation up to 48 hours before arrival. 50% charge applies for late notices. 
              Refunds processed within 3-5 business days.
            </p>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full mt-8 py-4 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-forest transition shadow-xl"
          >
            Download PDF Receipt
          </button>
        </div>

      </div>
    </div>
  );
}