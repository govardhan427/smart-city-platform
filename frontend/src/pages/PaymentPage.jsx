import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './PaymentPage.module.css';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  
  // Payment Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // DEBUG: Open Console (F12) to see why Price might be missing
  useEffect(() => {
    console.log("💳 PAYMENT PAGE RECEIVED DATA:", state);
  }, [state]);

  // 1. SESSION CHECK (Prevents Crash on Refresh)
  if (!state) {
    return (
      <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <div className={styles.summarySection} style={{ maxWidth: '500px', padding: '40px', border: '1px solid #ff4d4d' }}>
          <h1 style={{ color: '#ff4d4d', marginBottom: '15px' }}>⚠️ Session Expired</h1>
          <p style={{ color: '#ccc', marginBottom: '30px' }}>
             Payment details are lost on refresh. Please go back and select your booking again.
          </p>
          <Button onClick={() => navigate('/')} variant="danger">Return to Home</Button>
        </div>
      </div>
    );
  }

  // 2. SAFE DESTRUCTURING
  // We default extraData to {} so it never crashes if missing
  const { type, id, title, price, extraData = {} } = state; 

  // 3. PRICE FALLBACK (Fixes "Total Amount Not Getting")
  // If price is missing, show 0.
  const displayPrice = price ? price : 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // SIMULATE PAYMENT DELAY
    setTimeout(async () => {
      try {
        if (type === 'event') {
          // Default to 1 ticket if missing, to prevent backend error
          await api.post(`/events/${id}/register/`, { tickets: extraData?.tickets || 1 });
        } 
        else if (type === 'facility') {
          await api.post(`/facilities/${id}/book/`, extraData);
        }
        else if (type === 'parking') {
          await api.post(`/transport/parking/${id}/book/`, extraData);
        }
        
        toast.success("💳 Payment Approved! Booking Confirmed.");
        navigate('/my-bookings'); 
        
      } catch (err) {
        toast.error("Transaction failed. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 2000); 
  };

  const formatCardDisplay = (num) => {
    return num.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentWrapper}>
        
        {/* LEFT COL: Order Summary */}
        <div className={styles.summarySection}>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          
          <div className={styles.itemDetails}>
            <div className={styles.itemLabel}>Item / Service</div>
            <div className={styles.itemValue}>{title}</div>

            {/* Check if tickets exist using optional chaining */}
            {extraData?.tickets && (
              <>
                <div className={styles.itemLabel}>Quantity</div>
                <div className={styles.itemValue}>{extraData.tickets} Ticket(s)</div>
              </>
            )}
            
            {extraData?.vehicle_number && (
              <>
                <div className={styles.itemLabel}>Vehicle ID</div>
                <div className={styles.itemValue}>{extraData.vehicle_number}</div>
              </>
            )}
          </div>

          <div className={styles.totalContainer}>
            <div className={styles.totalLabel}>Total Amount</div>
            {/* Display the Safe Price */}
            <div className={styles.totalPrice}>₹{displayPrice}</div>
          </div>
        </div>

        {/* RIGHT COL: Form */}
        <div className={styles.formSection}>
          
          <div className={styles.visualCard}>
            <div className={styles.chip}></div>
            <div className={styles.cardNumDisplay}>
              {formatCardDisplay(cardNumber)}
            </div>
            <div className={styles.cardBottom}>
              <span>{cardName || 'YOUR NAME'}</span>
              <span>{expiry || 'MM/YY'}</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className={styles.form}>
            <Input 
              label="Card Number" 
              placeholder="0000 0000 0000 0000" 
              value={cardNumber} 
              onChange={e => setCardNumber(e.target.value)} 
              required 
              maxLength="16"
            />
            
            <Input 
              label="Cardholder Name" 
              placeholder="AS ON CARD" 
              value={cardName} 
              onChange={e => setCardName(e.target.value.toUpperCase())} 
              required 
            />

            <div className={styles.row}>
              <Input 
                label="Expiry Date" 
                placeholder="MM/YY" 
                value={expiry} 
                onChange={e => setExpiry(e.target.value)} 
                required 
                maxLength="5"
              />
              <Input 
                label="CVV / CVC" 
                placeholder="123" 
                type="password" 
                value={cvv} 
                onChange={e => setCvv(e.target.value)} 
                required 
                maxLength="3"
              />
            </div>

            <div style={{marginTop: '20px'}}>
              <Button type="submit" disabled={loading} variant="success">
                {loading ? 'Processing Transaction...' : `Pay ₹${displayPrice}`}
              </Button>
            </div>

            <div className={styles.secureBadge}>
              <span className={styles.secureIcon}>🔒</span> 256-bit SSL Encrypted Connection
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;