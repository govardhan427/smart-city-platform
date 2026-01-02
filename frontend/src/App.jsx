import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

// --- LAYOUT & COMMON ---
import Navbar from './components/layout/Navbar';
import HeroIntro from './components/layout/HeroIntro';
import IdleMonitor from './components/common/IdleMonitor';
import CityBot from './components/common/CityBot';
import NewsTicker from './components/common/NewsTicker';

// --- PUBLIC PAGES ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import ParkingPage from './pages/ParkingPage';

// --- SECURE USER PAGES ---
import ProfilePage from './pages/ProfilePage';
import MyUnifiedBookingsPage from './pages/MyUnifiedBookingsPage';
import BookFacilityPage from './pages/BookFacilityPage';
import BookParkingPage from './pages/BookParkingPage';
import PaymentPage from './pages/PaymentPage';

// --- ADMIN PAGES ---
import AdminCreatePage from './pages/AdminCreatePage';
import AdminEditEventPage from './pages/AdminEditEventPage';
import LiveDashboard from './pages/LiveDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminScanPage from './pages/AdminScanPage';

// --- UTILS & STYLES ---
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/toast.css'; // Our Crystal Toast Theme
import './App.css'; 

function App() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <AuthProvider>
      
      {/* 🌌 THE LIVING BACKGROUND LAYER */}
      <div className="ambient-light">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* 🎬 CINEMATIC INTRO */}
      {!introFinished && <HeroIntro onComplete={() => setIntroFinished(true)} />}
      
      {/* 🖥️ MAIN INTERFACE */}
      <div className={`App ${introFinished ? 'fade-in-content' : 'hidden'}`}>
        
        <IdleMonitor />
        <Navbar />
        
        {/* HUD Elements */}
        <NewsTicker />
        
        <main style={{ paddingBottom: '80px', position: 'relative', zIndex: 10 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/parking" element={<ParkingPage />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/profile" 
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
            />
            <Route 
              path="/my-bookings" 
              element={<ProtectedRoute><MyUnifiedBookingsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/facilities/:id/book" 
              element={<ProtectedRoute><BookFacilityPage /></ProtectedRoute>} 
            />
            <Route 
              path="/parking/:id/book" 
              element={<ProtectedRoute><BookParkingPage /></ProtectedRoute>} 
            />
            <Route 
              path="/payment" 
              element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/create" 
              element={<AdminRoute><AdminCreatePage /></AdminRoute>} 
            />
            <Route 
              path="/admin/edit-event/:id" 
              element={<AdminRoute><AdminEditEventPage /></AdminRoute>} 
            />
            <Route 
              path="/admin/live" 
              element={<AdminRoute><LiveDashboard /></AdminRoute>} 
            />
            <Route 
              path="/admin/analytics" 
              element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} 
            />
            <Route 
              path="/admin/scan" 
              element={<AdminRoute><AdminScanPage /></AdminRoute>} 
            />
          
          </Routes>
        </main>
        
        <Analytics />
        
        {/* Global Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName="Toastify__toast--dark"
          style={{ marginTop: "80px" }} // Pushes toasts below Navbar
        />
        
        {/* Floating AI Assistant */}
        <CityBot />

      </div>
    </AuthProvider>
  );
}

// --- ROUTE GUARDS ---

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  // While checking auth status, show a simple loader or nothing
  if (loading) return null; 
  if (!user) return <LoginPage />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <LoginPage />;
  if (!user.is_staff) return <HomePage />;
  return children;
};

export default App;