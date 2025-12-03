import { useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const IdleMonitor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // ⏳ SET TIMEOUT DURATION HERE (e.g., 15 minutes)
  const TIMEOUT_MS = 15 * 60 * 1000; 

  useEffect(() => {
    // 1. If no user is logged in, do nothing
    if (!user) return;

    // 2. The function that triggers logout
    const handleLogout = () => {
      logout();
      toast.warn("Session expired due to inactivity.");
      navigate('/login');
    };

    // 3. The function that resets the timer
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, TIMEOUT_MS);
    };

    // 4. List of events that count as "Activity"
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // 5. Add Event Listeners
    events.forEach(event => window.addEventListener(event, resetTimer));

    // 6. Start the initial timer
    resetTimer();

    // 7. Cleanup when component unmounts or user logs out
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout, navigate]);

  return null; // This component doesn't render anything visible
};

export default IdleMonitor;