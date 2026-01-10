import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Compare() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem('currency') || 'USD');
    };
    window.addEventListener('storage', handleStorageChange);
    
    const unsub = onSnapshot(collection(db, "packages"), (snap) => {
      setPackages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsub();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("You can compare up to 3 packages at once.");
      }
    }
  };

  const selectedPackages = packages.filter(pkg => selectedIds.includes(pkg.id));

  return (
    <div className="min-h-screen bg-[#0B1812] p-6 md:p-16 text-white font-sans">
      <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-2 hover:opacity-70 transition">
        <span>←</span> Return Home
      </button>

      <div className="text-center mb-16">
        <span className="text-mint font-bold text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Value Analysis</span>
        <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter">Market <br/> Comparison</h1>
      </div>

      {/* SIDE-BY-SIDE VIEW (Visible when items are selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-xl"
          >
            {selectedPackages.map(pkg => (
              <div key={pkg.id} className="relative p-6 border border-mint/20 rounded-3xl bg-[#0B1812]">
                <button 
                  onClick={() => toggleSelection(pkg.id)}
                  className="absolute top-4 right-4 text-red-500 font-black text-[10px] uppercase"
                >Remove</button>
                <img src={pkg.img} className="w-full h-32 object-cover rounded-2xl mb-4 grayscale hover:grayscale-0 transition duration-500" alt="" />
                <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">{pkg.name}</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Location</span>
                    <span className="text-[10px] font-bold">{pkg.location}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Type</span>
                    <span className="text-[10px] font-bold text-mint italic">{pkg.type}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Investment</span>
                    <span className="text-lg font-black text-white">
                       {currency === 'USD' ? `$${pkg.price}` : `LKR ${(pkg.price * 300).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Empty States to encourage selection */}
            {[...Array(3 - selectedPackages.length)].map((_, i) => (
              <div key={i} className="border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center p-12">
                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Select an experience below</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARKET INVENTORY TABLE */}
      <div className="overflow-x-auto">
        <h3 className="text-mint font-black text-[10px] uppercase tracking-widest mb-6 px-4">Available Inventory</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-white/10 uppercase text-[9px] tracking-[0.3em] text-gray-500">
              <th className="p-6">Select</th>
              <th className="p-6">Experience</th>
              <th className="p-6">Type</th>
              <th className="p-6">Location</th>
              <th className="p-6">Price</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr 
                key={pkg.id} 
                onClick={() => toggleSelection(pkg.id)}
                className={`border-b border-white/5 transition cursor-pointer hover:bg-white/[0.04] ${selectedIds.includes(pkg.id) ? 'bg-mint/5' : ''}`}
              >
                <td className="p-6">
                  <div className={`w-5 h-5 rounded-full border-2 transition ${selectedIds.includes(pkg.id) ? 'bg-mint border-mint' : 'border-white/20'}`} />
                </td>
                <td className="p-6 font-black italic uppercase text-sm leading-none">
                  {pkg.name}
                  <span className="block text-[8px] font-bold text-gray-600 tracking-widest mt-1">REF ID: {pkg.id.slice(0, 5)}</span>
                </td>
                <td className="p-6 text-[10px] font-black text-mint uppercase tracking-tighter italic">{pkg.type}</td>
                <td className="p-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest">{pkg.location}</td>
                <td className="p-6 font-black text-white text-sm">
                  {currency === 'USD' ? `$${pkg.price}` : `LKR ${(pkg.price * 300).toLocaleString()}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}