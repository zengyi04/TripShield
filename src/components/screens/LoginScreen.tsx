import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Check } from 'lucide-react';
import { ActiveScreen } from '../../types';

interface LoginScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  topColor: string;
  bottomColor: string;
  buttonBg: string;
  buttonHover: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigate,
  topColor,
  bottomColor,
  buttonBg,
  buttonHover,
}) => {
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onNavigate('home');
    }, 700);
  };

  return (
    <div className="w-full h-full flex flex-col select-none" id="login-screen">
      {/* Top Section */}
      <div
        className="w-full pt-4 pb-6 px-6 flex items-center justify-between transition-colors duration-300"
        style={{ backgroundColor: topColor }}
      >
        <button
          onClick={() => onNavigate('welcome')}
          id="login-back-btn"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-md text-slate-800 hover:bg-white/50 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-slate-800 font-bold text-sm tracking-wide uppercase opacity-80">
          Sign In
        </span>
        <div className="w-10" />
      </div>

      {/* Bottom Section */}
      <div
        className="flex-1 rounded-t-[38px] px-8 pt-7 pb-8 flex flex-col justify-between transition-colors duration-300"
        style={{ backgroundColor: bottomColor }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={18} className="text-white/80" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back
            </h2>
          </div>
          <p className="text-white/80 text-sm mb-6">
            Enter your credentials to manage your journeys.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert('Password reset link sent to ' + email);
                  }}
                  className="text-xs text-white/75 hover:text-white underline underline-offset-2"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="w-full mt-4 py-3.5 px-6 rounded-2xl font-bold text-white text-[15px] transition-all duration-200 transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: buttonBg,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = buttonHover;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = buttonBg;
              }}
            >
              {isSuccess ? (
                <>
                  <Check size={18} /> Authenticated!
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="text-center pt-4">
          <p className="text-white/80 text-xs">
            New to Voya?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-white font-bold underline underline-offset-2 ml-1 cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
