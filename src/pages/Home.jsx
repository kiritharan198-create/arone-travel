import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const topPackages = [
  { id: 1, name: '9-Arch Luxury Stay', price: 450, type: 'Boutique Hotel', img: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800', location: 'Ella, Sri Lanka', details: 'A premium stay overlooking the historic railway bridge with private mountain trekking.' },
  { id: 2, name: 'Sigiriya Private Guide', price: 85, type: 'Local Expert', img: 'https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=800', location: 'Sigiriya', details: 'Expert-led climb of the Lion Rock fortress including entrance to the royal gardens.' },
  { id: 3, name: 'Southern Surf Tour', price: 320, type: 'Experience', img: 'https://images.pexels.com/photos/3311073/pexels-photo-3311073.jpeg?auto=compress&cs=tinysrgb&w=800', location: 'Mirissa Beach', details: 'All-inclusive 3-day surf camp with professional instructors and luxury coastal transport.' },
  { id: 4, name: 'Kandy Cultural Villa', price: 210, type: 'Hotel', img: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', location: 'Kandy Lake', details: 'Stay in a restored colonial mansion minutes away from the Temple of the Tooth.' }
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedPkg, setSelectedPkg] = useState(null); // State for the popup

  return (
    <div className="min-h-screen bg-[#0B1812]">
      {/* 1. NAVIGATION BAR */}
      <nav className="flex justify-between items-center px-12 py-10 sticky top-0 z-50 bg-[#0B1812]/90 backdrop-blur-md border-b border-white/5">
        <div className="text-4xl font-black text-white tracking-tighter cursor-pointer" onClick={() => navigate('/')}>ARONE</div>
        
        <div className="hidden md:flex gap-14 text-[12px] font-black uppercase tracking-[0.2em] text-white">
          <button onClick={() => navigate('/destinations')} className="hover:text-mint transition transform hover:scale-110">Destinations</button>
          <button onClick={() => navigate('/compare')} className="hover:text-mint transition transform hover:scale-110">Compare</button>
          <button onClick={() => navigate('/itinerary')} className="hover:text-mint transition transform hover:scale-110">Planner</button>
          <button onClick={() => navigate('/agents')} className="hover:text-mint transition transform hover:scale-110">Vendors</button>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="bg-white text-forest px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-mint transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-[85vh] px-6 mt-4">
        <div className="w-full h-full rounded-[60px] overflow-hidden relative border border-white/5 shadow-2xl">
          <img src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920" className="w-full h-full object-cover" alt="Sri Lanka Tourism" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1812] via-[#0B1812]/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-center px-16 lg:px-32">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-mint font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block italic">Project 10 • Experience Booking Platform</span>
              <h1 className="text-7xl md:text-[100px] font-black text-white leading-[0.85] mb-12 tracking-tighter uppercase italic">
                The Pearl <br/> of the <br/> Indian Ocean
              </h1>
              <div className="flex flex-wrap gap-6">
                <button onClick={() => navigate('/destinations')} className="bg-mint text-forest px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white transition-all">Start Exploring</button>
                <button onClick={() => navigate('/admin')} className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition">Admin Portal</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS STATS */}
      <section className="px-10 py-32 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center group">
          <h3 className="text-5xl font-black text-white mb-4 italic group-hover:text-mint transition">15%</h3>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Fixed Commission Rates</p>
        </div>
        <div className="text-center group border-x border-white/5">
          <h3 className="text-5xl font-black text-white mb-4 italic group-hover:text-mint transition">500+</h3>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Verified Tour Vendors</p>
        </div>
        <div className="text-center group">
          <h3 className="text-5xl font-black text-white mb-4 italic group-hover:text-mint transition">24/7</h3>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Traveler Support</p>
        </div>
      </section>

      {/* 4. FEATURED TOURS (Top Picks) */}
      <main className="px-10 py-10 max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-end mb-16 px-4">
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Top Picks</h2>
          <button onClick={() => navigate('/destinations')} className="text-mint font-black uppercase text-[10px] tracking-widest border-b border-mint pb-1">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {topPackages.map((pkg) => (
            <motion.div 
              whileHover={{ y: -15 }} 
              key={pkg.id} 
              className="cursor-pointer group"
              onClick={() => setSelectedPkg(pkg)} // Open Detail Logic
            >
              <div className="aspect-[4/5] rounded-[50px] overflow-hidden mb-8 border border-white/10 relative">
                <img src={pkg.img} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition duration-700" alt={pkg.name} />
                <div className="absolute top-8 right-8 bg-forest/90 text-mint px-4 py-2 rounded-full font-black text-[10px] tracking-tighter shadow-2xl">${pkg.price}</div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{pkg.name}</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-2">{pkg.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* --- POPUP DETAIL OVERLAY --- */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedPkg(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-[#0B1812] border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden relative z-10 p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPkg(null)}
                className="absolute top-6 right-6 text-white text-xl hover:text-mint"
              >✕</button>
              <img src={selectedPkg.img} className="w-full h-60 object-cover rounded-[30px] mb-6" alt={selectedPkg.name} />
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedPkg.name}</h3>
                <span className="bg-mint/10 text-mint px-3 py-1 rounded-full text-[9px] font-black uppercase">{selectedPkg.type}</span>
              </div>
              <p className="text-mint font-bold uppercase text-[10px] tracking-widest mb-4 italic">📍 {selectedPkg.location}</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 italic">
                {selectedPkg.details}
              </p>
              <div className="flex justify-between items-center border-t border-white/5 pt-6">
                <p className="text-2xl font-black text-white italic">${selectedPkg.price}</p>
                <button onClick={() => navigate('/compare')} className="bg-white text-forest px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition">Check Availability</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER */}
      <footer className="mt-40 px-12 py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">ARONE TRAVELS</h2>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Assigned to: Lokisha & Sinthuja <br/>
              Project 10: Tourism & Travel Platform
            </p>
          </div>
          <div className="flex gap-10 text-gray-500 font-black text-[9px] uppercase tracking-[0.3em]">
            <span className="hover:text-mint transition cursor-pointer">Instagram</span>
            <span className="hover:text-mint transition cursor-pointer">LinkedIn</span>
            <span className="hover:text-mint transition cursor-pointer">Privacy Policy</span>
          </div>
          <div className="text-right">
             <p className="text-mint font-black text-[12px] italic">© 2026 Arone Digital</p>
          </div>
        </div>
      </footer>
    </div>
  );
}