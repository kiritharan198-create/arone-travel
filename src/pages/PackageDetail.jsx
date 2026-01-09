import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      const docSnap = await getDoc(doc(db, "packages", id));
      if (docSnap.exists()) setPkg(docSnap.data());
      setLoading(false);
    };
    fetchPackage();
  }, [id]);

  const handleInquiry = async () => {
    if (!auth.currentUser) return navigate('/login');
    if (!pkg?.vendorId) return alert("System Error: Vendor ID missing.");
    
    try {
      await addDoc(collection(db, "bookings"), {
        packageId: id,
        packageName: pkg.name,
        packagePrice: pkg.price,
        vendorId: pkg.vendorId, // Bridge to Vendor Hub
        travelerId: auth.currentUser.uid,
        travelerEmail: auth.currentUser.email,
        status: "Pending",
        messages: [{ sender: 'system', text: `Inquiry started for ${pkg.name}`, timestamp: new Date().toISOString() }],
        createdAt: serverTimestamp()
      });
      alert("Sent! The Agent will message you shortly.");
      navigate('/profile');
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B1812] text-mint font-black">OPENING DOSSIER...</div>;

  return (
    <div className="pt-20 pb-20 px-10 bg-[#0B1812] min-h-screen text-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 mt-10">
        <div className="relative h-[600px] rounded-[50px] overflow-hidden border border-white/10 shadow-2xl">
          <img src={pkg.img} className="w-full h-full object-cover" alt={pkg.name} />
          <div className="absolute bottom-10 left-10 flex gap-3">
             <span className="bg-black/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase border border-white/10">{pkg.cancellationPolicy} Cancellation</span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-mint font-black uppercase tracking-[0.5em] text-[10px] mb-4">Dossier #{id.slice(0,6)}</span>
          <h1 className="text-6xl font-black italic uppercase leading-tight mb-6">{pkg.name}</h1>
          <p className="text-gray-400 font-medium leading-relaxed mb-10 text-lg">{pkg.details}</p>
          
          <div className="bg-white/5 border border-white/10 p-10 rounded-[40px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Standard Rate</p>
                <p className="text-4xl font-black italic text-mint">${pkg.price}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">Peak Season</p>
                <p className="text-2xl font-black italic text-gray-400">${pkg.seasonalPrice}</p>
              </div>
            </div>
            <button onClick={handleInquiry} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase hover:bg-mint transition-colors">
              Request Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}