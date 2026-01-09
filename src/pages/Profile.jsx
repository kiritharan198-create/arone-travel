import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = localStorage.getItem('currency') || 'USD';

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        // Fetch only this user's bookings
        const q = query(collection(db, "bookings"), where("travelerId", "==", currentUser.uid));
        const unsubData = onSnapshot(q, (snapshot) => {
          setMyBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsubData();
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  const handleViewReceipt = (booking) => {
    // Navigate to Checkout with the existing booking data to "re-print" receipt
    navigate('/checkout', { state: { pkg: { name: booking.packageName, price: booking.packagePrice || 0 } } });
  };

  if (loading) return <div className="min-h-screen bg-[#0B1812] flex items-center justify-center text-mint font-black italic">LOADING ARONE...</div>;

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-10">
          <div>
            <span className="text-mint font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Traveler Passport</span>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">{user?.displayName || 'Adventurer'}</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase mt-2 tracking-widest">{user?.email}</p>
          </div>
          <button onClick={() => navigate('/')} className="text-[10px] font-black uppercase border border-white/10 px-6 py-3 rounded-full hover:bg-white hover:text-forest transition">Explore More</button>
        </div>

        {/* BOOKING STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-black italic uppercase mb-8 text-mint tracking-widest">Active Itineraries</h2>
            <div className="space-y-6">
              {myBookings.filter(b => b.status === 'Confirmed').map(booking => (
                <div key={booking.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px] group hover:border-mint/30 transition">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black italic uppercase">{booking.packageName}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Booking Ref: {booking.id.slice(0,8)}</p>
                    </div>
                    <span className="bg-mint text-forest text-[8px] font-black px-3 py-1 rounded-full uppercase">Confirmed</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => handleViewReceipt(booking)} className="bg-white text-forest px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">View Receipt</button>
                    <button onClick={() => navigate('/itinerary')} className="border border-white/10 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Plan Details</button>
                  </div>
                </div>
              ))}
              {myBookings.filter(b => b.status === 'Confirmed').length === 0 && (
                <div className="p-10 border border-white/5 rounded-[40px] text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">No confirmed trips yet.</div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase mb-8 text-gray-500 tracking-widest">Pending Requests</h2>
            <div className="space-y-4">
              {myBookings.filter(b => b.status === 'Pending').map(booking => (
                <div key={booking.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-[30px] flex justify-between items-center">
                  <div>
                    <h4 className="font-black italic uppercase text-sm">{booking.packageName}</h4>
                    <p className="text-[9px] text-gray-600 font-bold uppercase mt-1 italic">Waiting for Agent Approval...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-mint font-black text-xs">
                      {currency === 'USD' ? `$${booking.packagePrice}` : `LKR ${(booking.packagePrice * 300).toLocaleString()}`}
                    </p>
                    <button onClick={() => navigate('/')} className="text-[8px] font-black uppercase text-gray-500 hover:text-white transition mt-2">Chat Agent</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SECURITY & SETTINGS */}
        <div className="mt-32 p-10 bg-white/[0.02] rounded-[50px] border border-white/5 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
                <h4 className="font-black italic uppercase text-lg">Account Security</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manage your privacy and data exports</p>
            </div>
            <div className="flex gap-4">
                <button className="text-[9px] font-black uppercase px-6 py-3 border border-white/10 rounded-xl">Export Data</button>
                <button onClick={() => auth.signOut()} className="text-[9px] font-black uppercase px-6 py-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">Sign Out</button>
            </div>
        </div>

      </div>
    </div>
  );
}