import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop';

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSwitchMode }) => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        (mode === 'login' ? 'Failed to log in. Please try again.' : 'Failed to register. Please try again.');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setError(null);
    onSwitchMode(next);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {/* Left: brand / image panel */}
        <div className="auth-visual">
          <img
            className="auth-visual-img"
            src={HERO_IMAGE}
            alt="Misty mountain landscape"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <div className="auth-visual-brand">
              <span className="auth-visual-mark">IG</span>
              <span className="auth-visual-name">The Interactive Gallery</span>
            </div>
            <blockquote className="auth-visual-quote">
              &ldquo;Discover exceptional imagery from the world&rsquo;s finest photographers.&rdquo;
            </blockquote>
            <div className="auth-visual-stats">
              <div className="auth-stat">
                <span className="auth-stat-value">3M+</span>
                <span className="auth-stat-label">Photos</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-value">Free</span>
                <span className="auth-stat-label">To join</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-stat">
                <span className="auth-stat-value">HD</span>
                <span className="auth-stat-label">Downloads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="auth-panel">
          {/* Mode tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-heading">
            <h2 className="auth-title">
              {mode === 'login' ? 'Welcome back' : 'Join the gallery'}
            </h2>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Sign in to continue your visual journey.'
                : 'Create a free account to comment, save favorites, and more.'}
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span className="auth-error-icon">!</span>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span className="auth-field-label">Username</span>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    minLength={3}
                    required
                    autoFocus
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span className="auth-field-label">Email</span>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus={mode === 'login'}
                />
              </div>
            </label>

            <label className="auth-field">
              <span className="auth-field-label">Password</span>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {mode === 'register' && password.length > 0 && (
                <div className="auth-password-hint">
                  <div className={`auth-strength-bar ${password.length >= 10 ? 'strength-strong' : password.length >= 6 ? 'strength-ok' : 'strength-weak'}`} />
                  <span className="auth-strength-label">
                    {password.length >= 10 ? 'Strong' : password.length >= 6 ? 'Good' : 'Too short'}
                  </span>
                </div>
              )}
            </label>

            <div className="auth-actions">
              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? (
                  <span className="auth-spinner" />
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
              <button type="button" className="auth-cancel" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                New to the gallery?{' '}
                <button className="auth-switch-btn" onClick={() => switchMode('register')}>
                  Create a free account
                </button>
              </>
            ) : (
              <>
                Already a member?{' '}
                <button className="auth-switch-btn" onClick={() => switchMode('login')}>
                  Sign in instead
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
