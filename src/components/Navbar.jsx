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
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const r = snap.data().role?.toLowerCase();
          setRole(r);
          console.log('Role:', r); // for debugging
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
      
      <div className="text-2xl font-bold text-travel-dark tracking-tighter">
        ARONE
      </div>

      <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-600">
        <Link to="/" className="hover:text-travel-dark">Home</Link>
        <Link to="/destinations" className="hover:text-travel-dark">Destinations</Link>
        <Link to="/packages" className="hover:text-travel-dark">Packages</Link>

        {role === 'vendor' && <Link to="/agents" className="hover:text-travel-dark">Vendor Hub</Link>}
        {role === 'traveler' && <Link to="/traveler" className="hover:text-travel-dark">Traveler Hub</Link>}
      </div>

      {user ? (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition"
        >
          Log Out
        </button>
      ) : (
        <Link to="/login" className="bg-travel-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition">
          Log In
        </Link>
      )}
    </nav>
  );
}
