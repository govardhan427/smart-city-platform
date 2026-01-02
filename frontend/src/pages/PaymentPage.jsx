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

  // If no data passed, go home
  if (!state) {
    navigate('/');
    return null;
  }

  const { type, id, title, price, extraData } = state; 

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // SIMULATE PAYMENT DELAY
    setTimeout(async () => {
      try {
        if (type === 'event') {
          await api.post(`/events/${id}/register/`, { tickets: extraData.tickets });
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

  // Helper to format card number
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

            {extraData.tickets && (
              <>
                <div className={styles.itemLabel}>Quantity</div>
                <div className={styles.itemValue}>{extraData.tickets} Ticket(s)</div>
              </>
            )}
            
            {extraData.vehicle_number && (
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

        {/* RIGHT COL: Form */}
        <div className={styles.formSection}>
          
          {/* VISUAL CREDIT CARD */}
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
                {loading ? 'Processing Transaction...' : `Pay ₹${price}`}
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