import React from 'react';
import styles from './Button.module.css';

/**
 * A reusable Button component.
 * @param {string} variant - 'primary', 'success', 'error', 'secondary'
 */
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  variant = 'primary' 
}) => {
  
  // Combines the base 'btn' class with the variant class (e.g., "btn primary")
  const buttonClass = `${styles.btn} ${styles[variant]}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      {children}
    </button>
  );
};

export default Button;