import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './ProfilePage.module.css'; // We'll create this next

const ProfilePage = () => {
  const { user, logout } = useAuth(); // We can get basic info from context
  
  // State for Profile Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);

  // State for Password Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authService.updateProfile({ first_name: firstName, last_name: lastName });
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Update failed.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPassMsg({ type: 'success', text: 'Password changed!' });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Failed. Check old password.' });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Settings</h1>
      
      {/* 1. Identity Card */}
      <div className={styles.identityCard}>
        <div className={styles.avatar}>
          {user.email[0].toUpperCase()}
        </div>
        <div>
          <h2 className={styles.email}>{user.email}</h2>
          <span className={user.is_staff ? styles.tagAdmin : styles.tagUser}>
            {user.is_staff ? "ADMINISTRATOR" : "CITIZEN"}
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* 2. Edit Details */}
        <div className={styles.card}>
          <h3>Update Profile</h3>
          {profileMsg && <p className={styles[profileMsg.type]}>{profileMsg.text}</p>}
          <form onSubmit={handleUpdateProfile}>
            <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            <div style={{marginTop: '1rem'}}>
               <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>

        {/* 3. Change Password */}
        <div className={styles.card}>
          <h3>Change Password</h3>
          {passMsg && <p className={styles[passMsg.type]}>{passMsg.text}</p>}
          <form onSubmit={handleChangePassword}>
            <Input label="Current Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
            <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div style={{marginTop: '1rem'}}>
               <Button type="submit" variant="secondary">Update Password</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;