import React from 'react';
import { useParams } from 'react-router-dom';

export default function PackageDetail() {
  const { id } = useParams(); // This gets 'mountain' or 'island' from the URL

  return (
    <div className="pt-20 px-10 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 mt-10">
        <div className="h-[500px] rounded-[40px] overflow-hidden">
          <img src={`https://source.unsplash.com/featured/?${id}`} className="w-full h-full object-cover" alt={id} />
        </div>
        <div>
          <span className="text-gold font-bold uppercase tracking-widest text-xs">Premium Experience</span>
          <h1 className="text-5xl font-serif mt-4 mb-6 capitalize">{id} Getaway</h1>
          <p className="text-gray-600 leading-relaxed mb-8">
            Experience the ultimate luxury with our curated {id} tour. This package includes a 5-star stay, 
            private guided tours, and all-inclusive seasonal dining.
          </p>
          <div className="bg-[#F9F9F9] p-6 rounded-3xl flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold">Price per person</p>
              <p className="text-2xl font-bold text-black">$1,250</p>
            </div>
            <button className="bg-black text-white px-8 py-3 rounded-full font-bold">Book Now</button>
          </div>
          <h3 className="font-bold mb-4">What's included:</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            <li>✓ 5 Nights Accommodation</li>
            <li>✓ Expert Local Guide</li>
            <li>✓ Multi-currency Support</li>
            <li>✓ Flexible Cancellation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}