import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

// AuthProvider simplificado — autenticação real é feita via localStorage em cada página.
// Este provider apenas fornece um contexto vazio para compatibilidade com App.jsx.
export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      logout: () => {},
      navigateToLogin: () => {},
      checkAppState: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
