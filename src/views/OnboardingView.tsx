import React, { useEffect, useRef, useState } from 'react';
import { Activity, ChevronLeft, Plus, User as UserIcon, Eye, EyeOff, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { cn } from '../utils/cn';
import type { Profile, OnboardingData, ViewType, AuthModeType } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface Props {
  user: FirebaseUser | null;
  profile: Profile | null;
  authMode: AuthModeType;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;
  cancelEditProfile: () => void;
  onboardingStep: number;
  setOnboardingStep: (v: number | ((prev: number) => number)) => void;
  onboardingData: OnboardingData;
  setOnboardingData: (v: OnboardingData | ((prev: OnboardingData) => OnboardingData)) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
  needsPasswordSetup: boolean;
  loading: boolean;
  authError: string | null;
  handleOnboarding: () => void;
  handleLogout: () => void;
  handleDeleteAccount: () => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setView: (v: ViewType) => void;
}

export default function OnboardingView({
  user, profile, authMode,
  firstName, setFirstName, lastName, setLastName,
  isEditingProfile, setIsEditingProfile, cancelEditProfile,
  onboardingStep, setOnboardingStep,
  onboardingData, setOnboardingData,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword,
  needsPasswordSetup,
  loading, authError,
  handleOnboarding, handleLogout, handleDeleteAccount, handleImageUpload, setView,
}: Props) {

  const [nameError, setNameError] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingProfile) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isEditingProfile]);

  useEffect(() => {
    if (showImagePicker || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showImagePicker, showDeleteConfirm]);

  const steps = [
    {
      title: 'Здраво ' + (profile?.firstName || firstName || ''),
      subtitle: 'Следните неколку прашања ќе ја персонализираат вашата велнес програма.',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20">
            <Activity size={64} className="text-black" />
          </div>
        </div>
      ),
    },
    {
      title: 'Пол',
      subtitle: 'Со кој пол се идентификувате?',
      content: (
        <div className="space-y-4">
          {['male', 'female'].map(g => (
            <button
              key={g}
              onClick={() => setOnboardingData({ ...onboardingData, gender: g })}
              className={cn(
                'w-full py-6 rounded-2xl border-2 transition-all text-lg font-medium',
                onboardingData.gender === g ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400',
              )}
            >
              {g === 'male' ? 'Машко' : 'Женско'}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Висина',
      subtitle: 'Колку сте високи?',
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex items-baseline justify-center">
            <input
              type="number"
              value={onboardingData.height}
              onChange={e => setOnboardingData({ ...onboardingData, height: Number(e.target.value) })}
              className="bg-transparent border-none text-6xl font-bold tracking-tighter text-center focus:outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-2xl text-zinc-500 ml-1">cm</span>
          </div>
          <input
            type="range" min="100" max="250"
            value={onboardingData.height}
            onChange={e => setOnboardingData({ ...onboardingData, height: Number(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      ),
    },
    {
      title: 'Тежина',
      subtitle: 'Колку тежите?',
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex items-baseline justify-center">
            <input
              type="number"
              value={onboardingData.weight}
              onChange={e => setOnboardingData({ ...onboardingData, weight: Number(e.target.value) })}
              className="bg-transparent border-none text-6xl font-bold tracking-tighter text-center focus:outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-2xl text-zinc-500 ml-1">kg</span>
          </div>
          <input
            type="range" min="30" max="200"
            value={onboardingData.weight}
            onChange={e => setOnboardingData({ ...onboardingData, weight: Number(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      ),
    },
    {
      title: 'Години',
      subtitle: 'Колку години имате?',
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex items-baseline justify-center">
            <input
              type="number"
              value={onboardingData.age}
              onChange={e => setOnboardingData({ ...onboardingData, age: Number(e.target.value) })}
              className="bg-transparent border-none text-6xl font-bold tracking-tighter text-center focus:outline-none w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-2xl text-zinc-500 ml-1">год</span>
          </div>
          <input
            type="range" min="10" max="100"
            value={onboardingData.age}
            onChange={e => setOnboardingData({ ...onboardingData, age: Number(e.target.value) })}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      ),
    },
    {
      title: 'Цел',
      subtitle: 'Изберете ја вашата примарна цел',
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'cut', label: 'Слабеење' },
            { id: 'maintenance', label: 'Одржување' },
            { id: 'bulk', label: 'Маса' },
            { id: 'recomp', label: 'Слабеење и мускул' },
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setOnboardingData({ ...onboardingData, goal: g.id })}
              className={cn(
                'w-full py-5 rounded-2xl border-2 transition-all text-left px-6',
                onboardingData.goal === g.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400',
              )}
            >
              <div className="font-bold">{g.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Тренинг',
      subtitle: 'Колку често тренирате неделно?',
      content: (
        <div className="space-y-3">
          {[
            { id: '0_times', label: 'Не тренирам' },
            { id: '1_2_times', label: '1-2 пати неделно' },
            { id: '3_times', label: '3 пати неделно' },
            { id: '4_5_times', label: '4-5 пати неделно' },
            { id: '6_7_times', label: 'Секој ден' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setOnboardingData({ ...onboardingData, trainingFrequency: f.id })}
              className={cn(
                'w-full py-5 rounded-2xl border-2 transition-all text-left px-6',
                onboardingData.trainingFrequency === f.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400',
              )}
            >
              <div className="font-bold">{f.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Дневна активност',
      subtitle: 'Колку се движите во текот на денот (надвор од тренинг)?',
      content: (
        <div className="space-y-3">
          {[
            { id: 'sedentary', label: 'Минимално (канцелариска работа, многу седење)' },
            { id: 'light', label: 'Малку (лесно движење, повремено стоење)' },
            { id: 'moderate', label: 'Умерено (постојано движење, активна работа)' },
            { id: 'active', label: 'Многу (тешка физичка работа или многу движење)' },
          ].map(a => (
            <button
              key={a.id}
              onClick={() => setOnboardingData({ ...onboardingData, dailyActivity: a.id })}
              className={cn(
                'w-full py-5 rounded-2xl border-2 transition-all text-left px-6',
                onboardingData.dailyActivity === a.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400',
              )}
            >
              <div className="font-bold">{a.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Профилна слика',
      subtitle: 'Додадете слика за вашиот профил (опционално)',
      content: (
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shadow-2xl">
              {onboardingData.profileImage ? (
                <img src={onboardingData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={64} className="text-zinc-700" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="absolute bottom-2 right-2 bg-emerald-500 p-3 rounded-full cursor-pointer text-black shadow-lg hover:scale-110 transition-transform"
            >
              <Plus size={24} />
            </button>
          </div>
          <p className="text-zinc-500 text-sm text-center max-w-[200px]">
            Кликнете на плусот за галерија или камера
          </p>
        </div>
      ),
    },
    ...(!user && authMode === 'register' || needsPasswordSetup ? [{
      title: 'Лозинка',
      subtitle: 'Поставете лозинка за вашиот нов профил',
      content: (
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Лозинка"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
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
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      ),
    }] : []),
  ];

  // --- Edit profile inline form ---
  if (isEditingProfile) {
    return (
      <div className="min-h-screen bg-black text-white px-6 pt-10 pb-24 max-w-md mx-auto overflow-y-auto safe-area-pt">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-emerald-500 overflow-hidden flex items-center justify-center">
              {onboardingData.profileImage ? (
                <img src={onboardingData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} className="text-zinc-700" />
              )}
            </div>
            <button type="button" onClick={() => setShowImagePicker(true)} className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-black hover:bg-emerald-400 transition-colors">
              <Plus size={14} className="text-black" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-center">{firstName} {lastName}</h2>
        </div>

        <form onSubmit={async e => { e.preventDefault(); if (!firstName.trim()) { setNameError(true); return; } await handleOnboarding(); setIsEditingProfile(false); }} className="space-y-6" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Име</label>
              <Input
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setNameError(false); }}
                placeholder="Име"
                className={nameError ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Презиме</label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Презиме" />
            </div>
          </div>
          <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Висина (цм)</label>
              <Input type="number" value={onboardingData.height} onChange={e => setOnboardingData({ ...onboardingData, height: Math.max(0, Number(e.target.value)) })} />
            </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Години</label>
            <Input type="number" value={onboardingData.age} onChange={e => setOnboardingData({ ...onboardingData, age: Math.max(0, Number(e.target.value)) })} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Пол</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setOnboardingData({ ...onboardingData, gender: 'male' })} className={cn('py-3 rounded-xl border', onboardingData.gender === 'male' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400')}>Машко</button>
              <button type="button" onClick={() => setOnboardingData({ ...onboardingData, gender: 'female' })} className={cn('py-3 rounded-xl border', onboardingData.gender === 'female' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400')}>Женско</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Цел</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ id: 'cut', label: 'Слабеење' }, { id: 'maintenance', label: 'Одржување' }, { id: 'bulk', label: 'Маса' }, { id: 'recomp', label: 'Слабеење и мускул' }].map(g => (
                <button type="button" key={g.id} onClick={() => setOnboardingData({ ...onboardingData, goal: g.id })} className={cn('py-3 rounded-xl border text-xs text-center px-2', onboardingData.goal === g.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400')}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Колку често тренираш?</label>
            <div className="space-y-2">
              {[{ id: '0_times', label: 'Не тренирам' }, { id: '1_2_times', label: '1-2 пати неделно' }, { id: '3_times', label: '3 пати неделно' }, { id: '4_5_times', label: '4-5 пати неделно' }, { id: '6_7_times', label: 'Секој ден' }].map(f => (
                <button type="button" key={f.id} onClick={() => setOnboardingData({ ...onboardingData, trainingFrequency: f.id })} className={cn('w-full py-3 rounded-xl border text-left px-4 text-sm', onboardingData.trainingFrequency === f.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400')}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Дневна активност</label>
            <div className="space-y-2">
              {[{ id: 'sedentary', label: 'Минимално (седење)' }, { id: 'light', label: 'Малку (лесно движење)' }, { id: 'moderate', label: 'Умерено (активна работа)' }, { id: 'active', label: 'Многу (физичка работа)' }].map(a => (
                <button type="button" key={a.id} onClick={() => setOnboardingData({ ...onboardingData, dailyActivity: a.id })} className={cn('w-full py-3 rounded-xl border text-left px-4 text-sm', onboardingData.dailyActivity === a.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-800 text-zinc-400')}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {authError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {authError}
            </motion.div>
          )}

          <div className="space-y-2">
            <Button type="submit" className="bg-emerald-500 text-black" disabled={loading}>
              Зачувај промени
            </Button>
            <Button type="button" onClick={cancelEditProfile} className="bg-zinc-800 text-white">
              Откажи
            </Button>
            <Button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white hover:bg-red-500"
              disabled={loading || isDeletingAccount}
            >
              Избриши профил
            </Button>
          </div>
        </form>
        {/* Hidden file inputs */}
        <input ref={galleryInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="user" onChange={handleImageUpload} />
        {/* Image picker popup */}
        {showImagePicker && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center touch-none" onClick={() => setShowImagePicker(false)}>
            <div className="bg-zinc-900 rounded-t-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold text-center mb-4">Избери слика</h3>
              <div className="space-y-3">
                <button type="button" onClick={() => { setShowImagePicker(false); galleryInputRef.current?.click(); }} className="w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                  <ImageIcon size={20} />
                  <span className="font-semibold">Галерија</span>
                </button>
                <button type="button" onClick={() => { setShowImagePicker(false); cameraInputRef.current?.click(); }} className="w-full flex items-center gap-3 p-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors">
                  <Camera size={20} />
                  <span className="font-semibold">Камера</span>
                </button>
              </div>
              <button type="button" onClick={() => setShowImagePicker(false)} className="w-full mt-3 p-3 text-zinc-400 text-sm hover:text-white transition-colors">
                Откажи
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5"
              onClick={() => {
                if (!isDeletingAccount) setShowDeleteConfirm(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl border border-zinc-700 bg-zinc-950 p-5"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-black text-white">Потврди бришење на профилот</h3>
                <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                  Оваа акција е неповратна. Откако ќе се избрише профилот, сите податоци и целиот напредок што го имаш следено ќе бидат изгубени.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-3 rounded-xl bg-zinc-800 text-white font-semibold"
                    disabled={isDeletingAccount}
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsDeletingAccount(true);
                        await handleDeleteAccount();
                        setShowDeleteConfirm(false);
                      } finally {
                        setIsDeletingAccount(false);
                      }
                    }}
                    className="py-3 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-60"
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? 'Се брише...' : 'Избриши'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const currentStep = steps[onboardingStep] || steps[0];

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <Activity size={40} className="text-emerald-500 mx-auto mb-4" />
          <p className="text-zinc-500">Се вчитува...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto relative overflow-hidden safe-area-pb">
      <div className="px-6 pt-10 pb-6 safe-area-pt">
        <div className="flex items-center gap-4 mb-8">
          {onboardingStep > 0 ? (
            <button onClick={() => { setOnboardingStep(onboardingStep - 1); }} className="p-2 text-zinc-400">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button
              onClick={() => { if (user) { handleLogout(); } else { setView('auth'); } }}
              className="p-2 text-zinc-400 flex items-center gap-1"
            >
              <ChevronLeft size={24} />
              <span className="text-xs font-medium">Назад</span>
            </button>
          )}
          <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((onboardingStep + 1) / steps.length) * 100}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
          <span className="text-xs text-zinc-500 font-medium">Чекор {onboardingStep + 1} од {steps.length}</span>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">{currentStep.title}</h2>
          <p className="text-zinc-500">{currentStep.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {currentStep.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 space-y-4">
        {authError && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {authError}
          </motion.div>
        )}
        <Button
          onClick={async () => {
            if (onboardingStep < steps.length - 1) {
              setOnboardingStep(onboardingStep + 1);
            } else {
              await handleOnboarding();
            }
          }}
          className="bg-emerald-500 text-black"
          disabled={loading}
        >
          {onboardingStep === steps.length - 1 ? 'Заврши' : 'Продолжи'}
        </Button>
      </div>
      </div>

      <input ref={galleryInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input ref={cameraInputRef} type="file" className="hidden" accept="image/*" capture="user" onChange={handleImageUpload} />

      {showImagePicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center touch-none" onClick={() => setShowImagePicker(false)}>
          <div className="bg-zinc-900 rounded-t-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-center mb-4">Избери слика</h3>
            <div className="space-y-3">
              <button type="button" onClick={() => { setShowImagePicker(false); galleryInputRef.current?.click(); }} className="w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors">
                <ImageIcon size={20} />
                <span className="font-semibold">Галерија</span>
              </button>
              <button type="button" onClick={() => { setShowImagePicker(false); cameraInputRef.current?.click(); }} className="w-full flex items-center gap-3 p-4 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors">
                <Camera size={20} />
                <span className="font-semibold">Камера</span>
              </button>
            </div>
            <button type="button" onClick={() => setShowImagePicker(false)} className="w-full mt-3 p-3 text-zinc-400 text-sm hover:text-white transition-colors">
              Откажи
            </button>
          </div>
        </div>
      )}
    </>
  );
}
