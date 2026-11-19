import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/common/Navbar';

// Participant Views
import { Home } from './pages/Home';
import { RegistrationForm } from './components/participant/RegistrationForm';
import { TeamLogin } from './components/participant/TeamLogin';
import { TeamLobby } from './components/participant/TeamLobby';
import { ParticipantLeaderboard } from './components/participant/ParticipantLeaderboard';

// Admin Views
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './pages/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LiveControlRoom } from './components/admin/LiveControlRoom';
import { TeamManagement } from './components/admin/TeamManagement';
import { QuestionBank } from './components/admin/QuestionBank';
import { CompetitionSettingsView } from './components/admin/CompetitionSettings';

export function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public / Participant Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/login" element={<TeamLogin />} />
                <Route path="/portal" element={<TeamLobby />} />
                <Route path="/leaderboard" element={<ParticipantLeaderboard />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="control" element={<LiveControlRoom />} />
                  <Route path="teams" element={<TeamManagement />} />
                  <Route path="questions" element={<QuestionBank />} />
                  <Route path="settings" element={<CompetitionSettingsView />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
