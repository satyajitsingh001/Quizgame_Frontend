import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { User, Copy, Check, ArrowRight, AlertTriangle, Key, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { api } from '../../services/api';

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeletedNotice, setIsDeletedNotice] = useState<boolean>(() => {
    return (
      window.location.search.includes('reason=deleted') ||
      sessionStorage.getItem('pp_deleted_notice') === 'true'
    );
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const settingsRes = await api.getSettings();
        if (settingsRes.success && settingsRes.settings) {
          setIsRegistrationOpen(settingsRes.settings.isRegistrationOpen ?? true);
        }
      } catch {
        // ignore
      }
    };
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isRegistrationOpen) {
      setErrorMessage('Registration is currently closed by the Admin.');
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your Name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.registerTeam({
        name: trimmedName,
        teamName: trimmedName,
        contactNumber: contactNumber.trim()
      });

      if (res.success && res.team) {
        setSuccessData(res.team);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(res.message || 'Failed to register. Please try another name.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!successData) return;
    const text = `Powering Performance 2026 Credentials:\nLogin ID: ${successData.teamId}\nSecurity PIN: ${successData.pin}\nName: ${successData.teamName}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleRegisterAnother = () => {
    setSuccessData(null);
    setFullName('');
    setContactNumber('');
    setErrorMessage('');
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
            <h1 className="text-2xl sm:text-3xl font-black text-white">Your Login Credentials</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Please save your <strong className="text-white">Login ID</strong> and <strong className="text-white">Security PIN</strong> below. You will need them to log in to participate in the competition.
            </p>
          </div>

          {/* Large High-Contrast Credentials Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-slate-700/80 shadow-inner space-y-5 text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registered Name</span>
              <p className="text-lg font-black text-white">{successData.teamName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">
                  LOGIN ID
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
                  <span>Copy Login ID &amp; PIN to Clipboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-4 px-6 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleRegisterAnother}
              className="w-full py-3 px-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Another User</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD REGISTRATION FORM
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Main Registration Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">User Registration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register to participate and get your instant login credentials
          </p>
        </div>

        {isDeletedNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-200">Account Removed</span>
              Your registration was removed by the administrator. Please register again with your details to participate.
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDeletedNotice(false);
                sessionStorage.removeItem('pp_deleted_notice');
              }}
              className="text-rose-400 hover:text-white font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {!isRegistrationOpen ? (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Registration is Currently Closed</h3>
            <p className="text-sm text-slate-300">
              The competition administrator has closed registrations. If you are already registered, please sign in.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name / Participant Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Participant Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. John Doe / Alex"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Contact Number <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Registering...' : 'Register & Get Login Details'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Already registered? </span>
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
