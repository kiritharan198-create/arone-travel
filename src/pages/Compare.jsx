import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Compare() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "packages"), (snap) => {
      setPackages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1812] p-10 text-white">
      <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-10">← Return</button>
      <h1 className="text-5xl font-black italic uppercase mb-20 tracking-tighter text-center">Market <br/> Comparison</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-white/5 bg-white/[0.02] rounded-[40px]">
          <thead>
            <tr className="text-left border-b border-white/10 uppercase text-[10px] tracking-widest text-gray-500">
              <th className="p-8">Experience</th>
              <th className="p-8">Type</th>
              <th className="p-8">Location</th>
              <th className="p-8">Price</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="p-8 font-black italic uppercase text-sm">{pkg.name}</td>
                <td className="p-8 text-[10px] font-bold text-mint uppercase">{pkg.type}</td>
                <td className="p-8 text-gray-400 text-xs">{pkg.location}</td>
                <td className="p-8 font-black text-white">${pkg.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}