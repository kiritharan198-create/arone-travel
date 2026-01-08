import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Compare from './pages/Compare';
import Itinerary from './pages/Itinerary';
import Agents from './pages/Agents';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Destinations from './pages/Destinations'; // NEW PAGE

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} /> {/* NEW ROUTE */}
        <Route path="/compare" element={<Compare />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;