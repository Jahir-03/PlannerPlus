import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, UserCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('aravind_k@srmist.edu.in');
  const [password, setPassword] = useState('alohomora2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  const fillDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('alohomora2026');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 relative z-10 border-amber-500/30 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-900 to-amber-400 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading gold-gradient-text">
            DSA ECOSYSTEM
          </h2>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Directorate of Student Affairs Portal
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              University Email / NetID
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="user@srmist.edu.in"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/90 border border-amber-500/20 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        {/* Demo Quick Login Presets */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Quick Demo Presets
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => fillDemoUser('director.dsa@srmist.edu.in')}
              className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-amber-500/20 rounded text-[11px] text-amber-300 flex flex-col items-center space-y-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>DSA Director</span>
            </button>
            <button
              onClick={() => fillDemoUser('cultural_sec@srmist.edu.in')}
              className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-amber-500/20 rounded text-[11px] text-amber-300 flex flex-col items-center space-y-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cultural Sec</span>
            </button>
            <button
              onClick={() => fillDemoUser('aravind_k@srmist.edu.in')}
              className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-amber-500/20 rounded text-[11px] text-amber-300 flex flex-col items-center space-y-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Convenor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
