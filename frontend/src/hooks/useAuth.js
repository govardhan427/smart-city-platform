import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * A custom hook to easily access the AuthContext.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const hasRole = (roleName) => {
    if (!context.user) return false;
    // Superuser (is_staff) implies access to everything in this simple MVP
    // OR check if the specific role exists in their groups
    return context.user.is_staff && (context.user.groups.includes(roleName) || context.user.groups.length === 0);
  };
  return { ...context, hasRole };;
};

export default useAuth;