import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Team } from '../types';

interface AuthContextType {
  admin: any | null;
  team: Team | null;
  role: 'ADMIN' | 'TEAM' | null;
  isLoading: boolean;
  loginAdmin: (credentials: { username: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  loginTeam: (credentials: { teamId: string; pin: string }) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  logoutTeam: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('pp_admin_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [team, setTeam] = useState<Team | null>(() => {
    try {
      const saved = localStorage.getItem('pp_team_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Start isLoading as false if we already have local session data, preventing any reload flicker/redirect
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasAdmin = !!localStorage.getItem('pp_admin_token');
    const hasTeam = !!localStorage.getItem('pp_team_token');
    return false;
  });

  const role: 'ADMIN' | 'TEAM' | null = admin ? 'ADMIN' : team ? 'TEAM' : null;

  const refreshMe = async () => {
    try {
      const adminToken = localStorage.getItem('pp_admin_token');
      const teamToken = localStorage.getItem('pp_team_token');

      if (adminToken) {
        const res = await api.getMe('admin');
        if (res && res.user) {
          setAdmin(res.user);
          localStorage.setItem('pp_admin_data', JSON.stringify(res.user));
        }
        // Never auto-logout on browser refresh or temporary network issues
      } else if (teamToken) {
        const res = await api.getMe('team');
        if (res && res.team) {
          setTeam(res.team);
          localStorage.setItem('pp_team_data', JSON.stringify(res.team));
        }
      }
    } catch (err) {
      console.warn('[Auth] Background session check skipped:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const loginAdmin = async (credentials: { username: string; password: string }) => {
    try {
      const res = await api.adminLogin(credentials);
      if (res.success && res.token) {
        localStorage.setItem('pp_admin_token', res.token);
        localStorage.setItem('pp_admin_data', JSON.stringify(res.admin));
        setAdmin(res.admin);
        // Clean out team if any
        localStorage.removeItem('pp_team_token');
        localStorage.removeItem('pp_team_data');
        setTeam(null);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const loginTeam = async (credentials: { teamId: string; pin: string }) => {
    try {
      const res = await api.teamLogin(credentials);
      if (res.success && res.token) {
        localStorage.setItem('pp_team_token', res.token);
        localStorage.setItem('pp_team_data', JSON.stringify(res.team));
        setTeam(res.team);
        // Clean out admin if any
        localStorage.removeItem('pp_admin_token');
        localStorage.removeItem('pp_admin_data');
        setAdmin(null);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('pp_admin_token');
    localStorage.removeItem('pp_admin_data');
    setAdmin(null);
  };

  const logoutTeam = () => {
    localStorage.removeItem('pp_team_token');
    localStorage.removeItem('pp_team_data');
    setTeam(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        team,
        role,
        isLoading,
        loginAdmin,
        loginTeam,
        logoutAdmin,
        logoutTeam,
        refreshMe
      }}
    >
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
