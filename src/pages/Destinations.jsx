import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Destinations() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE (UNCHANGED) ---
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency] = useState(localStorage.getItem('currency') || 'USD');

  const [searchQuery, setSearchQuery] = useState(
    location.state?.searchParams?.destination || ""
  );
  const [budgetLimit, setBudgetLimit] = useState(
    location.state?.searchParams?.budget || ""
  );

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
        price: pkg.price,
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

  const filteredPackages = packages.filter(pkg => {
    const matchesRegion =
      pkg.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBudget = budgetLimit
      ? pkg.price <= parseFloat(budgetLimit)
      : true;

    return matchesRegion && matchesBudget;
  });

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16 font-sans">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-20">
        <button
          onClick={() => navigate('/')}
          className="text-mint text-[10px] font-black uppercase tracking-[0.4em] hover:opacity-70 transition mb-6"
        >
          ← Back to Home
        </button>

        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-mint">
              Planner Mode
            </span>
            <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter mt-4">
              Explore Sri Lanka
            </h1>
            <p className="text-gray-400 text-xs max-w-xl mt-6 leading-relaxed">
              Browse curated travel experiences and add them to your itinerary.
              Packages can be compared, filtered by budget, and planned into a
              custom trip.
            </p>
          </div>

          {/* FILTER PANEL */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] w-full md:w-[380px]">
            <p className="text-[9px] font-black uppercase tracking-widest text-mint mb-4">
              Filter Packages
            </p>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Search destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/30 border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-mint transition"
              />

              <input
                type="number"
                placeholder="Max budget ($)"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="bg-black/30 border border-white/10 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-mint transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PACKAGE GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {filteredPackages.length > 0 ? (
          filteredPackages.map(pkg => (
            <motion.div
              key={pkg.id}
              layout
              whileHover={{ y: -6 }}
              className="group cursor-pointer bg-white/5 border border-white/10 rounded-[40px] p-4"
              onClick={() => setSelectedPkg(pkg)}
            >
              <div className="aspect-square rounded-[30px] overflow-hidden relative mb-5">
                <img
                  src={pkg.img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute top-4 right-4 bg-mint text-forest px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {currency === 'USD'
                    ? `$${pkg.price}`
                    : `LKR ${(pkg.price * 300).toLocaleString()}`}
                </div>
              </div>

              <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">
                {pkg.name}
              </h3>
              <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">
                {pkg.location}
              </p>

              <div className="mt-4 text-[9px] uppercase font-black tracking-widest text-mint opacity-60">
                Click to view details
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-32 text-white/30 text-sm font-black uppercase tracking-widest">
            No packages match your filters
          </div>
        )}
      </div>

      {/* PACKAGE MODAL */}
      <AnimatePresence>
        {selectedPkg && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
            onClick={() => setSelectedPkg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0B1812] border border-white/10 rounded-[45px] max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPkg.img}
                className="w-full h-56 object-cover rounded-[30px] mb-6"
                alt=""
              />

              <h2 className="text-4xl font-black italic uppercase mb-2">
                {selectedPkg.name}
              </h2>
              <p className="text-mint font-black text-sm mb-6">
                {currency === 'USD'
                  ? `$${selectedPkg.price}`
                  : `LKR ${(selectedPkg.price * 300).toLocaleString()}`}
              </p>

              <div className="flex gap-4">
                <button
                  disabled={loading}
                  onClick={() => handleAddToPlan(selectedPkg)}
                  className="flex-1 bg-mint text-forest py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add to Itinerary"}
                </button>
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="flex-1 border border-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
