import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, GuardProfile } from '../services/auth';
import { syncService } from '../services/sync';

interface AuthContextType {
  user: User | null;
  profile: GuardProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<GuardProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Start network listener for auto-sync
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = syncService.startNetworkListener(() => {
      refreshProfile();
    });

    return unsubscribe;
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const storedUser = await authService.getUser();
        setUser(storedUser);
        setIsAuthenticated(true);

        // Try to get profile from cache first, then from server
        const cached = await authService.getCachedProfile();
        if (cached) {
          setProfile(cached);
        }

        // Try to refresh from server
        try {
          const serverProfile = await authService.getProfile();
          setProfile(serverProfile);
        } catch {
          // Offline - use cached data
        }
      }
    } catch {
      // Not authenticated
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    setUser(result.user);
    setIsAuthenticated(true);

    // Fetch full profile
    try {
      const serverProfile = await authService.getProfile();
      setProfile(serverProfile);
    } catch {
      // Will sync later
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const online = await syncService.isOnline();
      if (online) {
        const serverProfile = await authService.getProfile();
        setProfile(serverProfile);
      } else {
        const cached = await authService.getCachedProfile();
        if (cached) setProfile(cached);
      }
    } catch {
      const cached = await authService.getCachedProfile();
      if (cached) setProfile(cached);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
