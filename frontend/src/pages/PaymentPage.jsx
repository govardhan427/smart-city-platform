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

  // 1. SESSION CHECK
  if (!state) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1>⚠️ Session Expired</h1>
          <p>Payment details are lost on refresh. Please restart your booking.</p>
          <Button onClick={() => navigate('/')} variant="danger">Return to Home</Button>
        </div>
      </div>
    );
  }

  const { type, id, title, price, extraData = {} } = state; 
  const displayPrice = price || 0;

  // --- SMART INPUT HANDLERS ---
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Keep only numbers
    setCardNumber(val.slice(0, 16)); // Limit to 16 digits
  };

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setExpiry(val.slice(0, 5));
  };

  const formatCardDisplay = (num) => {
    const padded = num.padEnd(16, '•');
    return padded.match(/.{1,4}/g).join(' ');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) return toast.error("Invalid Card Number");
    
    setLoading(true);

    // Simulated Processing
    setTimeout(async () => {
      try {
        let endpoint = '';
        let payload = extraData;

        if (type === 'event') {
          endpoint = `/events/${id}/register/`;
          payload = { tickets: extraData?.tickets || 1 };
        } else if (type === 'facility') {
          endpoint = `/facilities/${id}/book/`;
        } else if (type === 'parking') {
          endpoint = `/transport/parking/${id}/book/`;
        }

        await api.post(endpoint, payload);
        
        toast.success("💳 Transaction Approved! Your booking is confirmed.");
        navigate('/my-bookings'); 
        
      } catch (err) {
        toast.error(err.response?.data?.error || "Transaction failed.");
      } finally {
        setLoading(false);
      }
    }, 2000); 
  };

  return (
    <div className={styles.container}>
      <div className={styles.paymentWrapper}>
        
        {/* LEFT COL: DIGITAL RECEIPT */}
        <div className={styles.summarySection}>
          <h1 className={styles.pageTitle}>Checkout</h1>
          
          <div className={styles.receiptCard}>
            <div className={styles.receiptRow}>
              <span className={styles.label}>Service</span>
              <span className={styles.value}>{title}</span>
            </div>

            {extraData?.tickets && (
              <div className={styles.receiptRow}>
                <span className={styles.label}>Quantity</span>
                <span className={styles.value}>{extraData.tickets} Ticket(s)</span>
              </div>
            )}
            
            {extraData?.time_slot && (
              <div className={styles.receiptRow}>
                <span className={styles.label}>Reserved Slot</span>
                <span className={styles.value}>{extraData.time_slot}</span>
              </div>
            )}

            <div className={styles.receiptDivider}></div>
            
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Due</span>
              <span className={styles.totalAmount}>₹{displayPrice}</span>
            </div>
          </div>

          <div className={styles.guarantee}>
            <span className={styles.shieldIcon}>🛡️</span>
            <div>
              <strong>Secure Payment</strong>
              <p>Your data is processed via 256-bit SSL encryption.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COL: INTERACTIVE CARD FORM */}
        <div className={styles.formSection}>
          
          {/* THE INTERACTIVE CARD VISUAL */}
          <div className={`${styles.visualCard} ${loading ? styles.cardProcessing : ''}`}>
            <div className={styles.cardHeader}>
              <div className={styles.chip}></div>
              <div className={styles.contactless}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v10h-2V7zm0 12h2v2h-2v-2z"/>
                </svg>
              </div>
            </div>
            
            <div className={styles.cardNumDisplay}>
              {formatCardDisplay(cardNumber)}
            </div>
            
            <div className={styles.cardBottom}>
              <div className={styles.cardInfoGroup}>
                <label>Card Holder</label>
                <div>{cardName || 'FULL NAME'}</div>
              </div>
              <div className={styles.cardInfoGroup}>
                <label>Expires</label>
                <div>{expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className={styles.form}>
            <Input 
              label="Card Number" 
              placeholder="0000 0000 0000 0000" 
              value={cardNumber} 
              onChange={handleCardNumber} 
              required 
            />
            
            <Input 
              label="Cardholder Name" 
              placeholder="AS PRINTED ON CARD" 
              value={cardName} 
              onChange={e => setCardName(e.target.value.toUpperCase())} 
              required 
            />

            <div className={styles.row}>
              <Input 
                label="Expiry Date" 
                placeholder="MM/YY" 
                value={expiry} 
                onChange={handleExpiry} 
                required 
              />
              <Input 
                label="CVV" 
                placeholder="•••" 
                type="password" 
                value={cvv} 
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0,3))} 
                required 
              />
            </div>

            <Button type="submit" disabled={loading} variant="primary" className={styles.payBtn}>
              {loading ? 'Validating...' : `Complete Payment • ₹${displayPrice}`}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;