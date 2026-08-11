import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserMembership {
  id?: string;
  orgId: string;
  orgName: string;
  orgCode: string;
  orgType: string;
  role: string;
  title?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId?: string;
  college?: string;
  avatarUrl?: string;
  memberships: UserMembership[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  activeMembership: UserMembership | null;
  setActiveMembership: (membership: UserMembership | null) => void;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeMembership, setActiveMembership] = useState<UserMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dsa_access_token');
    const savedUser = localStorage.getItem('dsa_user_data');

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        setAccessToken(savedToken);
        if (parsedUser.memberships && parsedUser.memberships.length > 0) {
          setActiveMembership(parsedUser.memberships[0]);
        }
      } catch (e) {
        localStorage.removeItem('dsa_access_token');
        localStorage.removeItem('dsa_user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string, refreshToken: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('dsa_access_token', token);
    localStorage.setItem('dsa_refresh_token', refreshToken);
    localStorage.setItem('dsa_user_data', JSON.stringify(userData));

    if (userData.memberships && userData.memberships.length > 0) {
      setActiveMembership(userData.memberships[0]);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setActiveMembership(null);
    localStorage.removeItem('dsa_access_token');
    localStorage.removeItem('dsa_refresh_token');
    localStorage.removeItem('dsa_user_data');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        activeMembership,
        setActiveMembership,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
