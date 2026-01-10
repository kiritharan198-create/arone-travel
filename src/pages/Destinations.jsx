import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Destinations() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency] = useState(localStorage.getItem('currency') || 'USD');

  // NEW: Initializing state from Home Page search
  const [searchQuery, setSearchQuery] = useState(location.state?.searchParams?.destination || "");
  const [budgetLimit, setBudgetLimit] = useState(location.state?.searchParams?.budget || "");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "packages"), (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddToPlan = async (pkg) => {
    if (!auth.currentUser) {
      alert("Please login to save plans.");
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
      alert("Added to Itinerary!");
      setSelectedPkg(null);
    } catch (err) { 
      console.error(err);
      alert("Error adding to plan.");
    } finally { 
      setLoading(false); 
    }
  };

  // NEW: Dual-Filter Logic (Region + Budget)
  const filteredPackages = packages.filter(pkg => {
    const matchesRegion = pkg.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBudget = budgetLimit ? pkg.price <= parseFloat(budgetLimit) : true;

    return matchesRegion && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 gap-8">
        <div>
          <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-4 block hover:opacity-70 transition">← Back to Home</button>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">Explore <br/> Sri Lanka</h1>
        </div>
        
        {/* REFINED FILTER UI */}
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="SEARCH REGION..." 
            value={searchQuery}
            className="w-full md:w-80 bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-mint transition"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="MAX BUDGET ($)..." 
            value={budgetLimit}
            className="w-full md:w-80 bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-mint transition"
            onChange={(e) => setBudgetLimit(e.target.value)}
          />
        </div>
      </div>

      {/* PACKAGE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredPackages.length > 0 ? filteredPackages.map((pkg) => (
          <motion.div layout key={pkg.id} className="group cursor-pointer" onClick={() => setSelectedPkg(pkg)}>
            <div className="aspect-square rounded-[40px] overflow-hidden mb-6 border border-white/5 relative">
              <img src={pkg.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
              <div className="absolute bottom-6 left-6 bg-white text-forest px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest">
                {currency === 'USD' ? `$${pkg.price}` : `LKR ${(pkg.price * 300).toLocaleString()}`}
              </div>
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none mb-2">{pkg.name}</h3>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">{pkg.location}</p>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center opacity-30 font-black uppercase tracking-widest italic">No packages found for your budget/region</div>
        )}
      </div>

      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPkg(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0B1812] border border-white/10 w-full max-w-lg rounded-[40px] p-8 relative" onClick={e => e.stopPropagation()}>
              <img src={selectedPkg.img} className="w-full h-52 object-cover rounded-[30px] mb-6" alt="" />
              <h2 className="text-3xl font-black italic uppercase mb-2">{selectedPkg.name}</h2>
              <p className="text-mint font-black text-sm mb-6">${selectedPkg.price}</p>
              <div className="flex gap-4">
                <button 
                  disabled={loading} 
                  onClick={() => handleAddToPlan(selectedPkg)} 
                  className="flex-1 bg-white text-forest py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-mint transition disabled:bg-gray-700"
                >
                  {loading ? "Adding..." : "Add to Plan"}
                </button>
                <button onClick={() => setSelectedPkg(null)} className="flex-1 border border-white/10 py-4 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}