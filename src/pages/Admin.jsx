import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch All Users
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Fetch All Bookings (Global Revenue)
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      setAllBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Fetch All Packages
    const unsubPackages = onSnapshot(collection(db, "packages"), (snapshot) => {
      setAllPackages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubUsers(); unsubBookings(); unsubPackages(); };
  }, []);

  // Platform Metrics
  const totalPlatformRevenue = allBookings
    .filter(b => b.status === "Confirmed")
    .reduce((sum, b) => sum + (Number(b.packagePrice) || 0), 0);

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'vendor' ? 'traveler' : 'vendor';
    await updateDoc(doc(db, "users", userId), { role: newRole });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-mint font-black">ACCESSING ARONE CORE...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP NAV */}
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-mint">Arone Command Center</h1>
          <button onClick={() => navigate('/')} className="bg-white text-black px-8 py-2 rounded-full font-black text-[10px] uppercase">Exit Terminal</button>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-mint text-black p-8 rounded-[40px]">
            <p className="text-[9px] font-black uppercase opacity-60">Platform Gross</p>
            <h2 className="text-4xl font-black italic">${totalPlatformRevenue.toLocaleString()}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <p className="text-[9px] font-black uppercase text-gray-500">Total Users</p>
            <h2 className="text-4xl font-black italic">{users.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <p className="text-[9px] font-black uppercase text-gray-500">Active Listings</p>
            <h2 className="text-4xl font-black italic">{allPackages.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <p className="text-[9px] font-black uppercase text-gray-500">Booking Rate</p>
            <h2 className="text-4xl font-black italic">{((allBookings.length / allPackages.length) || 0).toFixed(1)}x</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* USER MANAGEMENT */}
          <section className="lg:col-span-2">
            <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">
              Identity Management <span className="h-[1px] flex-1 bg-white/10"></span>
            </h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black uppercase text-gray-500">
                    <th className="p-6 tracking-widest">User</th>
                    <th className="p-6 tracking-widest">Current Role</th>
                    <th className="p-6 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition">
                      <td className="p-6">{u.email}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[8px] uppercase font-black ${u.role === 'vendor' ? 'bg-mint text-black' : 'bg-white/10'}`}>
                          {u.role || 'traveler'}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => toggleUserRole(u.id, u.role)}
                          className="text-mint hover:underline uppercase tracking-widest text-[9px] font-black mr-4"
                        >
                          Switch Role
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, "users", u.id))}
                          className="text-red-500 hover:underline uppercase tracking-widest text-[9px] font-black"
                        >
                          Ban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section>
            <h2 className="text-xl font-black italic uppercase mb-8 flex items-center gap-4">
              Log <span className="h-[1px] flex-1 bg-white/10"></span>
            </h2>
            <div className="space-y-4">
              {allBookings.slice(0, 8).map(b => (
                <div key={b.id} className="bg-white/5 p-5 rounded-[30px] border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black uppercase text-mint tracking-widest">{b.status}</span>
                    <span className="text-gray-600 text-[8px]">{new Date(b.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase italic leading-tight">{b.packageName}</p>
                  <p className="text-[9px] text-gray-500 font-bold mt-1 lowercase">{b.travelerEmail}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}