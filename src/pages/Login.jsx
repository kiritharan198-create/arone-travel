import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('traveler');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'vendor') navigate('/agents');
          else navigate('/');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: role,
          createdAt: new Date()
        });
        alert("Account Created Successfully!");
        if (role === 'vendor') navigate('/agents');
        else navigate('/');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    // Added 'overflow-y-auto' and 'py-12' for better scrolling on mobile
    <div className="min-h-screen bg-[#0B1812] flex items-center justify-center p-6 overflow-y-auto">
      
      {/* 1. BACK TO HOME BUTTON */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 text-white/50 hover:text-mint flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-50"
      >
        <span>←</span> BACK TO EXPLORING
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[40px] w-full max-w-md backdrop-blur-xl my-auto"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase leading-none">
            {isLogin ? 'Welcome Back' : 'Join Arone'}
          </h2>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">
            {isLogin ? 'Gateway to Sri Lanka' : 'Start your travel journey'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Identity</label>
            <input 
              type="email" placeholder="EMAIL@EXAMPLE.COM" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:border-mint transition-all"
              onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          
          <div>
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">Security</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:border-mint transition-all"
              onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {!isLogin && (
            <div className="pt-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-4 block">Select Account Type</label>
              <div className="flex gap-3">
                <button 
                  type="button" onClick={() => setRole('traveler')}
                  className={`flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${role === 'traveler' ? 'bg-mint text-forest border-mint shadow-[0_0_20px_rgba(153,255,204,0.2)]' : 'text-white border-white/10 hover:border-white/30'}`}
                >Tourist</button>
                <button 
                  type="button" onClick={() => setRole('vendor')}
                  className={`flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${role === 'vendor' ? 'bg-mint text-forest border-mint shadow-[0_0_20px_rgba(153,255,204,0.2)]' : 'text-white border-white/10 hover:border-white/30'}`}
                >Vendor</button>
              </div>
            </div>
          )}

          <button className="w-full bg-white text-forest p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-mint transition-all active:scale-95 mt-4">
            {isLogin ? 'Authorize Login' : 'Register Profile'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 text-[9px] font-black uppercase tracking-widest hover:text-mint transition-all"
          >
            {isLogin ? "New to the platform? Create Account" : "Return to sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}