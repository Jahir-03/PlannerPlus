import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, KeyRound, Eye, EyeOff, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';

interface DemoAccount {
  label: string;
  role: string;
  email: string;
  pass: string;
  icon: string;
  badgeClass: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Super Admin (Omni)',
    role: 'Full System Control & All 33 Orgs',
    email: 'admin@srmist.edu.in',
    pass: 'admin123',
    icon: '👑',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Director DSA',
    role: 'Final Executive Approvals',
    email: 'director.dsa@srmist.edu.in',
    pass: 'alohomora2026',
    icon: '🏛️',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  {
    label: 'Cultural Secretary',
    role: 'Overall Event Coordination',
    email: 'cultural_sec@srmist.edu.in',
    pass: 'alohomora2026',
    icon: '🎭',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Music Club Convenor',
    role: 'Multi-Role (Club + Social Media)',
    email: 'aravind_k@srmist.edu.in',
    pass: 'alohomora2026',
    icon: '🎸',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeLogin = async (usr: string, pass: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(username, password);
  };

  const handleQuickLogin = (account: DemoAccount) => {
    setUsername(account.email);
    setPassword(account.pass);
    executeLogin(account.email, account.pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
            DSA ECOSYSTEM
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
            Directorate of Student Affairs Portal
          </p>
          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
            <Smartphone className="w-3 h-3 text-blue-600" />
            <span>Mobile & Desktop Universal Access</span>
          </div>
        </div>

        {/* 1-Tap Quick Demo Personas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Instant Mobile Demo Login</span>
            <span className="text-[10px] text-slate-400 font-normal">Tap to sign in</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(account)}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${account.badgeClass} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{account.icon}</span>
                  <span className="text-[9px] font-mono font-bold opacity-80 uppercase">Tap In</span>
                </div>
                <div className="mt-1">
                  <div className="text-xs font-bold leading-tight truncate">{account.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{account.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-mono">Or Manual Credentials</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
              placeholder="e.g. admin@srmist.edu.in"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-3.5 pr-10 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In with Credentials'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
