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

export const GLOBAL_SUPERUSER_SCOPE: UserMembership = {
  orgId: 'GLOBAL_ADMIN',
  orgName: 'Directorate of Student Affairs (Omni-Scope)',
  orgCode: 'DSA_OMNI',
  orgType: 'CORE_DOMAIN',
  role: 'DIRECTOR',
  title: 'System Administrator (All Roles & Full Access)',
};

export function isUserSuperAdmin(u: User | null): boolean {
  if (!u) return false;
  return (
    u.email === 'admin@srmist.edu.in' ||
    u.studentId === 'admin' ||
    u.memberships?.some((m) => ['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF'].includes(m.role))
  );
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  activeMembership: UserMembership | null;
  setActiveMembership: (membership: UserMembership | null) => void;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoading: boolean;
  isSuperUser: boolean;
  isGlobalAdminScope: boolean;
  availableScopes: UserMembership[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeMembership, setActiveMembershipState] = useState<UserMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperUser = isUserSuperAdmin(user);

  // Compute all available scopes for this user (with Global Scope for Superuser)
  const availableScopes: UserMembership[] = React.useMemo(() => {
    const list: UserMembership[] = [];
    if (isSuperUser) {
      list.push(GLOBAL_SUPERUSER_SCOPE);
    }
    if (user?.memberships) {
      user.memberships.forEach((m) => {
        if (!list.some((existing) => existing.orgId === m.orgId)) {
          list.push(m);
        }
      });
    }
    return list;
  }, [user, isSuperUser]);

  const setActiveMembership = (membership: UserMembership | null) => {
    setActiveMembershipState(membership);
    if (membership) {
      localStorage.setItem('dsa_active_scope', JSON.stringify(membership));
    } else {
      localStorage.removeItem('dsa_active_scope');
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('dsa_access_token');
    const savedUser = localStorage.getItem('dsa_user_data');
    const savedScope = localStorage.getItem('dsa_active_scope');

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        setAccessToken(savedToken);

        const isSuper = isUserSuperAdmin(parsedUser);

        if (savedScope) {
          try {
            setActiveMembershipState(JSON.parse(savedScope));
          } catch {
            setActiveMembershipState(isSuper ? GLOBAL_SUPERUSER_SCOPE : parsedUser.memberships?.[0] || null);
          }
        } else {
          setActiveMembershipState(isSuper ? GLOBAL_SUPERUSER_SCOPE : parsedUser.memberships?.[0] || null);
        }
      } catch (e) {
        localStorage.removeItem('dsa_access_token');
        localStorage.removeItem('dsa_user_data');
        localStorage.removeItem('dsa_active_scope');
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

    const isSuper = isUserSuperAdmin(userData);
    const initialScope = isSuper ? GLOBAL_SUPERUSER_SCOPE : userData.memberships?.[0] || null;
    setActiveMembership(initialScope);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setActiveMembership(null);
    localStorage.removeItem('dsa_access_token');
    localStorage.removeItem('dsa_refresh_token');
    localStorage.removeItem('dsa_user_data');
    localStorage.removeItem('dsa_active_scope');
  };

  const isGlobalAdminScope = isSuperUser && (activeMembership?.orgId === 'GLOBAL_ADMIN' || !activeMembership);

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
        isSuperUser,
        isGlobalAdminScope,
        availableScopes,
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
