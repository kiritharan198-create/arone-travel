import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorHub() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "bookings"), where("vendorId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try { await deleteDoc(doc(db, "bookings", id)); } 
      catch (err) { alert("Error deleting: " + err.message); }
    }
  };

  const handleReply = async (bookingId) => {
    if (!replyText.trim()) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "Replied",
        messages: arrayUnion({
          sender: "vendor",
          text: replyText,
          timestamp: new Date().toISOString()
        })
      });
      setReplyText("");
      setActiveChatId(null);
    } catch (err) { alert("Error: " + err.message); }
  };

  return (
    <div className="min-h-screen bg-[#0B1812] text-white p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        {/* BACK BUTTON Restored */}
        <button 
          onClick={() => navigate('/')} 
          className="text-mint text-[10px] font-black uppercase tracking-[0.4em] mb-12 block hover:opacity-70 transition"
        >
          ← Back to Home
        </button>

        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">Inquiries Hub</h1>

        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-mint/20 text-mint'}`}>
                    {booking.status}
                  </span>
                  <h3 className="text-2xl font-black italic uppercase mt-2">{booking.packageName}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">From: {booking.travelerEmail}</p>
                </div>
                <button onClick={() => handleDelete(booking.id)} className="text-red-500/50 hover:text-red-500 transition text-[10px] font-black uppercase tracking-widest">Delete Inquiry</button>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 mb-6 max-h-40 overflow-y-auto space-y-3">
                <p className="text-[9px] text-gray-600 uppercase font-black mb-2">Message Thread</p>
                {booking.messages?.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs italic ${msg.sender === 'vendor' ? 'bg-mint text-forest font-bold' : 'bg-white/10 text-white'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {activeChatId === booking.id ? (
                <div className="space-y-4">
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm italic outline-none focus:border-mint transition text-white"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button onClick={() => handleReply(booking.id)} className="bg-white text-forest px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-mint transition">Send Reply</button>
                    <button onClick={() => setActiveChatId(null)} className="text-gray-500 text-[10px] font-black uppercase">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActiveChatId(booking.id)} className="w-full border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition">Reply to Traveler</button>
              )}
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500 italic text-center py-20">No inquiries found yet.</p>}
        </div>
      </div>
    </div>
  );
}