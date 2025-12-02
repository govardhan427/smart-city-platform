import React, { useState } from 'react';
import styles from './Input.module.css';

const Input = ({ label, id, type = 'text', value, onChange, required, placeholder, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Determine if we need the toggle feature
  const isPassword = type === 'password';
  
  // Dynamic type: if showing password, switch to 'text', else use original 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={styles.inputGroup}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      
      <div className={styles.wrapper}>
        <input
          type={inputType}
          id={id}
          className={styles.input}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          {...props}
        />
        
        {/* Toggle Button (Only for password fields) */}
        {isPassword && (
          <button 
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1" // Prevent tab focus
          >
            {showPassword ? (
              // Eye Open Icon (SVG)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            ) : (
              // Eye Closed Icon (SVG)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;