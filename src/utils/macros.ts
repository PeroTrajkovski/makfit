import type { OnboardingData } from '../types';

export const calculateMacros = (data: OnboardingData) => {
  const { weight, height, age, gender, trainingFrequency, dailyActivity, goal } = data;

  const dailyMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'light': 1.3,
    'moderate': 1.4,
    'active': 1.5,
  };

  const trainingMultipliers: Record<string, number> = {
    '0_times': 0,
    '1_2_times': 0.1,
    '3_times': 0.2,
    '4_5_times': 0.3,
    '6_7_times': 0.4,
  };

  const baseMultiplier = dailyMultipliers[dailyActivity] ?? 1.2;
  const trainingBonus = trainingMultipliers[trainingFrequency] ?? 0;
  const totalMultiplier = baseMultiplier + trainingBonus;

  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  let tdee = bmr * totalMultiplier;
  if (goal === 'cut') tdee *= 0.8;
  else if (goal === 'bulk') tdee *= 1.1;
  else if (goal === 'recomp') tdee *= 0.95;

  const targetCalories = Math.round(tdee);
  const targetProtein = Math.round(weight * (goal === 'bulk' || goal === 'recomp' ? 2.2 : 2));
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4);

  return { targetCalories, targetProtein, targetFat, targetCarbs };
};
