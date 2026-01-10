import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. Live Users Feed
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Live Bookings Feed
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      setAllBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Live Inventory Feed
    const unsubPackages = onSnapshot(collection(db, "packages"), (snap) => {
      setAllPackages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubUsers(); unsubBookings(); unsubPackages(); };
  }, []);

  // Safe Revenue Calculation
  const totalPlatformRevenue = allBookings
    .filter(b => b.status === "Confirmed")
    .reduce((sum, b) => sum + (parseFloat(b.totalPrice) || parseFloat(b.packagePrice) || 0), 0);

  const toggleUserRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'vendor' ? 'traveler' : 'vendor';
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) { alert("Security Override Failed: " + err.message); }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-mint border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-mint font-black text-[10px] tracking-[0.5em] uppercase animate-pulse">Accessing Arone Core</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-mint selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP NAV */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-mint">Command Center</h1>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-1">Level 4 Clearance Authorized</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-mint transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Exit Terminal
          </button>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <MetricCard label="Platform Gross" value={`$${totalPlatformRevenue.toLocaleString()}`} isMint />
          <MetricCard label="Registered Entities" value={users.length} />
          <MetricCard label="Global Inventory" value={allPackages.length} />
          <MetricCard label="System Load" value={`${((allBookings.length / (allPackages.length || 1))).toFixed(1)}x`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* USER MANAGEMENT */}
          <section className="lg:col-span-2">
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-xl font-black italic uppercase flex items-center gap-4">
                Identity Management <span className="h-[1px] w-20 bg-white/10"></span>
              </h2>
              <input 
                type="text" 
                placeholder="Search Email..." 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] outline-none focus:border-mint transition-all w-48"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500">
                    <th className="p-8">UID / Email</th>
                    <th className="p-8">Role</th>
                    <th className="p-8 text-right">Clearance Action</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.04] transition group">
                      <td className="p-8">
                        <span className="block text-white group-hover:text-mint transition">{u.email}</span>
                        <span className="block text-[8px] text-gray-600 mt-1 uppercase">ID: {u.id.slice(0,12)}...</span>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] uppercase font-black ${u.role === 'vendor' ? 'bg-mint text-black' : 'bg-white/10 text-gray-400'}`}>
                          {u.role || 'traveler'}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button 
                          onClick={() => toggleUserRole(u.id, u.role)}
                          className="text-white/30 hover:text-mint uppercase tracking-widest text-[9px] font-black mr-6 transition"
                        >
                          Modify Role
                        </button>
                        <button 
                          onClick={() => window.confirm("Terminate user access?") && deleteDoc(doc(db, "users", u.id))}
                          className="text-red-900 hover:text-red-500 uppercase tracking-widest text-[9px] font-black transition"
                        >
                          Terminate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* RECENT ACTIVITY LOG */}
          <section>
            <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">
              System Log <span className="h-[1px] flex-1 bg-white/10"></span>
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {allBookings.slice(0, 10).map((b, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    key={b.id} 
                    className="bg-white/[0.03] p-6 rounded-[30px] border border-white/5 hover:border-white/20 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${b.status === 'Confirmed' ? 'text-mint' : 'text-orange-500'}`}>
                        {b.status}
                      </span>
                      <span className="text-gray-700 text-[8px] font-bold">
                        {b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toLocaleDateString() : 'RECENT'}
                      </span>
                    </div>
                    <p className="text-[11px] font-black uppercase italic leading-tight text-white/80">{b.packageName}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                       <p className="text-[9px] text-gray-500 font-bold lowercase truncate">{b.travelerEmail}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// Sub-component for clean metric cards
function MetricCard({ label, value, isMint }) {
  return (
    <div className={`${isMint ? 'bg-mint text-black' : 'bg-white/5 border border-white/10 text-white'} p-8 rounded-[40px] transition-transform hover:scale-[1.02]`}>
      <p className={`text-[9px] font-black uppercase tracking-widest ${isMint ? 'opacity-60' : 'text-gray-500'}`}>{label}</p>
      <h2 className="text-4xl font-black italic mt-2 tracking-tighter">{value}</h2>
    </div>
  );
}