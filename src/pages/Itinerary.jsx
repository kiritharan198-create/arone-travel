import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Itinerary() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const q = query(
      collection(db, "itineraries"), 
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSavedItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const removeItem = async (id) => {
    try {
      await deleteDoc(doc(db, "itineraries", id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B1812] flex items-center justify-center text-mint font-black">SYNCING PLANNER...</div>;

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-6 md:p-12">
      {/* NAVIGATION */}
      <button 
        onClick={() => navigate('/destinations')}
        className="fixed top-8 left-8 text-white/50 hover:text-mint flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-50 border border-white/10 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md"
      >
        <span>←</span> BACK TO EXPLORE
      </button>

      <div className="max-w-4xl mx-auto mt-20">
        <div className="text-center mb-16">
          <span className="text-mint font-bold text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Arone Intelligent Planner</span>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-tight">Your Personal <br/> Itinerary</h2>
        </div>

        {savedItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 p-16 rounded-[50px] text-center backdrop-blur-xl">
            <p className="text-gray-500 text-xs italic mb-10">No experiences saved yet. Add items from the destination menu to start planning.</p>
            <button 
              onClick={() => navigate('/destinations')}
              className="bg-white text-forest px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition"
            >
              Browse Experiences
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {savedItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-[30px] flex items-center gap-6 group hover:border-white/20 transition"
                >
                  <img src={item.img} className="w-24 h-24 object-cover rounded-2xl shadow-xl" alt="" />
                  <div className="flex-1">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{item.name}</h4>
                    <p className="text-mint text-[9px] font-black uppercase tracking-widest italic">{item.location}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="bg-red-500/10 text-red-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}