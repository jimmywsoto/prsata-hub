import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState('checking');
  const [isActive, setIsActive] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUser = async (token) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/protected/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(data.user);
      setAuthStatus('authenticated');
      setIsActive(data.user.is_active);

      return true;
    } catch (error) {
      localStorage.removeItem('token');

      setUser(null);
      setAuthStatus('unauthenticated');
      setIsActive(false);
      
      return false;
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthStatus('unauthenticated');
        setIsActive(false);
        return;
      }

      await fetchUser(token);
    };

    verifySession();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);

    return await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');

    setUser(null);
    setAuthStatus('unauthenticated');
    setIsActive(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        login,
        logout,
        isAuthenticated: authStatus === 'authenticated',
        isChecking: authStatus === 'checking',
        isActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);