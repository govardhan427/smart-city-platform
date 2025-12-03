import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import MyRegistrationsPage from './pages/MyRegistrationsPage';
import AdminScanPage from './pages/AdminScanPage';
// import AdminCreateEventPage from './pages/AdminCreateEventPage';
import FacilitiesPage from './pages/FacilitiesPage'
import BookFacilityPage from './pages/BookFacilityPage';
// import MyFacilityBookingsPage from './pages/MyFacilityBookingsPage'
import ParkingPage from './pages/ParkingPage';
import BookParkingPage from './pages/BookParkingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProfilePage from './pages/ProfilePage';
import AdminEditEventPage from './pages/AdminEditEventPage';
import MyUnifiedBookingsPage from './pages/MyUnifiedBookingsPage';
import LiveDashboard from './pages/LiveDashboard';
import AdminCreatePage from './pages/AdminCreatePage';
import HeroIntro from './components/layout/HeroIntro';
import  EventsPage from './pages/EventsPage';
import PaymentPage from './pages/PaymentPage';
import { Analytics } from "@vercel/analytics/react"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/toast.css';
import IdleMonitor from './components/common/IdleMonitor';
import CityBot from './components/common/CityBot';
import NewsTicker from './components/common/NewsTicker';

function App() {
  const [introFinished, setIntroFinished] = useState(false);
  return (
    <AuthProvider>
      {!introFinished && <HeroIntro onComplete={() => setIntroFinished(true)} />}
      <div className={`App ${introFinished ? 'fade-in-content' : 'hidden'}`}>
        <IdleMonitor />
        <Navbar />
        <NewsTicker />
        <main style={{ padding: '2rem' }} className="animate-page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route 
      path="/payment" 
      element={
        <ProtectedRoute>
          <PaymentPage />
        </ProtectedRoute>
      } 
    />
            {/* <Route 
              path="/my-registrations" 
              element={
                <ProtectedRoute>
                  <MyRegistrationsPage />
                </ProtectedRoute>
              } 
            /> */}
            <Route 
  path="/facilities/:id/book" 
  element={
    <ProtectedRoute>
      <BookFacilityPage />
    </ProtectedRoute>
  } 
/>
{/* <Route 
  path="/my-facility-bookings" 
  element={
    <ProtectedRoute>
      <MyFacilityBookingsPage />
    </ProtectedRoute>
  } 
/> */}
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
<Route path="/admin/edit-event/:id" element={<AdminRoute><AdminEditEventPage /></AdminRoute>} />
<Route 
  path="/my-bookings" 
  element={
    <ProtectedRoute>
      <MyUnifiedBookingsPage />
    </ProtectedRoute>
  } 
/>
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route 
              path="/admin/scan" 
              element={
                <AdminRoute>
                  <AdminScanPage />
                </AdminRoute>
              } 
            />
            <Route 
  path="/admin/create"  // Changed URL from /create-event to /create
  element={
    <AdminRoute>
      <AdminCreatePage />
    </AdminRoute>
  } 
/>
            <Route 
  path="/admin/analytics" 
  element={<AdminRoute><AnalyticsDashboard /></AdminRoute>} 
/>
<Route path="/admin/live" element={<AdminRoute><LiveDashboard /></AdminRoute>} />
            <Route path="/parking" element={<ParkingPage />} />
<Route path="/parking/:id/book" element={<ProtectedRoute><BookParkingPage /></ProtectedRoute>} />
            {/* <Route
              path="/admin/create-event"
              element={
                <AdminRoute>
                  <AdminCreateEventPage />
                </AdminRoute>
              }
            /> */}
          </Routes>
        </main>
        <Analytics />
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
  style={{
    marginTop: "90px" // adjust depending on navbar height
  }}
/>
<CityBot />

      </div>
    </AuthProvider>
  );
}
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginPage />;
  return children;
};
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginPage />;
  if (!user.is_staff) return <HomePage />;
  return children;
};

export default App;