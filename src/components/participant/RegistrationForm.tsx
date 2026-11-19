import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Users, UserCheck, Copy, Check, ArrowRight, AlertTriangle, Key, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['', '', '', '', '']);
  const [captainIndex, setCaptainIndex] = useState<number>(0);
  const [contactNumber, setContactNumber] = useState('');
  
  const [registeredTeamsCount, setRegisteredTeamsCount] = useState<number>(0);
  const [maxTeams, setMaxTeams] = useState<number>(20);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    // Fetch settings and current team count
    const loadStats = async () => {
      try {
        const settingsRes = await api.getSettings();
        if (settingsRes.success && settingsRes.settings) {
          setIsRegistrationOpen(settingsRes.settings.isRegistrationOpen);
          setMaxTeams(settingsRes.settings.maxTeams || 20);
        }
        const teamsRes = await api.getAllTeams();
        if (teamsRes.success) {
          setRegisteredTeamsCount(teamsRes.count || 0);
        }
      } catch {
        // ignore
      }
    };
    loadStats();
  }, []);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isRegistrationOpen) {
      setErrorMessage('Registration is currently closed by the Admin.');
      return;
    }

    if (!teamName.trim()) {
      setErrorMessage('Please enter a unique Team Name.');
      return;
    }

    const emptyMemberIdx = members.findIndex(m => !m.trim());
    if (emptyMemberIdx !== -1) {
      setErrorMessage(`Please enter the name for Member ${emptyMemberIdx + 1}. Exactly 5 members required.`);
      return;
    }

    const captainName = members[captainIndex]?.trim();
    if (!captainName) {
      setErrorMessage('Please select one of the members as Team Captain.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.registerTeam({
        teamName: teamName.trim(),
        members: members.map(m => m.trim()),
        captainName,
        contactNumber: contactNumber.trim()
      });

      if (res.success && res.team) {
        setSuccessData(res.team);
        // Fire confetti on registration success
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(res.message || 'Failed to register team.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!successData) return;
    const text = `Powering Performance 2026 Team Credentials:\nTeam ID: ${successData.teamId}\nSecurity PIN: ${successData.pin}\nTeam Name: ${successData.teamName}\nCaptain: ${successData.captainName}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // IF REGISTRATION SUCCEEDED: Display prominent credentials directly on page
  if (successData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border-2 border-emerald-500/50 shadow-2xl space-y-6 text-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Check className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-1">
              🎉 REGISTRATION SUCCESSFUL
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Your Team Credentials</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Please write down or save your <strong className="text-white">Team ID</strong> and <strong className="text-white">Security PIN</strong> below. You will need them to sign in and participate in all 3 competition rounds.
            </p>
          </div>

          {/* Large High-Contrast Credentials Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-slate-700/80 shadow-inner space-y-5 text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registered Team Name</span>
              <p className="text-lg font-black text-white">{successData.teamName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">
                  TEAM ID
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300">
                  {successData.teamId}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-0.5">
                  SECURITY PIN
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-indigo-300">
                  {successData.pin}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Nominated Captain:</span>
              <span className="font-bold text-amber-400">{successData.captainName}</span>
            </div>

            {successData.members && (
              <div className="pt-1 text-xs text-slate-400">
                <span className="block mb-1 font-semibold text-slate-300">5 Registered Members:</span>
                <span className="text-[11px] text-slate-400">
                  {successData.members.map((m: any) => m.name || m).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={copyCredentials}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Credentials Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Team ID &amp; PIN to Clipboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-4 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Proceed to Team Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD REGISTRATION FORM
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Registration Capacity Indicator */}
      <div className="glass-card p-4 rounded-2xl mb-6 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Competition Capacity</span>
          <p className="text-lg font-black text-white">
            {registeredTeamsCount} <span className="text-sm font-normal text-slate-400">/ {maxTeams} Teams Registered</span>
          </p>
        </div>
        <div>
          {isRegistrationOpen ? (
            <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● Registration Open
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              ✕ Registration Closed
            </span>
          )}
        </div>
      </div>

      {/* Main Registration Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Team Registration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register your 5-member team &amp; nominate your team captain
          </p>
        </div>

        {!isRegistrationOpen ? (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Registration is Currently Closed</h3>
            <p className="text-sm text-slate-300">
              The competition administrator has closed new team registrations. If your team is already registered, please sign in.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
            >
              Go to Team Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Team Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Zero Defect Champions"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 5 Members and Captain Nomination */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  5 Team Members <span className="text-red-400">*</span>
                </label>
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Select one as Captain
                </span>
              </div>

              {members.map((memberName, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    captainIndex === idx
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={e => handleMemberChange(idx, e.target.value)}
                    placeholder={`Member ${idx + 1} Full Name`}
                    className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0">
                    <input
                      type="radio"
                      name="captainRadio"
                      checked={captainIndex === idx}
                      onChange={() => setCaptainIndex(idx)}
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className={captainIndex === idx ? 'text-amber-400' : 'text-slate-500'}>
                      Captain
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Team Lead / Captain Contact Number <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Registering Team...' : 'Register Team & Generate Credentials'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Already registered your team? </span>
              <Link to="/login" className="text-xs font-bold text-indigo-400 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
