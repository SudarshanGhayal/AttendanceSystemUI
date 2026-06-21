import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'SG_token';
const USER_KEY = 'SG_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login(username, password);
      const sessionUser = {
        userId: result.userId,
        fullName: result.fullName,
        username: result.username,
        role: result.role,
      };
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Keep multiple tabs in sync.
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === USER_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}