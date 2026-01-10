import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Itinerary() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency] = useState(localStorage.getItem('currency') || 'USD');

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

  // Calculate Total Price
  const totalPrice = savedItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const handleFinalizePlan = async () => {
    setIsProcessing(true);
    // Simulate Intelligent Scheduling Logic
    setTimeout(async () => {
      try {
        await addDoc(collection(db, "bookings"), {
          travelerId: auth.currentUser.uid,
          packageName: `${savedItems.length} Experience Custom Bundle`,
          totalPrice: totalPrice,
          status: "pending",
          items: savedItems,
          createdAt: serverTimestamp(),
          messages: [{
            sender: "system",
            text: "Welcome! A vendor representative will review your custom itinerary shortly.",
            timestamp: new Date().toISOString()
          }]
        });
        alert("Plan Finalized! Our agents will contact you via the Home Dashboard chat.");
        navigate('/');
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B1812] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-mint border-t-transparent rounded-full animate-spin"></div>
      <div className="text-mint font-black tracking-widest text-[10px] uppercase">Syncing Planner...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-6 md:p-12 font-sans">
      {/* NAVIGATION */}
      <button 
        onClick={() => navigate('/destinations')}
        className="fixed top-8 left-8 text-white/50 hover:text-mint flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-50 border border-white/10 px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl"
      >
        <span>←</span> BACK TO EXPLORE
      </button>

      <div className="max-w-6xl mx-auto mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-mint font-bold text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Arone Intelligent Planner</span>
            <h2 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">Your Personal <br/> Itinerary</h2>
          </div>
          
          {savedItems.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] min-w-[300px] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Estimated Investment</p>
              <h3 className="text-4xl font-black text-mint italic mb-6">
                {currency === 'USD' ? `$${totalPrice}` : `LKR ${(totalPrice * 300).toLocaleString()}`}
              </h3>
              <button 
                onClick={handleFinalizePlan}
                disabled={isProcessing}
                className="w-full bg-mint text-forest py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all disabled:opacity-50"
              >
                {isProcessing ? "Optimizing Route..." : "Finalize & Request Quote"}
              </button>
            </div>
          )}
        </div>

        {savedItems.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 p-20 rounded-[60px] text-center backdrop-blur-xl">
            <div className="text-6xl mb-8 opacity-20 text-mint italic font-black uppercase tracking-tighter">Empty Canvas</div>
            <p className="text-gray-500 text-xs italic mb-10 max-w-sm mx-auto leading-loose">
              Your Sri Lankan journey hasn't started yet. Add premium stays and heritage experiences to begin.
            </p>
            <button 
              onClick={() => navigate('/destinations')}
              className="bg-white text-forest px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition"
            >
              Browse Experiences
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode='popLayout'>
              {savedItems.map((item, index) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-[35px] flex flex-col md:flex-row items-center gap-8 group hover:border-mint/30 transition-all hover:bg-white/[0.07]"
                >
                  <div className="relative">
                    <img src={item.img} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-[25px] shadow-2xl transition group-hover:scale-105" alt="" />
                    <span className="absolute -top-3 -left-3 bg-mint text-forest w-8 h-8 rounded-full flex items-center justify-center font-black text-xs italic">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{item.name}</h4>
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                      <span className="text-mint text-[10px] font-black uppercase tracking-widest italic">{item.location}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                        {currency === 'USD' ? `$${item.price}` : `LKR ${(item.price * 300).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="bg-red-500/10 text-red-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition duration-300"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FOOTER DETAIL */}
      <div className="max-w-6xl mx-auto mt-20 pt-10 border-t border-white/5 text-center">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
          All plans are subject to local availability & seasonal pricing adjustments.
        </p>
      </div>
    </div>
  );
}