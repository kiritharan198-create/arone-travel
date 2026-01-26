import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [role, setRole] = useState('traveler');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'vendor') navigate('/agents');
          // ✅ UPDATED: Send travelers to their hub instead of '/'
          else if (userData.role === 'traveler') navigate('/traveler'); 
          else navigate('/');
        }
      } else {
        // REGISTER
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // ✅ Save nickname to Auth profile
        await updateProfile(userCredential.user, {
          displayName: nickname
        });

        // ✅ Save nickname to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          role: role,
          nickname: nickname,
          createdAt: new Date()
        });

        alert("Account Created Successfully!");
        if (role === 'vendor') navigate('/agents');
        // ✅ UPDATED: Send travelers to their hub instead of '/'
        else navigate('/traveler'); 
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1812] flex items-center justify-center p-6 overflow-y-auto">
      
      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 text-white/50 hover:text-mint flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all z-50"
      >
        ← BACK TO EXPLORING
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[40px] w-full max-w-md backdrop-blur-xl my-auto"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase">
            {isLogin ? 'Welcome Back' : 'Join Arone'}
          </h2>
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">
            {isLogin ? 'Gateway to Sri Lanka' : 'Start your travel journey'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">

          {!isLogin && (
            <div>
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">
                Nickname
              </label>
              <input
                type="text"
                placeholder="YOUR DISPLAY NAME"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:border-mint transition-all"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">
              Email
            </label>
            <input 
              type="email"
              placeholder="EMAIL@EXAMPLE.COM"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:border-mint transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-2 block">
              Password
            </label>
            <input 
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-xs font-bold outline-none focus:border-mint transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="pt-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 mb-4 block">
                Account Type
              </label>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => setRole('traveler')}
                  className={`flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    role === 'traveler'
                      ? 'bg-mint text-forest border-mint'
                      : 'text-white border-white/10'
                  }`}
                >
                  Traveler
                </button>
                <button type="button"
                  onClick={() => setRole('vendor')}
                  className={`flex-1 p-4 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    role === 'vendor'
                      ? 'bg-mint text-forest border-mint'
                      : 'text-white border-white/10'
                  }`}
                >
                  Vendor
                </button>
              </div>
            </div>
          )}

          <button className="w-full bg-white text-forest p-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-mint transition-all mt-4">
            {isLogin ? 'Authorize Login' : 'Register Profile'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 text-[9px] font-black uppercase tracking-widest hover:text-mint transition-all"
          >
            {isLogin ? "New user? Create account" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}