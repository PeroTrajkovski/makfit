import type { Food } from '../types';
import foodsData from './foods.json';

export const MK_MONTHS = [
  'ЈАНУАРИ', 'ФЕВРУАРИ', 'МАРТ', 'АПРИЛ', 'МАЈ', 'ЈУНИ',
  'ЈУЛИ', 'АВГУСТ', 'СЕПТЕМВРИ', 'ОКТОМВРИ', 'НОЕМВРИ', 'ДЕКЕМВРИ',
];

export const MK_DAYS_SHORT = ['НЕД', 'ПОН', 'ВТО', 'СРЕ', 'ЧЕТ', 'ПЕТ', 'САБ'];

type RawFood = Omit<Food, 'id' | 'name_lowercase'>;

export const INITIAL_FOODS: RawFood[] = foodsData as RawFood[];
