import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-white sticky top-0 z-50 shadow-sm">
      <div className="text-2xl font-bold text-travel-dark tracking-tighter">ARONE</div>
      <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-600">
        <Link to="/" className="hover:text-travel-dark">Home</Link>
        <Link to="/destinations" className="hover:text-travel-dark">Destinations</Link>
        <Link to="/packages" className="hover:text-travel-dark">Packages</Link>
        <Link to="/agents" className="hover:text-travel-dark">Agents</Link>
      </div>
      <button className="bg-travel-dark text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-opacity-90 transition">
        Log In
      </button>
    </nav>
  );
}