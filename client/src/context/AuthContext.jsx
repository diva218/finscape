import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, login as loginApi, signup as signupApi, updateProfile as updateProfileApi } from "../api/client";

const AuthContext = createContext(null);
const TOKEN_KEY = "finscape_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (_error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function signup(payload) {
    const data = await signupApi(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(payload) {
    const data = await loginApi(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }

  async function refreshProfile() {
    if (!token) return null;
    const profile = await getProfile(token);
    setUser(profile);
    return profile;
  }

  async function updateProfile(payload) {
    if (!token) throw new Error("You must be logged in");
    const profile = await updateProfileApi(payload, token);
    setUser(profile);
    return profile;
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      signup,
      login,
      logout,
      refreshProfile,
      updateProfile
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
