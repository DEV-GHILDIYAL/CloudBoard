import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase, isMocked } from '../lib/supabaseClient';
import { Layout, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear inputs and errors on route change
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
        } else if (data?.user) {
          setSuccess('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message);
        } else if (data?.session) {
          setSuccess('Logged in successfully! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative px-6 overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 z-10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-2 rounded-xl">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              CloudBoard
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
            {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Your Free Account'}
          </h2>
          <p className="text-sm text-slate-400">
            {mode === 'login'
              ? 'Welcome back! Enter your details to continue.'
              : 'Start diagramming cloud architectures in seconds.'}
          </p>
        </div>

        {/* Warning Badge for Mock Client */}
        {isMocked && (
          <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Running in Sandbox Mode</span>
              Supabase connection keys are not configured. Data is saved securely in your local browser storage.
            </div>
          </div>
        )}

        {/* Alert Banners */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-3 text-xs text-rose-350 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-450 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-350 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-650/20 flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
            ) : mode === 'login' ? (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Link Footer */}
        <div className="border-t border-slate-850 pt-4 text-center text-xs">
          {mode === 'login' ? (
            <p className="text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-350 font-semibold">
                Sign up for free
              </Link>
            </p>
          ) : (
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-350 font-semibold">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
