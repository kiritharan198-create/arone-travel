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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userInquiries, setUserInquiries] = useState([]);
  const [travelerReply, setTravelerReply] = useState("");
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  // --- PERSISTENT CURRENCY TOGGLE ---
  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'LKR' : 'USD';
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event("storage"));
  };

  // --- FIREBASE SYNC ---
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

  // --- NAVIGATION (TOUCH LOGIC) ---
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
      <nav className="flex justify-between items-center px-12 py-10 sticky top-0 z-50 bg-[#0B1812]/90 backdrop-blur-md border-b border-white/5">
        <div className="text-4xl font-black tracking-tighter cursor-pointer" onClick={() => navigate('/')}>ARONE</div>
        
        <div className="hidden md:flex gap-14 text-[12px] font-black uppercase tracking-[0.2em]">
          <button onClick={() => navigate('/destinations')} className="hover:text-mint transition">Destinations</button>
          <button onClick={() => navigate('/compare')} className="hover:text-mint transition">Compare</button>
          <button onClick={() => navigate('/itinerary')} className="hover:text-mint transition">Planner</button>
          <button onClick={toggleCurrency} className="text-mint border border-mint/20 px-4 py-1 rounded-md hover:bg-mint hover:text-forest transition font-black">{currency}</button>
          {userRole === 'vendor' && <button onClick={() => navigate('/agents')} className="text-mint animate-pulse transition">Vendor Hub</button>}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <button onClick={() => signOut(auth)} className="text-white/40 hover:text-red-500 font-black text-[9px] uppercase tracking-widest">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-white text-forest px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest">Sign In</button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[85vh] px-6 mt-4">
        <div className="w-full h-full rounded-[60px] overflow-hidden relative border border-white/5">
          <img src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920" className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1812] via-[#0B1812]/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-16 lg:px-32">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-mint font-bold text-[10px] uppercase tracking-[0.5em] mb-6 block italic">Premium Sri Lanka</span>
              <h1 className="text-7xl md:text-[100px] font-black leading-[0.85] mb-12 tracking-tighter uppercase italic">The Pearl <br/> of the <br/> Indian Ocean</h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TOP PICKS */}
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
                <div className="absolute top-8 right-8 bg-forest/90 text-mint px-4 py-2 rounded-full font-black text-[10px] shadow-2xl">
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

      {/* CHATS SECTION */}
      {userInquiries.length > 0 && (
        <section className="px-10 py-32 bg-white/5 border-y border-white/5">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-12">My Inquiries & Chats</h2>
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
                    <input className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-xs outline-none" placeholder="Reply to vendor..." onChange={(e) => setTravelerReply(e.target.value)} value={travelerReply} />
                    <button onClick={() => sendReplyToVendor(inq.id)} className="bg-white text-forest px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition">Send</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ISLAND CURIOSITIES (INTERESTING FACTS) */}
      <section className="bg-[#0B1812] py-32 px-10 border-y border-white/5">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-4xl font-black italic uppercase mb-16 tracking-tighter">Island Curiosities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "The Lion Rock", desc: "Sigiriya was a royal palace built 1,600 years ago atop a 200m granite peak." },
              { title: "Cinnamon Origin", desc: "Sri Lanka produces 90% of the world's high-quality 'True Cinnamon'." },
              { title: "Blue Whales", desc: "The southern coast is one of the few places where Blue Whales stay year-round." }
            ].map((fact, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-[40px] border border-white/5">
                <span className="text-mint font-black text-4xl italic mb-6 block">0{i+1}</span>
                <h4 className="text-xl font-black uppercase italic mb-4 tracking-tighter">{fact.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed italic">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL FOOTER WITH COPYRIGHTS AND DETAILS */}
      <footer className="px-10 py-32 bg-[#0B1812] border-t border-white/5 mt-20">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-6xl font-black tracking-tighter mb-8 italic">ARONE</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] max-w-md leading-loose italic">
              Experience the pinnacle of luxury travel. We curate the finest heritage and modern escapes across the emerald island.
            </p>
          </div>
          
          <div>
            <h5 className="text-mint text-[11px] font-black uppercase tracking-widest mb-8 italic underline underline-offset-8">Quick Links</h5>
            <ul className="text-gray-400 text-[10px] font-bold uppercase space-y-5 tracking-[0.2em]">
              <li className="hover:text-white cursor-pointer transition" onClick={() => navigate('/destinations')}>Destinations</li>
              <li className="hover:text-white cursor-pointer transition" onClick={() => navigate('/compare')}>Compare Pricing</li>
              <li className="hover:text-white cursor-pointer transition" onClick={() => navigate('/itinerary')}>Custom Planner</li>
              <li className="hover:text-white cursor-pointer transition" onClick={() => navigate('/agents')}>Agent Portal</li>
            </ul>
          </div>

          <div>
            <h5 className="text-mint text-[11px] font-black uppercase tracking-widest mb-8 italic underline underline-offset-8">Inquiries</h5>
            <ul className="text-gray-400 text-[10px] font-bold uppercase space-y-5 tracking-[0.2em]">
              <li className="hover:text-white cursor-pointer transition">contact@arone.lk</li>
              <li className="hover:text-white cursor-pointer transition">+94 77 123 4567</li>
              <li className="hover:text-white cursor-pointer transition">Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">
          <p>© 2026 ARONE TRAVELS SRI LANKA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-12 mt-6 md:mt-0">
            <span className="cursor-pointer hover:text-white transition">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition">Terms of Service</span>
            <span className="text-mint italic">Designed for Excellence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}