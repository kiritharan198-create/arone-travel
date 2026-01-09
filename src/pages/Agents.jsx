import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorHub() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formPkg, setFormPkg] = useState({ 
    name: '', location: '', price: '', seasonalPrice: '', 
    cancellationPolicy: 'Flexible', img: '', details: '', isFeatured: false 
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const qInquiries = query(collection(db, "bookings"), where("vendorId", "==", auth.currentUser.uid));
    const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qPackages = query(collection(db, "packages"), where("vendorId", "==", auth.currentUser.uid));
    const unsubPackages = onSnapshot(qPackages, (snapshot) => {
      setMyPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubInquiries(); unsubPackages(); };
  }, []);

  const totalEarnings = bookings
    .filter(b => b.status === "Confirmed")
    .reduce((sum, b) => sum + (Number(b.packagePrice) || 0), 0);

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const data = { 
        ...formPkg, 
        price: Number(formPkg.price), 
        seasonalPrice: Number(formPkg.seasonalPrice),
        vendorId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      };
      if (editingId) {
        await updateDoc(doc(db, "packages", editingId), data);
      } else {
        await addDoc(collection(db, "packages"), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
      alert("Listing Updated!");
    } catch (err) { alert(err.message); }
  };

  const resetForm = () => {
    setFormPkg({ name: '', location: '', price: '', seasonalPrice: '', cancellationPolicy: 'Flexible', img: '', details: '', isFeatured: false });
    setEditingId(null);
    setShowAddForm(false);
  };

  const updateBookingStatus = async (id, status) => {
    await updateDoc(doc(db, "bookings", id), { status });
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER WITH EXIT BUTTON */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Agent Hub</h1>
            <p className="text-mint text-[9px] font-black uppercase tracking-[0.4em]">Proprietary Command Center</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase transition">
              Exit Terminal
            </button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-mint text-forest px-8 py-3 rounded-full font-black text-[10px] uppercase">
              {showAddForm ? "Close Form" : "+ Add Package"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-mint to-emerald-600 text-forest p-8 rounded-[40px] shadow-xl">
            <p className="text-[10px] font-black uppercase opacity-60">Revenue (USD)</p>
            <h2 className="text-5xl font-black italic mt-1">${totalEarnings.toLocaleString()}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <p className="text-[10px] font-black uppercase text-mint">Pending</p>
            <h2 className="text-5xl font-black italic mt-1">{bookings.filter(b=>b.status === "Pending").length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <p className="text-[10px] font-black uppercase text-gray-500">Live Assets</p>
            <h2 className="text-5xl font-black italic mt-1">{myPackages.length}</h2>
          </div>
        </div>

        {/* ADD FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form onSubmit={handleSavePackage} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 p-10 rounded-[50px] border border-white/10 grid md:grid-cols-2 gap-4 mb-12 shadow-2xl">
              <input required className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10" placeholder="Package Name" value={formPkg.name} onChange={e => setFormPkg({...formPkg, name: e.target.value})} />
              <input required className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10" placeholder="Location" value={formPkg.location} onChange={e => setFormPkg({...formPkg, location: e.target.value})} />
              <input required type="number" className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10" placeholder="Standard Price ($)" value={formPkg.price} onChange={e => setFormPkg({...formPkg, price: e.target.value})} />
              <input required type="number" className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10 text-mint" placeholder="Seasonal Price ($)" value={formPkg.seasonalPrice} onChange={e => setFormPkg({...formPkg, seasonalPrice: e.target.value})} />
              <select className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10" value={formPkg.cancellationPolicy} onChange={e => setFormPkg({...formPkg, cancellationPolicy: e.target.value})}>
                <option value="Flexible">Flexible Policy</option>
                <option value="Strict">Strict Policy</option>
              </select>
              <input required className="bg-black/40 p-4 rounded-2xl outline-none border border-white/10" placeholder="Image URL" value={formPkg.img} onChange={e => setFormPkg({...formPkg, img: e.target.value})} />
              <textarea className="md:col-span-2 bg-black/40 p-4 rounded-2xl h-24 border border-white/10" placeholder="Package Details..." value={formPkg.details} onChange={e => setFormPkg({...formPkg, details: e.target.value})} />
              <button className="md:col-span-2 bg-white text-forest py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-mint transition">
                {editingId ? 'Update Listing' : 'Deploy to Marketplace'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* DASHBOARD GRID */}
        <div className="grid lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2">
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-4">
              Incoming Orders <span className="h-[1px] flex-1 bg-white/10"></span>
            </h2>
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white/[0.02] p-8 rounded-[40px] border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-black italic uppercase leading-tight">{b.packageName}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">{b.travelerEmail}</p>
                    </div>
                    <span className={`text-[9px] font-black px-4 py-1 rounded-full uppercase ${b.status === 'Confirmed' ? 'bg-mint text-forest' : 'bg-white/10'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {b.status === "Pending" && (
                      <button onClick={() => updateBookingStatus(b.id, "Confirmed")} className="bg-mint text-forest px-6 py-2 rounded-xl text-[10px] font-black uppercase">Confirm</button>
                    )}
                    <button onClick={() => setActiveChatId(activeChatId === b.id ? null : b.id)} className="border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase">
                      {activeChatId === b.id ? "Close Transmission" : "Open Comms"}
                    </button>
                  </div>

                  {activeChatId === b.id && (
                    <div className="mt-8 bg-black/40 p-6 rounded-[30px] border border-white/5">
                      <div className="h-40 overflow-y-auto mb-4 space-y-3 pr-2">
                        {b.messages?.map((m, i) => (
                          <div key={i} className={`flex ${m.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl text-[10px] max-w-[80%] ${m.sender === 'vendor' ? 'bg-mint text-forest font-black' : 'bg-white/10'}`}>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input id={`msg-${b.id}`} className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-[10px]" placeholder="Type signal..." />
                        <button onClick={() => {
                          const input = document.getElementById(`msg-${b.id}`);
                          if(!input.value) return;
                          updateDoc(doc(db, "bookings", b.id), {
                            messages: arrayUnion({ sender: 'vendor', text: input.value, timestamp: new Date().toISOString() })
                          });
                          input.value = "";
                        }} className="bg-white text-forest px-6 rounded-xl text-[10px] font-black uppercase">Send</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-4">
              Inventory <span className="h-[1px] flex-1 bg-white/10"></span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {myPackages.map(pkg => (
                <div key={pkg.id} className="bg-white/5 p-5 rounded-[35px] border border-white/5 group">
                  <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                    <img src={pkg.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                    <div className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-full text-[9px] font-black text-mint">${pkg.price}</div>
                  </div>
                  <h4 className="font-black italic uppercase text-sm truncate">{pkg.name}</h4>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                    <button onClick={() => { setFormPkg(pkg); setEditingId(pkg.id); setShowAddForm(true); }} className="text-[9px] uppercase font-black text-white/40 hover:text-white transition">Edit</button>
                    <button onClick={() => { if(window.confirm("Delete listing?")) deleteDoc(doc(db, "packages", pkg.id)) }} className="text-[9px] uppercase font-black text-red-500/40 hover:text-red-500 transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}