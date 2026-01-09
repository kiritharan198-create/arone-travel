import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion, addDoc } from 'firebase/firestore';
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

  // Form State
  const [formPkg, setFormPkg] = useState({ name: '', location: '', price: '', img: '', details: '' });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // 1. Fetch Inquiries for this vendor
    const qInquiries = query(collection(db, "bookings"), where("vendorId", "==", auth.currentUser.uid));
    const unsubInquiries = onSnapshot(qInquiries, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Fetch Packages created by this vendor
    const qPackages = query(collection(db, "packages"), where("vendorId", "==", auth.currentUser.uid));
    const unsubPackages = onSnapshot(qPackages, (snapshot) => {
      setMyPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubInquiries(); unsubPackages(); };
  }, []);

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // MODIFY OPTION
        await updateDoc(doc(db, "packages", editingId), formPkg);
        alert("Package Updated!");
      } else {
        // ADD OPTION
        await addDoc(collection(db, "packages"), {
          ...formPkg,
          vendorId: auth.currentUser.uid,
          createdAt: new Date().toISOString()
        });
        alert("Package Published!");
      }
      resetForm();
    } catch (err) { alert(err.message); }
  };

  const deletePackage = async (id) => {
    if (window.confirm("Delete this listing permanently?")) {
      await deleteDoc(doc(db, "packages", id));
    }
  };

  const startEdit = (pkg) => {
    setFormPkg({ name: pkg.name, location: pkg.location, price: pkg.price, img: pkg.img, details: pkg.details });
    setEditingId(pkg.id);
    setShowAddForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setFormPkg({ name: '', location: '', price: '', img: '', details: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleReply = async (bookingId) => {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "Replied",
      messages: arrayUnion({ sender: "vendor", text: replyText, timestamp: new Date().toISOString() })
    });
    setReplyText("");
    setActiveChatId(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => navigate('/')} className="text-mint text-[10px] font-black uppercase tracking-[0.4em]">← Back to Home</button>
          <button onClick={() => { editingId ? resetForm() : setShowAddForm(!showAddForm) }} className="bg-mint text-forest px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest">
            {showAddForm ? "Close Form" : "+ Add New Package"}
          </button>
        </div>

        {/* ADD / MODIFY FORM */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-20">
              <form onSubmit={handleSavePackage} className="bg-white/5 border border-white/10 p-8 rounded-[40px] grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="md:col-span-2 text-xl font-black italic uppercase text-mint mb-4">{editingId ? 'Modify Listing' : 'New Listing'}</h2>
                <input required className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none" placeholder="Package Name" value={formPkg.name} onChange={e => setFormPkg({...formPkg, name: e.target.value})} />
                <input required className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none" placeholder="Location" value={formPkg.location} onChange={e => setFormPkg({...formPkg, location: e.target.value})} />
                <input required className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none" placeholder="Price ($)" value={formPkg.price} onChange={e => setFormPkg({...formPkg, price: e.target.value})} />
                <input required className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none" placeholder="Image URL" value={formPkg.img} onChange={e => setFormPkg({...formPkg, img: e.target.value})} />
                <textarea required className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none md:col-span-2" placeholder="Description" value={formPkg.details} onChange={e => setFormPkg({...formPkg, details: e.target.value})} />
                <button type="submit" className="bg-white text-forest p-4 rounded-2xl font-black uppercase text-[10px]">{editingId ? 'Update Changes' : 'Publish Package'}</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION: MY LISTINGS (MODIFY/DELETE OPTION) */}
        <section className="mb-20">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">My Active Listings</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myPackages.map(pkg => (
              <div key={pkg.id} className="bg-white/5 border border-white/10 p-6 rounded-[30px] group">
                <img src={pkg.img} className="w-full h-32 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 transition" alt="" />
                <h3 className="font-black uppercase italic text-lg">{pkg.name}</h3>
                <p className="text-mint text-[10px] font-bold mb-4">${pkg.price}</p>
                <div className="flex gap-4">
                  <button onClick={() => startEdit(pkg)} className="text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white">Modify</button>
                  <button onClick={() => deletePackage(pkg.id)} className="text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: INQUIRIES */}
        <section>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Traveler Inquiries</h1>
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full bg-mint/10 text-mint">{booking.status}</span>
                    <h3 className="text-2xl font-black italic uppercase mt-2">{booking.packageName}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">From: {booking.travelerEmail}</p>
                  </div>
                </div>
                {/* Chat Display... (Keep existing chat UI) */}
                <div className="bg-black/20 rounded-2xl p-4 mb-6 max-h-40 overflow-y-auto space-y-3">
                  {booking.messages?.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${msg.sender === 'vendor' ? 'bg-mint text-forest font-bold' : 'bg-white/10 text-white italic'}`}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                {activeChatId === booking.id ? (
                  <div className="space-y-4">
                    <textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm italic outline-none text-white" placeholder="Type reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <button onClick={() => handleReply(booking.id)} className="bg-white text-forest px-8 py-3 rounded-xl font-black text-[10px] uppercase">Send Reply</button>
                  </div>
                ) : (
                  <button onClick={() => setActiveChatId(booking.id)} className="w-full border border-white/10 py-4 rounded-2xl font-black uppercase text-[10px]">Open Chat</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}