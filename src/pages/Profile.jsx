import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get only bookings made by THIS traveler
    const q = query(collection(db, "bookings"), where("travelerId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setMyBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-6 md:p-16">
      <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-12 block">
        ← Back to Explore
      </button>

      <div className="max-w-4xl mx-auto">
        {/* User Header */}
        <header className="flex items-center gap-8 mb-20">
          <div className="w-24 h-24 bg-mint rounded-full flex items-center justify-center text-forest text-4xl font-black italic shadow-2xl">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">{user?.email?.split('@')[0]}</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">{user?.email}</p>
          </div>
        </header>

        {/* My Trip Requests */}
        <section>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">My Inquiries</h2>
            <span className="text-mint text-[9px] font-black uppercase tracking-widest">{myBookings.length} Requests Found</span>
          </div>

          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-12 rounded-[40px] text-center italic text-gray-500 text-sm">
                You haven't requested any luxury stays yet.
              </div>
            ) : (
              myBookings.map(booking => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  key={booking.id} 
                  className="bg-white/5 border border-white/10 p-8 rounded-[30px] flex justify-between items-center group hover:border-mint/50 transition"
                >
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter group-hover:text-mint transition">{booking.packageName}</h3>
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">Requested on: {booking.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-white/10 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest">
                      {booking.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}