import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Agents from './pages/Agents';
import Destinations from './pages/Destinations';
import Compare from './pages/Compare';
import Itinerary from './pages/Itinerary';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import TravelerHub from './pages/TravelerHub'; // ✅ ADDED

import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />

        {/* Traveler Only (SAME AS VENDOR) */}
        <Route
          path="/traveler"
          element={
            <ProtectedRoute requiredRole="traveler">
              <TravelerHub />
            </ProtectedRoute>
          }
        />

        {/* Vendor Only */}
        <Route
          path="/agents"
          element={
            <ProtectedRoute requiredRole="vendor">
              <Agents />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
