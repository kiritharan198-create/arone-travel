import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Destinations() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrency(localStorage.getItem('currency') || 'USD');
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = onSnapshot(collection(db, "packages"), (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAddToPlan = async (pkg) => {
    if (!auth.currentUser) {
      alert("Please sign in to build your itinerary!");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "itineraries"), {
        userId: auth.currentUser.uid,
        packageId: pkg.id,
        name: pkg.name,
        location: pkg.location,
        img: pkg.img,
        addedAt: serverTimestamp()
      });
      alert("Added to your Personal Itinerary!");
      setSelectedPkg(null);
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
        <div>
          <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">← Back to Home</button>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">Explore <br/> Sri Lanka</h1>
        </div>
        <div className="w-full md:w-96">
          <input 
            type="text" 
            placeholder="SEARCH BY REGION (ELLA, KANDY...)" 
            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-mint transition"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredPackages.map((pkg) => (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={pkg.id} className="group cursor-pointer" onClick={() => setSelectedPkg(pkg)}>
            <div className="aspect-square rounded-[40px] overflow-hidden mb-6 border border-white/5 relative shadow-2xl">
              <img src={pkg.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
              <div className="absolute bottom-6 left-6 bg-white text-forest px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">
                {currency === 'USD' ? `$${pkg.price}` : `LKR ${(pkg.price * 300).toLocaleString()}`}
              </div>
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none mb-2">{pkg.name}</h3>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">{pkg.location}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPkg(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0B1812] border border-white/10 w-full max-w-lg rounded-[40px] p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <img src={selectedPkg.img} className="w-full h-52 object-cover rounded-[30px] mb-6 shadow-2xl" alt="" />
              <h3 className="text-3xl font-black italic uppercase mb-2 leading-none">{selectedPkg.name}</h3>
              <p className="text-mint font-black text-sm mb-4">
                {currency === 'USD' ? `$${selectedPkg.price}` : `LKR ${(selectedPkg.price * 300).toLocaleString()}`}
              </p>
              <p className="text-gray-400 text-sm italic mb-10 leading-relaxed">{selectedPkg.details}</p>
              <div className="flex gap-4">
                <button disabled={loading} onClick={() => handleAddToPlan(selectedPkg)} className="flex-1 bg-white text-forest py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-mint transition disabled:bg-gray-700">
                  {loading ? "Adding..." : "Add to Plan"}
                </button>
                <button onClick={() => navigate('/compare')} className="flex-1 border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition">Compare</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}