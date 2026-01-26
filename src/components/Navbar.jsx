import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            // ✅ We force lowercase to make the check "bulletproof"
            const r = snap.data().role?.toLowerCase().trim();
            setRole(r);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      } else {
        setRole(null);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-white sticky top-0 z-50 shadow-sm">
      
      <div className="text-2xl font-bold text-travel-dark tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
        ARONE
      </div>

      <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-600 items-center">
        <Link to="/" className="hover:text-travel-dark">Home</Link>
        <Link to="/destinations" className="hover:text-travel-dark">Destinations</Link>
        
        {/* ✅ The Logic Gate */}
        {role === 'vendor' && (
          <Link to="/agents" className="bg-mint/10 text-mint px-4 py-1.5 rounded-lg hover:bg-mint hover:text-white transition-all">
            Vendor Hub
          </Link>
        )}
        
        {role === 'traveler' && (
          <Link to="/traveler" className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
            Traveler Hub
          </Link>
        )}
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition"
          >
            Log Out
          </button>
        </div>
      ) : (
        <Link to="/login" className="bg-travel-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition">
          Log In
        </Link>
      )}
    </nav>
  );
}