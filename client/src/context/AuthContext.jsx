import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ttm_user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('ttm_user', JSON.stringify(user));
  }, [user]);

  const login = async ({ email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    setUser({ email, name: 'Team Member' });
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
