/**
 * API Base URL Configuration:
 * You can configure this in multiple ways:
 * 1. Set VITE_API_BASE_URL in `frontend/.env` (e.g. VITE_API_BASE_URL=http://localhost:5001)
 * 2. Or configure the proxy target in `frontend/vite.config.ts`
 */
const getBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

export const API_BASE = getBaseUrl();

export const getFullImageUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const backendBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return backendBase ? `${backendBase}${cleanPath}` : cleanPath;
};

const getAuthHeaders = (tokenType: 'admin' | 'team' = 'admin') => {
  const token = localStorage.getItem(tokenType === 'admin' ? 'pp_admin_token' : 'pp_team_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  adminLogin: async (credentials: { username: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  teamLogin: async (credentials: { teamId: string; pin: string }) => {
    const res = await fetch(`${API_BASE}/auth/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  getMe: async (tokenType: 'admin' | 'team') => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(tokenType)
    });
    return res.json();
  },

  // Teams
  registerTeam: async (data: any) => {
    const res = await fetch(`${API_BASE}/teams/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAllTeams: async () => {
    const res = await fetch(`${API_BASE}/teams`, {
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  updateTeam: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  approveRejectTeam: async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const res = await fetch(`${API_BASE}/teams/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  deleteTeam: async (id: string) => {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  // Questions
  getQuestions: async (round?: number) => {
    const query = round ? `?round=${round}` : '';
    const res = await fetch(`${API_BASE}/questions${query}`);
    return res.json();
  },

  createQuestion: async (data: any) => {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateQuestion: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteQuestion: async (id: string) => {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  uploadImage: async (formData: FormData) => {
    const token = localStorage.getItem('pp_admin_token');
    const res = await fetch(`${API_BASE}/questions/upload-image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  },

  // Game Control
  getGameState: async () => {
    // Pass admin token if present, else team token if present
    const adminToken = localStorage.getItem('pp_admin_token');
    const teamToken = localStorage.getItem('pp_team_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
    else if (teamToken) headers.Authorization = `Bearer ${teamToken}`;

    const res = await fetch(`${API_BASE}/game/state`, { headers });
    return res.json();
  },

  activateRound: async (round: number) => {
    const res = await fetch(`${API_BASE}/game/round/activate`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify({ round })
    });
    return res.json();
  },

  startQuestion: async (questionNumber: number) => {
    const res = await fetch(`${API_BASE}/game/question/start`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify({ questionNumber })
    });
    return res.json();
  },

  pauseQuestion: async () => {
    const res = await fetch(`${API_BASE}/game/question/pause`, {
      method: 'POST',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  resumeQuestion: async () => {
    const res = await fetch(`${API_BASE}/game/question/resume`, {
      method: 'POST',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  endQuestion: async () => {
    const res = await fetch(`${API_BASE}/game/question/end`, {
      method: 'POST',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  revealAnswer: async () => {
    const res = await fetch(`${API_BASE}/game/question/reveal`, {
      method: 'POST',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  resetCompetition: async () => {
    const res = await fetch(`${API_BASE}/game/reset`, {
      method: 'POST',
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  // Submissions
  submitAnswer: async (questionId: string, answerData: any) => {
    const res = await fetch(`${API_BASE}/submissions/submit`, {
      method: 'POST',
      headers: getAuthHeaders('team'),
      body: JSON.stringify({ questionId, answerData })
    });
    return res.json();
  },

  getMySubmissionStatus: async () => {
    const res = await fetch(`${API_BASE}/submissions/my-status`, {
      headers: getAuthHeaders('team')
    });
    return res.json();
  },

  getQuestionSubmissions: async (questionId: string) => {
    const res = await fetch(`${API_BASE}/submissions/question/${questionId}`, {
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  // Leaderboard
  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return res.json();
  },

  getRoundLeaderboard: async (round: number) => {
    const res = await fetch(`${API_BASE}/leaderboard/round/${round}`);
    return res.json();
  },

  adjustScore: async (data: { teamMongoId: string; round: number; adjustmentPoints: number; reason: string }) => {
    const res = await fetch(`${API_BASE}/leaderboard/adjust`, {
      method: 'POST',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getScoreLedger: async (params?: { teamId?: string; round?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/leaderboard/ledger?${query}`, {
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  updateSettings: async (settings: any) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders('admin'),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (module?: string) => {
    const query = module ? `?module=${module}` : '';
    const res = await fetch(`${API_BASE}/audit${query}`, {
      headers: getAuthHeaders('admin')
    });
    return res.json();
  },

  // Reports download URL generator
  getReportDownloadUrl: (type: string, format: 'csv' | 'xlsx') => {
    const token = localStorage.getItem('pp_admin_token');
    return `${API_BASE}/reports/${type}/${format}?token=${token}`;
  }
};
