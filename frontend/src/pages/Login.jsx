import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'LOGIN FAILED. INVALID CREDENTIALS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,33,40,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(30,33,40,0.4)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8 shadow-2xl z-10 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-bold font-mono text-accent tracking-tighter mb-2">{'>'} LOGIN_</h1>
          <p className="text-muted text-sm font-mono tracking-widest">Access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border-l-4 border-danger text-danger text-sm font-mono tracking-wider animate-pulse">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full font-mono text-sm tracking-wider"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@domain.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              required
              className="w-full font-mono text-sm tracking-widest"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent/10 border border-accent text-accent font-bold py-3 rounded-md hover:bg-accent hover:text-base focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base transition-all mt-4 disabled:opacity-50 font-mono tracking-widest uppercase"
          >
            {loading ? 'AUTHENTICATING...' : 'Log in'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted font-mono tracking-wider">
            Don't have an account? <Link to="/signup" className="text-accent underline hover:text-white transition-colors">Sign up now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
