import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function TravelerHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState('');
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      setNickname(currentUser.displayName || 'Traveler');
      setNewName(currentUser.displayName || '');

      const q = query(
        collection(db, 'bookings'),
        where('travelerId', '==', currentUser.uid)
      );

      const unsubscribeBookings = onSnapshot(q, (snap) => {
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => unsubscribeBookings();
    });

    return () => unsub();
  }, [navigate]);

  const saveNickname = async () => {
    if (!newName.trim()) return;

    await updateProfile(auth.currentUser, { displayName: newName });
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { nickname: newName });

    setNickname(newName);
    setEditName(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16 selection:bg-mint selection:text-black">
      <div className="max-w-6xl mx-auto">

        {/* TOP NAV / HEADER */}
        <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
          <div>
            <span className="text-mint text-[10px] font-black uppercase tracking-[0.4em]">
              Traveler Hub
            </span>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mt-3">
              {nickname}
            </h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              {user?.email}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-[10px] font-black uppercase border border-white/10 px-8 py-3 rounded-full hover:bg-white hover:text-forest transition shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            Explore
          </button>
        </div>

        {/* ACCOUNT SETTINGS SECTION */}
        <section className="mb-20 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-black italic uppercase text-mint">
              Account Settings
            </h2>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">Manage your identity on Arone</p>
          </div>

          {!editName ? (
            <button
              onClick={() => setEditName(true)}
              className="text-[10px] font-black uppercase px-6 py-3 border border-white/10 rounded-xl hover:bg-white hover:text-forest transition"
            >
              Change Nickname
            </button>
          ) : (
            <div className="flex gap-4">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-black border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-mint transition-all"
                placeholder="New Nickname"
              />
              <button
                onClick={saveNickname}
                className="bg-mint text-forest px-6 rounded-xl font-black text-[10px] uppercase hover:scale-95 transition-transform"
              >
                Save
              </button>
            </div>
          )}
        </section>

        {/* TRIPS SECTION - UPDATED TO VENDOR DASHBOARD STYLE */}
        <section>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black italic uppercase flex items-center gap-4">
              My Trips <span className="h-[1px] w-24 bg-white/10"></span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {bookings.length > 0 ? (
              bookings.map(b => (
                <div key={b.id} className="group bg-white/[0.03] border border-white/5 p-8 rounded-[40px] hover:border-mint/30 transition-all relative overflow-hidden">
                  
                  {/* Status Tag */}
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      b.status === 'Confirmed' ? 'bg-mint text-forest' : 'bg-white/10 text-gray-400'
                    }`}>
                      {b.status || 'Processing'}
                    </span>
                    <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">
                      Ref: {b.id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Package Name */}
                  <h3 className="text-2xl font-black italic uppercase text-white group-hover:text-mint transition duration-500">
                    {b.packageName}
                  </h3>
                  
                  {/* Footer of Card */}
                  <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Investment</p>
                      <p className="text-2xl font-black italic text-white">
                        ${b.totalPrice || b.packagePrice || '0'}
                      </p>
                    </div>
                    
                    <button className="bg-white/5 hover:bg-white hover:text-forest px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all">
                      View Itinerary
                    </button>
                  </div>

                  {/* Aesthetic background glow on hover */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-mint/5 blur-[50px] rounded-full group-hover:bg-mint/10 transition-all"></div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 border border-dashed border-white/10 rounded-[40px] text-center">
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
                  No explorations booked yet
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-6 text-mint text-[9px] font-black uppercase tracking-widest hover:underline"
                >
                  Start your journey →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* LOGOUT AREA */}
        <div className="mt-32 border-t border-white/5 pt-12">
          <button
            onClick={() => auth.signOut()}
            className="text-[9px] font-black uppercase px-8 py-4 bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white rounded-2xl border border-red-500/10 transition-all shadow-lg"
          >
            Secure Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}