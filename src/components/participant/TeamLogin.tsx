import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeamLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginTeam, role } = useAuth();
  const [teamId, setTeamId] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-redirect if already logged in as Team
  useEffect(() => {
    if (role === 'TEAM') {
      navigate('/portal', { replace: true });
    }
  }, [role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!teamId.trim() || !pin.trim()) {
      setErrorMsg('Please enter both Team ID and PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginTeam({ teamId: teamId.trim(), pin: pin.trim() });
      if (res.success) {
        navigate('/portal');
      } else {
        setErrorMsg(res.message || 'Invalid Team ID or PIN');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Participant Login</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your registered Login ID and 4-digit PIN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Login ID
            </label>
            <input
              type="text"
              required
              value={teamId}
              onChange={e => setTeamId(e.target.value.toUpperCase())}
              placeholder="e.g. PP-01"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              required
              maxLength={8}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Enter Competition Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-800">
          <span className="text-xs text-slate-400">Need to register your team? </span>
          <Link to="/register" className="text-xs font-bold text-indigo-400 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
