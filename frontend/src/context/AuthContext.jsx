import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'cine-avenida-auth';

const readStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const AuthContext = createContext({
  auth: null,
  setAuth: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(() => readStorage());

  const setAuth = (nextAuth) => {
    setAuthState(nextAuth);
    if (nextAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setAuth(null);

  const value = useMemo(
    () => ({ auth, setAuth, logout }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
