import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Agents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', location: '', img: '', details: '' });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // 1. Get packages created by THIS vendor
    const qPkg = query(collection(db, "packages"), where("vendorId", "==", auth.currentUser.uid));
    const unsubPkg = onSnapshot(qPkg, (snap) => {
      setPackages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Get bookings sent TO this vendor
    const qBook = query(collection(db, "bookings"), where("vendorId", "==", auth.currentUser.uid));
    const unsubBook = onSnapshot(qBook, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubPkg(); unsubBook(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "packages"), {
        ...formData,
        price: Number(formData.price),
        vendorId: auth.currentUser.uid, // THIS FIXES THE UNDEFINED ERROR
        createdAt: serverTimestamp()
      });
      alert("Package Added Successfully!");
      setActiveTab('listings');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-12">
      <button onClick={() => navigate('/')} className="mb-8 text-mint text-[10px] font-black uppercase tracking-widest">← Back to Site</button>
      
      <div className="flex gap-4 mb-12">
        <button onClick={() => setActiveTab('add')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase ${activeTab === 'add' ? 'bg-mint text-forest' : 'bg-white/5'}`}>Add New</button>
        <button onClick={() => setActiveTab('listings')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase ${activeTab === 'listings' ? 'bg-mint text-forest' : 'bg-white/5'}`}>My Listings ({packages.length})</button>
        <button onClick={() => setActiveTab('inquiries')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase ${activeTab === 'inquiries' ? 'bg-mint text-forest' : 'bg-white/5'}`}>Inquiries ({bookings.length})</button>
      </div>

      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl" placeholder="Package Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl" placeholder="Price" type="number" onChange={e => setFormData({...formData, price: e.target.value})} required />
          <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl" placeholder="Location" onChange={e => setFormData({...formData, location: e.target.value})} required />
          <input className="w-full bg-white/5 border border-white/10 p-4 rounded-xl" placeholder="Image URL" onChange={e => setFormData({...formData, img: e.target.value})} required />
          <textarea className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-32" placeholder="Details" onChange={e => setFormData({...formData, details: e.target.value})} required />
          <button className="w-full bg-white text-forest p-4 rounded-xl font-black uppercase tracking-widest">Publish</button>
        </form>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex justify-between items-center">
              <div>
                <h4 className="font-black uppercase italic">{b.packageName}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Client: {b.travelerEmail}</p>
              </div>
              <a href={`mailto:${b.travelerEmail}`} className="bg-mint text-forest px-6 py-2 rounded-full font-black text-[9px] uppercase">Contact</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}