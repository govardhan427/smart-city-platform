// src/pages/PaymentPage.js
import React, { useState } from 'react';
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
  
  // Payment State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // 1. SESSION CHECK (Prevents the blank screen)
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

  // 2. SAFETY FIX: Default extraData to an empty object {}
  // This prevents "Cannot read properties of undefined"
  const { type, id, title, price, extraData = {} } = state; 

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(async () => {
      try {
        if (type === 'event') {
          // Safe access using ?. (Optional Chaining)
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
        
        <div className={styles.summarySection}>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          
          <div className={styles.itemDetails}>
            <div className={styles.itemLabel}>Item / Service</div>
            <div className={styles.itemValue}>{title}</div>

            {/* 3. SAFETY FIX: Use optional chaining here too */}
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
            <div className={styles.totalPrice}>₹{price}</div>
          </div>
        </div>

        {/* Form Section (No changes needed here) */}
        <div className={styles.formSection}>
          <div className={styles.visualCard}>
            <div className={styles.chip}></div>
            <div className={styles.cardNumDisplay}>{formatCardDisplay(cardNumber)}</div>
            <div className={styles.cardBottom}>
              <span>{cardName || 'YOUR NAME'}</span>
              <span>{expiry || 'MM/YY'}</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className={styles.form}>
            <Input label="Card Number" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required maxLength="16"/>
            <Input label="Cardholder Name" placeholder="AS ON CARD" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} required />
            <div className={styles.row}>
              <Input label="Expiry Date" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} required maxLength="5"/>
              <Input label="CVV / CVC" placeholder="123" type="password" value={cvv} onChange={e => setCvv(e.target.value)} required maxLength="3"/>
            </div>
            <div style={{marginTop: '20px'}}>
              <Button type="submit" disabled={loading} variant="success">{loading ? 'Processing...' : `Pay ₹${price}`}</Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;