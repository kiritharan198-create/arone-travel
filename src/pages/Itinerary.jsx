import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const travelStops = [
  { id: 1, name: "Colombo Luxury Suite", type: "Accommodation", price: 200, img: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 2, name: "Ella Rock Hike", type: "Guided Tour", price: 50, img: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 3, name: "Galle Heritage Walk", type: "Experience", price: 40, img: "https://images.pexels.com/photos/3311073/pexels-photo-3311073.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 4, name: "Private Coastal Driver", type: "Transport", price: 120, img: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800" }
];

export default function Itinerary() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState([]);

  const addToTrip = (stop) => {
    setTrip([...trip, { ...stop, day: trip.length + 1 }]);
  };

  const removeFromTrip = (index) => {
    const newTrip = trip.filter((_, i) => i !== index);
    const reordered = newTrip.map((item, i) => ({ ...item, day: i + 1 }));
    setTrip(reordered);
  };

  // Calculate Total Price
  const totalBasePrice = trip.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate('/')} 
        className="text-mint font-black mb-10 text-[10px] uppercase border-b border-mint pb-1 transition hover:text-white hover:border-white"
      >
        ← Return to Explore
      </button>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: SELECTION LIST */}
        <div className="lg:col-span-7">
          <header className="mb-12">
            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-[0.85]">Custom<br/>Itinerary</h1>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-4 italic">Build your dream Sri Lankan journey</p>
          </header>

          <div className="grid gap-6">
            {travelStops.map(stop => (
              <div key={stop.id} className="luxury-card p-6 rounded-[35px] flex items-center gap-8 border border-white/5 hover:bg-white/5 transition group">
                <div className="relative overflow-hidden rounded-[25px]">
                  <img src={stop.img} className="w-28 h-28 object-cover transition group-hover:scale-110 duration-500" alt={stop.name} />
                  <div className="absolute inset-0 bg-forest/20 group-hover:bg-transparent transition" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{stop.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-mint font-bold text-[9px] uppercase tracking-[0.2em] italic">{stop.type}</span>
                    <span className="text-gray-400 font-black text-[10px] tracking-tighter">${stop.price}</span>
                  </div>
                </div>

                <button 
                  onClick={() => addToTrip(stop)}
                  className="bg-white text-forest px-8 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-mint transition active:scale-95 shadow-xl"
                >
                  Add Stop
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: DYNAMIC TIMELINE */}
        <div className="lg:col-span-5">
          <div className="luxury-card p-12 rounded-[50px] border border-mint/20 sticky top-12 bg-white/[0.02] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 border-b border-white/10 pb-6">Your Timeline</h2>
            
            {trip.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest italic">No stops selected yet...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {trip.map((item, index) => (
                  <div key={index} className="flex gap-6 items-center border-l-2 border-mint/30 pl-8 relative group">
                    <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-mint shadow-[0_0_15px_rgba(167,196,188,0.5)]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-2xl text-mint italic tracking-tighter">Day 0{item.day}</span>
                        <button 
                          onClick={() => removeFromTrip(index)} 
                          className="text-[9px] text-red-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                      <h4 className="font-black uppercase text-lg tracking-tighter leading-none text-white">{item.name}</h4>
                    </div>
                  </div>
                ))}
                
                {/* DYNAMIC PRICE FOOTER */}
                <div className="pt-8 border-t border-white/10 mt-10">
                  <div className="flex justify-between mb-4 font-black uppercase text-[10px] tracking-widest text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-white">${totalBasePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-8 font-black uppercase text-[10px] tracking-widest text-gray-500">
                    <span>Booking Fee (15%)</span>
                    <span className="text-mint">${(totalBasePrice * 0.15).toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-mint text-forest py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    Confirm & Proceed
                  </button>
                  <p className="text-[8px] text-gray-600 text-center mt-4 uppercase font-bold tracking-widest">
                    Secure checkout powered by Arone Payments
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}