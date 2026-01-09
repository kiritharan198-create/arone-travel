import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0B1812] flex items-center justify-center text-mint font-black uppercase text-[10px] tracking-widest animate-pulse">Verifying Credentials...</div>;

  // If not logged in, send to login
  if (!user) return <Navigate to="/login" />;

  // If role doesn't match, send to home
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;

  return children;
}