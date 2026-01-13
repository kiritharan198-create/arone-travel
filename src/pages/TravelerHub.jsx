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
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">

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
            className="text-[10px] font-black uppercase border border-white/10 px-6 py-3 rounded-full hover:bg-white hover:text-forest transition"
          >
            Explore
          </button>
        </div>

        <section className="mb-20 bg-white/5 border border-white/10 p-8 rounded-[40px]">
          <h2 className="text-xl font-black uppercase mb-6 text-mint">
            Account Settings
          </h2>

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
                className="bg-black/40 p-3 rounded-xl border border-white/10 text-xs"
              />
              <button
                onClick={saveNickname}
                className="bg-mint text-forest px-6 rounded-xl font-black text-[10px] uppercase"
              >
                Save
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black italic uppercase mb-8">
            My Trips
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {bookings.length > 0 ? (
              bookings.map(b => (
                <div key={b.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-[30px]">
                  <h3 className="text-xl font-black italic uppercase">{b.packageName}</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Status: {b.status}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                No bookings yet
              </div>
            )}
          </div>
        </section>

        <div className="mt-24 flex gap-4">
          <button
            onClick={() => auth.signOut()}
            className="text-[9px] font-black uppercase px-6 py-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
