import React from 'react';
import styles from './Button.module.css';

/**
 * A reusable Glass Button component.
 * @param {string} variant - 'primary', 'success', 'error', 'secondary'
 * @param {string} className - Allows adding external margins/positioning
 */
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button', 
  variant = 'primary',
  className = '' 
}) => {
  
  // Combines:
  // 1. Base Glass Style (.btn)
  // 2. Color Variant (.primary, .success, etc.)
  // 3. External classes passed in (e.g., for margins)
  const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass.trim()}
    >
      {children}
    </button>
  );
};

export default Button;