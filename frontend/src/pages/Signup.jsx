import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    country: ''
  });
  const [countries, setCountries] = useState([]);
  const [detectedCurrency, setDetectedCurrency] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch countries
    axios.get('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(res => {
        const sorted = res.data.sort((a,b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      })
      .catch(err => console.error("Failed to fetch countries", err));
  }, []);

  const handleCountryChange = (e) => {
    const selectedCountryName = e.target.value;
    setFormData({ ...formData, country: selectedCountryName });
    
    if (selectedCountryName) {
      const countryObj = countries.find(c => c.name.common === selectedCountryName);
      if (countryObj && countryObj.currencies) {
        const currCodes = Object.keys(countryObj.currencies);
        const currName = countryObj.currencies[currCodes[0]].name;
        const currSymbol = countryObj.currencies[currCodes[0]].symbol;
        setDetectedCurrency(`${currCodes[0]} (${currSymbol}) - ${currName}`);
      } else {
        setDetectedCurrency('Unknown');
      }
    } else {
      setDetectedCurrency('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'SYSTEM INITIALIZATION FAILED. VERIFY PARAMETERS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,33,40,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(30,33,40,0.4)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-surface border border-border rounded-lg p-8 shadow-2xl z-10 relative mt-10 mb-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>
        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-bold font-mono text-accent tracking-tighter mb-2">{'>'} INIT_ORG_</h1>
          <p className="text-muted text-sm font-mono tracking-widest">Register your company</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border-l-4 border-danger text-danger text-sm font-mono tracking-wider animate-pulse">
            [ERROR] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" required
                className="w-full font-mono text-sm tracking-wider"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" required
                className="w-full font-mono text-sm tracking-wider"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="admin@corp.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Company Name</label>
            <input 
              type="text" required
              className="w-full font-mono text-sm tracking-wider"
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Country</label>
            <select 
              required
              className="w-full font-mono text-sm tracking-wider bg-surface border-border text-primary"
              value={formData.country}
              onChange={handleCountryChange}
            >
              <option value="">-- SELECT_REGION --</option>
              {countries.map(c => (
                <option key={c.name.common} value={c.name.common}>{c.name.common}</option>
              ))}
            </select>
          </div>

          {detectedCurrency && (
            <div className="p-3 border border-border bg-surface rounded flex items-center justify-between shadow-inner">
              <span className="text-xs font-mono text-muted tracking-widest">Default Currency</span>
              <span className="text-sm font-mono text-accent font-bold tracking-widest">{detectedCurrency}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Password</label>
            <input 
              type="password" required minLength="6"
              className="w-full font-mono text-sm tracking-widest"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-accent/10 border border-accent text-accent font-bold py-3 rounded-md hover:bg-accent hover:text-base focus:ring-2 focus:ring-accent transition-all mt-4 disabled:opacity-50 font-mono tracking-widest uppercase"
          >
            {loading ? 'INITIALIZING...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted font-mono tracking-wider">
            Already have an account? <Link to="/login" className="text-accent underline hover:text-white transition-colors">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
