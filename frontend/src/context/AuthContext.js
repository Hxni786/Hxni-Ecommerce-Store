import React, { createContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken, clearCart } from '../services/storage';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await getAuthToken();
      } catch (e) {
        // Restoring token failed
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    userToken,
    isLoading,
    signIn: async (email, password) => {
      const res = await loginUser(email, password);
      // Backend returns { token, data, message }
      await setAuthToken(res.token);
      setUserToken(res.token);
    },
    signUp: async (email, password) => {
      const res = await registerUser(email, password);
      await setAuthToken(res.token);
      setUserToken(res.token);
    },
    signOut: async () => {
      await removeAuthToken();
      await clearCart(); // Reset cart on sign out
      setUserToken(null);
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
