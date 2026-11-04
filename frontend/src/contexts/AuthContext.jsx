import { createContext, useContext, useState } from "react";
import authService from "../features/auth/services/auth-service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("accessToken")
  );

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  async function login(credentials) {
    const response = await authService.login(credentials);

    const accessToken = response.data.token;
    const authenticatedUser = response.data.user;

    if (!accessToken) {
      throw new Error("Login response did not include a token.");
    }

    sessionStorage.setItem("accessToken", accessToken);

    if (authenticatedUser) {
      sessionStorage.setItem("user", JSON.stringify(authenticatedUser));
    }

    setToken(accessToken);
    setUser(authenticatedUser ?? null);

    return authenticatedUser;
  }

  async function register(userData) {
    return authService.register(userData);
  }

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
