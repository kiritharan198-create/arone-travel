import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase'; 
import { collection, onSnapshot, addDoc, serverTimestamp, doc, getDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Home() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [packages, setPackages] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userInquiries, setUserInquiries] = useState([]);
  const [travelerReply, setTravelerReply] = useState("");
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  // NEW: Search States
  const [searchParams, setSearchParams] = useState({
    destination: '',
    budget: ''
  });

  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'LKR' : 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setUserRole(userDoc.data().role);
        
        const q = query(collection(db, "bookings"), where("travelerId", "==", currentUser.uid));
        onSnapshot(q, (snapshot) => {
          setUserInquiries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      } else {
        setUserRole(null);
        setUserInquiries([]);
      }
    });

    const unsubData = onSnapshot(collection(db, "packages"), (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubAuth(); unsubData(); };
  }, []);

  // NEW: Search Execution
  const handleSearchTrigger = () => {
    navigate('/destinations', { state: { searchParams } });
  };

  const handleTouchPlace = (pkg) => {
    navigate('/itinerary', { state: { selectedPkg: pkg } });
  };

  const sendReplyToVendor = async (bookingId) => {
    if (!travelerReply.trim()) return;
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        messages: arrayUnion({
          sender: "traveler",
          text: travelerReply,
          timestamp: new Date().toISOString()
        })
      });
      setTravelerReply("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white overflow-x-hidden font-sans">
      
      {/* NAVIGATION */}
      <nav className="flex justify-between items-center px-8 md:px-12 py-8 sticky top-0 z-[100] bg-[#0B1812]/80 backdrop-blur-xl border-b border-white/5">
        <div className="text-3xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>ARONE</div>
        
        <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
          <button onClick={() => navigate('/destinations')} className="hover:text-mint transition">Destinations</button>
          <button onClick={() => navigate('/compare')} className="hover:text-mint transition">Compare</button>
          <button onClick={() => navigate('/itinerary')} className="hover:text-mint transition">Planner</button>
          <button onClick={toggleCurrency} className="text-mint border border-mint/20 px-3 py-1 rounded hover:bg-mint hover:text-forest transition font-black">{currency}</button>
          {userRole === 'vendor' && <button onClick={() => navigate('/agents')} className="text-mint animate-pulse transition">Vendor Hub</button>}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <button onClick={() => signOut(auth)} className="text-white/40 hover:text-red-500 font-black text-[9px] uppercase tracking-widest">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-white text-forest px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-mint transition">Sign In</button>
          )}
        </div>
      </nav>

      {/* PREMIUM HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Sri Lanka Nature" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1812]/90 via-[#0B1812]/40 to-[#0B1812]" />
        </div>

        <div className="relative z-10 max-w-6xl w-full text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-mint font-bold text-[11px] uppercase tracking-[0.6em] mb-6 block">Experience the Emerald Isle</span>
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter uppercase italic">
              Plan. Compare. Book.<br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-mint/50">Experience Sri Lanka.</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto mb-12 font-medium leading-relaxed italic">
              An all-in-one platform to compare tour packages, build itineraries, and book unforgettable experiences with local experts.
            </p>

            {/* CALL TO ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button onClick={() => navigate('/itinerary')} className="bg-mint text-forest px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition duration-300">Plan My Trip</button>
              <button onClick={() => navigate('/agents')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/20 transition duration-300">Become a Vendor</button>
            </div>

            {/* FUNCTIONAL SEARCH BAR */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-2 md:p-3 rounded-[30px] md:rounded-full flex flex-wrap lg:flex-nowrap items-center gap-2 max-w-5xl mx-auto mb-16 shadow-3xl">
              <div className="flex-1 min-w-[150px] px-6 py-3 text-left border-r border-white/5">
                <label className="block text-[8px] font-black uppercase text-mint tracking-widest mb-1">Destination</label>
                <input 
                  type="text" 
                  placeholder="Where to?" 
                  className="bg-transparent border-none outline-none text-[12px] font-bold w-full placeholder:text-white/20"
                  onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                />
              </div>
              <div className="flex-1 min-w-[150px] px-6 py-3 text-left border-r border-white/5">
                <label className="block text-[8px] font-black uppercase text-mint tracking-widest mb-1">Budget ($)</label>
                <input 
                  type="number" 
                  placeholder="Max Price" 
                  className="bg-transparent border-none outline-none text-[12px] font-bold w-full placeholder:text-white/20"
                  onChange={(e) => setSearchParams({...searchParams, budget: e.target.value})}
                />
              </div>
              <button onClick={handleSearchTrigger} className="w-full lg:w-auto bg-white text-forest p-5 rounded-full hover:bg-mint transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* REST OF PAGE (TOP PICKS, CHATS, FOOTER) */}
      <main className="px-10 py-32 max-w-screen-2xl mx-auto">
        <div className="flex flex-col items-center mb-20">
          <span className="text-mint font-black text-[10px] uppercase tracking-[0.3em] mb-4">Handpicked Experiences</span>
          <h2 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter text-center">Top Picks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {packages.map((pkg) => (
            <motion.div whileHover={{ y: -15 }} key={pkg.id} className="cursor-pointer group" onClick={() => handleTouchPlace(pkg)}>
              <div className="aspect-[4/5] rounded-[50px] overflow-hidden mb-8 border border-white/10 relative">
                <img src={pkg.img} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition duration-700" alt={pkg.name} />
                <div className="absolute top-8 right-8 bg-forest/90 text-mint px-4 py-2 rounded-full font-black text-[10px]">
                  {currency === 'USD' ? `$${pkg.price}` : `LKR ${(pkg.price * 300).toLocaleString()}`}
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none mb-2">{pkg.name}</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{pkg.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {userInquiries.length > 0 && (
        <section className="px-10 py-32 bg-white/5 border-y border-white/5">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-4xl font-black italic uppercase mb-12">My Inquiries & Chats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userInquiries.map(inq => (
                <div key={inq.id} className="bg-[#0B1812] border border-white/10 p-8 rounded-[40px]">
                  <h4 className="text-xl font-black uppercase italic text-mint mb-4">{inq.packageName}</h4>
                  <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {inq.messages?.map((m, i) => (
                      <div key={i} className={`flex ${m.sender === 'traveler' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl text-[10px] max-w-[80%] ${m.sender === 'traveler' ? 'bg-white/10 text-white' : 'bg-mint text-forest font-bold'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none" placeholder="Reply..." onChange={(e) => setTravelerReply(e.target.value)} value={travelerReply} />
                    <button onClick={() => sendReplyToVendor(inq.id)} className="bg-white text-forest px-6 rounded-xl font-black text-[10px] uppercase transition hover:bg-mint">Send</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="px-10 py-32 bg-[#0B1812] border-t border-white/5 mt-20">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-center md:text-left">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-6xl font-black tracking-tighter mb-8 italic">ARONE</h2>
            <p className="text-gray-500 text-xs font-bold uppercase max-w-md leading-loose">Premium luxury travel curation across the emerald island.</p>
          </div>
          <div>
            <h5 className="text-mint text-[11px] font-black uppercase mb-8 underline underline-offset-8">Quick Links</h5>
            <ul className="text-gray-400 text-[10px] font-bold uppercase space-y-5">
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/destinations')}>Destinations</li>
              <li className="hover:text-white cursor-pointer" onClick={() => navigate('/itinerary')}>Custom Planner</li>
            </ul>
          </div>
          <div>
            <h5 className="text-mint text-[11px] font-black uppercase mb-8 underline underline-offset-8">Inquiries</h5>
            <ul className="text-gray-400 text-[10px] font-bold uppercase space-y-5">
              <li>contact@arone.lk</li>
              <li>+94 77 123 4567</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}