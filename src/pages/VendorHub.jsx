import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorHub() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
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
        await addDoc(collection(db, "packages"), { ...data, createdAt: serverTimestamp() });
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
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Vendor Hub</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase transition">Exit</button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-mint text-forest px-8 py-3 rounded-full font-black text-[10px] uppercase">{showAddForm ? "Close Form" : "+ Add Package"}</button>
          </div>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form onSubmit={handleSavePackage} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 p-10 rounded-[50px] border border-white/10 grid md:grid-cols-2 gap-4 mb-12 shadow-2xl">
              <input required placeholder="Package Name" value={formPkg.name} onChange={e => setFormPkg({...formPkg, name: e.target.value})} />
              <input required placeholder="Location" value={formPkg.location} onChange={e => setFormPkg({...formPkg, location: e.target.value})} />
              <input required type="number" placeholder="Price" value={formPkg.price} onChange={e => setFormPkg({...formPkg, price: e.target.value})} />
              <input required type="number" placeholder="Seasonal Price" value={formPkg.seasonalPrice} onChange={e => setFormPkg({...formPkg, seasonalPrice: e.target.value})} />
              <select value={formPkg.cancellationPolicy} onChange={e => setFormPkg({...formPkg, cancellationPolicy: e.target.value})}>
                <option value="Flexible">Flexible</option>
                <option value="Strict">Strict</option>
              </select>
              <input required placeholder="Image URL" value={formPkg.img} onChange={e => setFormPkg({...formPkg, img: e.target.value})} />
              <textarea placeholder="Details" value={formPkg.details} onChange={e => setFormPkg({...formPkg, details: e.target.value})} />
              <button className="md:col-span-2">{editingId ? 'Update Listing' : 'Deploy Package'}</button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
