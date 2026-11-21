import React, { useState, useEffect } from 'react';
import { Mountain, Palette, Eye, Sparkles, ArrowRight, User, AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

type BackendStatus = 'checking' | 'online' | 'offline';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const { register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', full_name: '', role: 'designer' });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');

  // Check backend health on mount and every 5 seconds
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        setBackendStatus(res.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backendStatus === 'offline') {
      setError('Backend server is not running. Please start it first (see instructions below).');
      return;
    }
    setError(''); setLoading('login');
    try {
      await login(form.username, form.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally { setLoading(null); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (backendStatus === 'offline') {
      setError('Backend server is not running. Please start it first (see instructions below).');
      return;
    }
    setError(''); setLoading('register');
    try {
      await register({ username: form.username, email: form.email, password: form.password, full_name: form.full_name, role: form.role });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(null); }
  };

  const handleDemo = async (role: 'designer' | 'reviewer') => {
    if (backendStatus === 'offline') {
      setError('Backend server is not running. Please start it first (see instructions below).');
      return;
    }
    setError(''); setLoading(`demo-${role}`);
    try { await demoLogin(role); }
    catch (err: any) { setError(err.message || 'Demo login failed'); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center p-4">

      {/* Backend Status Banner */}
      {backendStatus === 'offline' && (
        <div className="w-full max-w-lg mb-4 bg-red-900/60 border border-red-600 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-300 font-semibold text-sm">
            <WifiOff className="w-4 h-4 shrink-0" />
            Backend server is offline — cannot reach http://localhost:8000
          </div>
          <p className="text-red-200/80 text-xs leading-relaxed">
            Open a new terminal and run:
          </p>
          <code className="text-xs bg-black/40 text-green-300 px-3 py-2 rounded-lg block font-mono whitespace-nowrap overflow-x-auto">
            cd "f:\GENAI PROJECT" &amp;&amp; python -m uvicorn app.main:app --app-dir backend --reload --port 8000
          </code>
          <p className="text-red-200/60 text-xs">Then this banner will disappear automatically.</p>
        </div>
      )}

      {backendStatus === 'online' && (
        <div className="w-full max-w-lg mb-2 bg-emerald-900/40 border border-emerald-700 rounded-xl px-4 py-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-300 text-xs font-medium">Backend connected — http://localhost:8000</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-purple-500 p-3 rounded-2xl">
            <Mountain className="w-10 h-10 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sketch2Park</h1>
            <p className="text-purple-300 text-sm font-medium">AI Theme Park Concept Renderer</p>
          </div>
        </div>
        <p className="text-slate-400 max-w-md text-sm leading-relaxed">
          Transform hand-drawn attraction sketches into photorealistic concept renders using
          ControlNet sketch-guided AI generation with stakeholder review workflows.
        </p>
      </div>

      {/* Features row */}
      <div className="flex gap-6 mb-8">
        {[
          { icon: Palette, label: 'Sketch Upload', color: 'text-blue-400' },
          { icon: Sparkles, label: 'AI Generation', color: 'text-purple-400' },
          { icon: Eye, label: 'Review & Approve', color: 'text-emerald-400' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Auth card */}
      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        {/* Demo Login buttons */}
        <div className="mb-5">
          <p className="text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-widest">
            One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo('designer')}
              disabled={!!loading}
              className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
            >
              {loading === 'demo-designer'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Palette className="w-4 h-4" />}
              Designer
            </button>
            <button
              onClick={() => handleDemo('reviewer')}
              disabled={!!loading}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
            >
              {loading === 'demo-reviewer'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Eye className="w-4 h-4" />}
              Reviewer
            </button>
          </div>
        </div>

        <div className="relative flex items-center my-4">
          <div className="flex-1 border-t border-slate-600" />
          <span className="mx-3 text-xs text-slate-500">or sign in manually</span>
          <div className="flex-1 border-t border-slate-600" />
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-5">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                tab === t ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >{t === 'login' ? 'Sign In' : 'Register'}</button>
          ))}
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-3 py-2 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Backend offline notice inside card */}
        {backendStatus === 'offline' && (
          <div className="bg-amber-900/30 border border-amber-700/50 text-amber-300 text-xs px-3 py-2 rounded-lg mb-4">
            ⚠ Start the backend server to enable login (see red banner above).
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              placeholder="Username or Email"
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition"
            />
            <button
              type="submit"
              disabled={!!loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {loading === 'login'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><ArrowRight className="w-4 h-4" /> Sign In</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <input type="text" placeholder="Full Name" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition" />
            <input type="text" placeholder="Username" required value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition" />
            <input type="email" placeholder="Email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition" />
            <input type="password" placeholder="Password (min 4 chars)" required value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition" />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition">
              <option value="designer">Designer</option>
              <option value="reviewer">Reviewer</option>
            </select>
            <button type="submit" disabled={!!loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              {loading === 'register'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><User className="w-4 h-4" /> Create Account</>}
            </button>
          </form>
        )}

        {/* Hint */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Demo credentials: designer123 / reviewer123
        </p>
      </div>
    </div>
  );
}
