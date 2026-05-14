import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Search from './pages/Search';
import Knowledge from './pages/Knowledge';
import VehicleDetail from './pages/VehicleDetail';
import AISearch from './pages/AISearch';
import Compare from './pages/Compare';
import NewListing from './pages/NewListing';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/Vehicles';
import AdminUsers from './pages/admin/Users';
import AdminListings from './pages/admin/Listings';
import AdminCache from './pages/admin/Cache';
import AdminLogs from './pages/admin/Logs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/vehicle/:id" element={<VehicleDetail />} />
            <Route path="/knowledge/:make/:model" element={<Knowledge />} />
            <Route path="/ai-search" element={<AISearch />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/listings/new" element={<NewListing />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/cache" element={<AdminCache />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
            </Route>
          </Routes>
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
