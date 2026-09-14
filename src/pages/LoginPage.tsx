import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Shield, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Realistic frontend validations
    if (!email.trim()) {
      setErrorMessage('Please enter your corporate email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please provide a valid email format (e.g. user@company.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await switchDemoUser(role);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setErrorMessage('Enter your email address above to receive password reset instructions.');
      return;
    }
    setForgotSent(true);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Truck className="w-6 h-6" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white font-display">
          NEXUS LOGISTICS
        </h1>
        <p className="mt-1 text-center text-xs text-slate-400">
          Secure Cloud-Native Fleet & Supply Chain Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300 uppercase tracking-wider mb-2">
              <span>Quick Role Demo Switcher</span>
              <span className="text-slate-400 text-[10px]">1-Click Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="demo-admin-login-btn"
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-medium text-center transition-colors disabled:opacity-50"
              >
                Admin
              </button>
              <button
                id="demo-manager-login-btn"
                type="button"
                onClick={() => handleQuickLogin('OPERATIONS_MANAGER')}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-medium text-center transition-colors disabled:opacity-50"
              >
                Manager
              </button>
              <button
                id="demo-customer-login-btn"
                type="button"
                onClick={() => handleQuickLogin('CUSTOMER')}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-medium text-center transition-colors disabled:opacity-50"
              >
                Customer
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {forgotSent && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Password reset instructions dispatched to your verified email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-500"
                />
                <button
                  id="login-toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="login-remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300">Remember this device for 30 days</span>
              </label>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Cloud Badge */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted with Spring Security 6 & JWT HS256</span>
          </div>
        </div>
      </div>
    </div>
  );
};
