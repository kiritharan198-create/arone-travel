import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const regions = [
  { id: 1, name: "Ella", count: "42 Vendors", img: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "Misty mountains and tea estates." },
  { id: 2, name: "Galle", count: "35 Vendors", img: "https://images.pexels.com/photos/3311073/pexels-photo-3311073.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "Colonial charm and golden beaches." },
  { id: 3, name: "Kandy", count: "28 Vendors", img: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "The cultural heart of the island." },
  { id: 4, name: "Mirissa", count: "19 Vendors", img: "https://images.pexels.com/photos/4614343/pexels-photo-4614343.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "Whale watching and surf vibes." },
  { id: 5, name: "Sigiriya", count: "22 Vendors", img: "https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "Ancient lion rock fortress." },
  { id: 6, name: "Yala", count: "15 Vendors", img: "https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800", desc: "Deep jungle wildlife safaris." }
];

export default function Destinations() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      <nav className="flex justify-between items-center mb-20">
        <div className="text-4xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>ARONE</div>
        <button onClick={() => navigate('/')} className="text-mint font-black text-[10px] uppercase border-b border-mint pb-1">← Back Home</button>
      </nav>

      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-black tracking-tighter uppercase italic leading-none"
          >
            Regional <br/> Hubs
          </motion.h1>
          <p className="text-mint font-bold text-xs uppercase tracking-[0.4em] mt-6 italic">Browse Local Tour Providers & Hotels</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {regions.map((region) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              key={region.id} 
              className="luxury-card rounded-[50px] overflow-hidden border border-white/5 bg-white/[0.02] cursor-pointer group"
              onClick={() => navigate('/compare')}
            >
              <div className="h-80 overflow-hidden relative">
                <img src={region.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={region.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8">
                  <span className="bg-mint text-forest px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{region.count}</span>
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">{region.name}</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">{region.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-mint font-black text-[10px] uppercase tracking-widest group-hover:underline">Explore Local Vendors</span>
                  <span className="text-white text-xl">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}