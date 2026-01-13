// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const docSnap = await getDoc(doc(db, "users", user.uid));
      const role = docSnap.data()?.role || "traveler";

      if (role === requiredRole) setAuthorized(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requiredRole]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );

  if (!authorized) return <Navigate to="/" replace />;

  return children;
}
