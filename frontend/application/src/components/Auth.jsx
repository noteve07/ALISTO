import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), #FDBA74)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Welcome to ALISTO</h2>
        <p className="muted">Sign in to access your personalized dashboard</p>
      </div>

      {error && (
        <div style={{ 
          background: '#FEF2F2', 
          border: '1px solid #FECACA', 
          color: '#DC2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="Enter your email"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn primary"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px',
            fontSize: '16px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>
          Demo Account:
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
          Email: demo@alisto.com<br />
          Password: demo123
        </p>
      </div>
    </div>
  );
};

export const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), #FDBA74)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2"/>
            <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Join ALISTO</h2>
        <p className="muted">Create your account to get personalized alerts</p>
      </div>

      {error && (
        <div style={{ 
          background: '#FEF2F2', 
          border: '1px solid #FECACA', 
          color: '#DC2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="Enter your full name"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            placeholder="Enter your email"
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="Create a password"
              required
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--muted)'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input"
            placeholder="Confirm your password"
            required
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          className="btn primary"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px',
            fontSize: '16px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};
