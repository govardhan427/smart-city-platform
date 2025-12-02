import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './ProfilePage.module.css';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useAuth(); 
  
  // Toggle State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile Data States
  const [username, setUsername] = useState(user.username || '');
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user.email || '');

  // Password Data States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- SAFE AVATAR HELPER ---
  const getAvatarChar = () => {
    if (username && username.length > 0) return username[0].toUpperCase();
    if (email && email.length > 0) return email[0].toUpperCase();
    return "U"; // Default 'U' for User
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile({ 
        username, 
        first_name: firstName, 
        last_name: lastName,
        email 
      });
      
      toast.success("Profile updated successfully!");
      setIsEditing(false); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile. Username might be taken.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success("Password changed successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error("Failed. Check your old password.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>MY PROFILE</h1>
      
      <div className={styles.layout}>
        
        {/* --- LEFT COL: IDENTITY CARD --- */}
        <div className={styles.identitySection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {/* USE THE HELPER FUNCTION HERE */}
              {getAvatarChar()}
            </div>
            <div className={styles.roleBadge}>
              {user.is_staff ? "ADMINISTRATOR" : "CITIZEN"}
            </div>
          </div>
          
          {/* Display Name */}
          <h2 className={styles.displayName}>
            {firstName} {lastName}
          </h2>
          <p className={styles.displayHandle}>@{username || 'unknown'}</p>
        </div>

        {/* --- RIGHT COL: DETAILS & SETTINGS --- */}
        <div className={styles.detailsSection}>
          
          {/* 1. PERSONAL DETAILS CARD */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Personal Details</h3>
              {!isEditing && (
                <button 
                  className={styles.editBtn} 
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              // --- EDIT MODE ---
              <form onSubmit={handleUpdateProfile} className={styles.formFade}>
                <div className={styles.row}>
                  <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <Input label="Email Address" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                
                <div className={styles.actionButtons}>
                  <Button type="submit" disabled={loading} variant="primary">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              // --- VIEW MODE ---
              <div className={styles.viewMode}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Full Name</span>
                  <span className={styles.value}>{firstName || '-'} {lastName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Username</span>
                  <span className={styles.value}>@{username || 'not set'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Account ID</span>
                  <span className={styles.value} style={{fontFamily:'monospace'}}>#{user.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. SECURITY CARD */}
          <div className={styles.card}>
            <h3>Security & Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className={styles.row}>
                <Input 
                  label="Current Password" 
                  type="password" 
                  value={oldPassword} 
                  onChange={e => setOldPassword(e.target.value)} 
                  placeholder="••••••"
                />
                <Input 
                  label="New Password" 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="••••••"
                />
              </div>
              <div style={{marginTop: '1rem'}}>
                 <Button type="submit" variant="secondary">Update Password</Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;