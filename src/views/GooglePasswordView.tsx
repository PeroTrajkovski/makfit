import React from 'react';
import { Activity, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

interface Props {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  loading: boolean;
  authError: string | null;
  handleSetGooglePassword: () => void;
  handleLogout: () => void;
}

export default function GooglePasswordView({
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  loading, authError,
  handleSetGooglePassword, handleLogout,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white p-6 pt-10 safe-area-pt flex flex-col justify-center max-w-md mx-auto">
      <button
        onClick={handleLogout}
        className="absolute top-10 left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronLeft size={18} />
        <span className="text-sm font-medium">Назад</span>
      </button>
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Activity size={40} className="text-black" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Постави лозинка</h2>
        <p className="text-zinc-400">За поголема безбедност, постави лозинка за твојот профил.</p>
      </div>

      <div className="space-y-4">
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
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Потврди лозинка"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button onClick={handleSetGooglePassword} className="bg-emerald-500 text-black mt-4" disabled={loading}>
          Продолжи
        </Button>

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
