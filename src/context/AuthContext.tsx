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
        } else if (
          res &&
          (res.teamDeleted ||
            res.message === 'Team not found' ||
            res.message === 'Unauthorized: Team session token required' ||
            res.message === 'Invalid or expired team session')
        ) {
          logoutTeam();
          sessionStorage.setItem('pp_deleted_notice', 'true');
          window.location.href = '/register?reason=deleted';
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

  // Continuous background verification for active team participants:
  // If admin deletes the team in Admin panel, automatically log out and navigate to /register
  useEffect(() => {
    if (!team) return;

    const interval = setInterval(async () => {
      const currentToken = localStorage.getItem('pp_team_token');
      if (!currentToken) return;

      try {
        const res = await api.getMe('team');
        if (
          res &&
          (res.teamDeleted ||
            res.message === 'Team not found' ||
            res.message === 'Unauthorized: Team session token required' ||
            res.message === 'Invalid or expired team session')
        ) {
          logoutTeam();
          sessionStorage.setItem('pp_deleted_notice', 'true');
          window.location.href = '/register?reason=deleted';
        }
      } catch {
        // Network blips ignored
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [team?._id]);

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
