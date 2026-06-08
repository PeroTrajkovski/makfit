import React from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { AuthModeType } from '../types';

interface Props {
  authMode: AuthModeType;
  setAuthMode: (m: AuthModeType) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  loading: boolean;
  authError: string | null;
  handleAuth: () => void;
  handleGoogleAuth: () => void;
}

export default function AuthView({
  authMode, setAuthMode,
  email, setEmail,
  password, setPassword,
  firstName, setFirstName,
  lastName, setLastName,
  showPassword, setShowPassword,
  loading, authError,
  handleAuth, handleGoogleAuth,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white p-6 pt-10 safe-area-pt flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Activity size={40} className="text-black" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">МакФит</h1>
        <p className="text-zinc-400">Твојот личен фитнес асистент</p>
      </div>

      <div className="space-y-4">
        {authMode === 'register' && (
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Име" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input placeholder="Презиме" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
        )}
        <Input placeholder="Е-пошта" value={email} onChange={e => setEmail(e.target.value)} />
        {authMode === 'login' && (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Лозинка"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        )}
        <Button onClick={handleAuth} className="bg-emerald-500 text-black mt-4" disabled={loading}>
          {authMode === 'login' ? 'Најави се' : 'Продолжи'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-zinc-500 tracking-widest">Или</span>
          </div>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Продолжи со Google
        </button>

        <button
          onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); }}
          className="w-full text-zinc-400 text-sm py-2"
        >
          {authMode === 'login' ? 'Немаш профил? Регистрирај се' : 'Веќе имаш профил? Најави се'}
        </button>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center"
          >
            {authError}
          </motion.div>
        )}
      </div>
    </div>
  );
}
