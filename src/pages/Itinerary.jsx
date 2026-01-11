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
    });

    return () => unsubscribe();
  }, [navigate]);

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "itineraries", id));
  };

  const totalPrice = savedItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const handleFinalizePlan = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      await addDoc(collection(db, "bookings"), {
        travelerId: auth.currentUser.uid,
        packageName: `${savedItems.length} Experience Custom Bundle`,
        totalPrice,
        status: "pending",
        items: savedItems,
        createdAt: serverTimestamp(),
        messages: [{
          sender: "system",
          text: "Your itinerary has been submitted for vendor review.",
          timestamp: new Date().toISOString()
        }]
      });
      navigate('/');
      setIsProcessing(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1812] flex items-center justify-center">
        <div className="text-mint font-black uppercase tracking-widest text-[10px]">
          Loading Planner...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-6 md:p-12 font-sans">

      {/* BACK */}
      <button
        onClick={() => navigate('/destinations')}
        className="fixed top-8 left-8 z-50 bg-black/40 border border-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:text-mint transition"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto mt-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16">
          <div>
            <span className="text-mint text-[10px] font-black uppercase tracking-[0.5em]">
              Intelligent Trip Planner
            </span>
            <h2 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter mt-4">
              Your Itinerary
            </h2>

            {/* STATUS BADGE */}
            <div className="mt-6 inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
              <span className="w-2 h-2 bg-mint rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-mint">
                Draft Plan
              </span>
            </div>
          </div>

          {/* SUMMARY */}
          {savedItems.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] min-w-[320px]">
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2">
                Estimated Cost
              </p>
              <h3 className="text-4xl font-black italic text-mint mb-6">
                {currency === 'USD'
                  ? `$${totalPrice}`
                  : `LKR ${(totalPrice * 300).toLocaleString()}`}
              </h3>

              <button
                onClick={handleFinalizePlan}
                disabled={isProcessing}
                className="w-full bg-mint text-forest py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Finalize & Send"}
              </button>

              {/* EXTRA UI BUTTONS */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="border border-white/10 py-3 rounded-xl text-[9px] uppercase font-black opacity-40 cursor-not-allowed">
                  Export PDF
                </button>
                <button className="border border-white/10 py-3 rounded-xl text-[9px] uppercase font-black opacity-40 cursor-not-allowed">
                  Share Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TRIP NOTES (UI ONLY) */}
        <div className="mb-16 bg-white/5 border border-white/10 p-8 rounded-[40px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-mint mb-4">
            Trip Notes
          </p>
          <p className="text-xs text-gray-400 italic leading-relaxed">
            This itinerary is auto-organized based on your selected experiences.
            You can reorder activities in future updates. Vendors will optimize
            timing and logistics after submission.
          </p>
        </div>

        {/* ITINERARY ITEMS */}
        {savedItems.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-20 rounded-[60px] text-center">
            <h3 className="text-5xl font-black italic uppercase text-mint opacity-30 mb-6">
              Empty Plan
            </h3>
            <p className="text-gray-500 text-xs mb-10">
              Add experiences to start building your itinerary.
            </p>
            <button
              onClick={() => navigate('/destinations')}
              className="bg-white text-forest px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-mint transition"
            >
              Browse Experiences
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {savedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/5 border border-white/10 p-6 rounded-[35px] flex flex-col md:flex-row gap-8 items-center"
                >
                  {/* DAY LABEL */}
                  <div className="text-mint text-[10px] font-black uppercase tracking-widest">
                    Day {index + 1}
                  </div>

                  <img
                    src={item.img}
                    className="w-32 h-32 object-cover rounded-[25px]"
                    alt=""
                  />

                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter">
                      {item.name}
                    </h4>
                    <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mt-2">
                      {item.location}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-mint">
                      {currency === 'USD'
                        ? `$${item.price}`
                        : `LKR ${(item.price * 300).toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-red-500/10 text-red-500 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition"
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

      {/* FOOTER NOTE */}
      <div className="text-center mt-20 text-[9px] uppercase font-black tracking-[0.4em] text-white/20">
        Subject to availability & seasonal pricing
      </div>
    </div>
  );
}
