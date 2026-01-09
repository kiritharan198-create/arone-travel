import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Packages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listener for all packages
    const unsub = onSnapshot(collection(db, "packages"), (snapshot) => {
      setList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="pt-24 text-center font-black text-mint animate-pulse">COLLECTING EXPERIENCES...</div>;

  return (
    <div className="pt-24 px-10 bg-[#0B1812] min-h-screen text-white">
      <h1 className="text-6xl font-black italic uppercase mb-16 text-center tracking-tighter">Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {list.map((pkg) => (
          <div 
            key={pkg.id} 
            onClick={() => navigate(`/package/${pkg.id}`)}
            className="group cursor-pointer bg-white/5 rounded-[40px] overflow-hidden border border-white/10 hover:border-mint/50 transition-all duration-500"
          >
            <div className="h-72 overflow-hidden relative">
              <img src={pkg.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 grayscale-[0.5] group-hover:grayscale-0" alt={pkg.name} />
              <div className="absolute top-6 left-6 bg-mint text-forest px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {pkg.location}
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-black italic uppercase mb-2">{pkg.name}</h2>
              <p className="text-gray-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{pkg.details}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Starting from</p>
                  <p className="text-2xl font-black text-mint">${pkg.price}</p>
                </div>
                <span className="text-[10px] font-black uppercase border border-white/20 px-4 py-2 rounded-full group-hover:bg-white group-hover:text-forest transition">View Itinerary</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}