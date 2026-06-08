import React, { useState } from 'react';
import { Search, ChevronLeft, Plus, Utensils, ScanLine, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';
import { INITIAL_FOODS } from '../data/foods';
import { localDateStr } from '../utils/dashboardDate';
import type { Food, ViewType } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

interface Props {
  user: FirebaseUser | null;
  isPremium: boolean;
  selectedMealType: string;
  selectedDate: string;
  setView: (v: ViewType) => void;
}

export default function SearchView({ user, isPremium, selectedMealType, selectedDate, setView }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState('100');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const canLogMealsForSelectedDate = selectedDate === localDateStr(new Date());

  const scanBarcode = async () => {
    if (!canLogMealsForSelectedDate) {
      setScanError('Може да внесуваш храна само за денес.');
      return;
    }
    if (!Capacitor.isNativePlatform()) {
      setScanError('Скенирањето е достапно само на мобилни уреди.');
      return;
    }
    setScanError(null);
    setScanning(true);
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted' && camera !== 'limited') {
        setScanError('Потребна е дозвола за камера.');
        setScanning(false);
        return;
      }
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
      });
      if (!barcodes.length) { setScanning(false); return; }
      const barcode = barcodes[0].rawValue;

      // Fetch from Open Food Facts
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status !== 1 || !data.product) {
        setScanError('Производот не е пронајден во базата. Обидете се со рачно пребарување.');
        setScanning(false);
        return;
      }
      const p = data.product;
      const n = p.nutriments || {};
      const cal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? Math.round(n['energy_100g'] / 4.184) : 0);
      const protein = n['proteins_100g'] ?? 0;
      const carbs = n['carbohydrates_100g'] ?? 0;
      const fat = n['fat_100g'] ?? 0;
      const name = p.product_name || p.product_name_en || `Баркод ${barcode}`;
      const scannedFood: Food = {
        id: `barcode-${barcode}`,
        name,
        name_lowercase: name.toLowerCase(),
        calories: Math.round(cal),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      };
      setSelectedFoodForQuantity(scannedFood);
      setFoodQuantity('100');
    } catch {
      setScanError('Грешка при скенирање. Обидете се повторно.');
    } finally {
      setScanning(false);
    }
  };

  const logMealScanned = async (food: Food, grams: number) => {
    if (!user || !canLogMealsForSelectedDate) return;
    try {
      await addDoc(collection(db, 'meals'), {
        userId: user.uid,
        type: selectedMealType,
        date: new Date(selectedDate).toISOString(),
        items: [{ food, amount: grams / 100 }],
      });
      setView('dashboard');
      setSelectedFoodForQuantity(null);
      setFoodQuantity('100');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'meals');
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lowerQ = q.toLowerCase();

    const localResults = INITIAL_FOODS
      .filter(f => f.name.toLowerCase().includes(lowerQ))
      .map(f => ({ ...f, id: `local-${f.name}`, name_lowercase: f.name.toLowerCase() }));

    try {
      const qRef = query(
        collection(db, 'foods'),
        where('name_lowercase', '>=', lowerQ),
        where('name_lowercase', '<=', lowerQ + '\uf8ff'),
      );
      const snap = await getDocs(qRef);
      const dbResults = snap.docs.map(d => ({ id: d.id, ...d.data() } as Food));

      const combined = [...localResults, ...dbResults];
      const uniqueResults: Food[] = [];
      const seenNames = new Set<string>();
      for (const food of combined) {
        const name = food.name.toLowerCase();
        if (!seenNames.has(name)) { uniqueResults.push(food); seenNames.add(name); }
      }
      setSearchResults(uniqueResults);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'foods');
    }
  };

  const logMeal = async (foodId: string, grams: number) => {
    if (!user || !canLogMealsForSelectedDate) return;
    const food = searchResults.find(f => f.id === foodId);
    if (!food) return;
    try {
      await addDoc(collection(db, 'meals'), {
        userId: user.uid,
        type: selectedMealType,
        date: new Date(selectedDate).toISOString(),
        items: [{ food, amount: grams / 100 }],
      });
      setView('dashboard');
      setSelectedFoodForQuantity(null);
      setFoodQuantity('100');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'meals');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="px-6 pt-10 safe-area-pt"
      >
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('dashboard')} className="p-2 bg-zinc-900 rounded-xl">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Додади храна</h2>
        </div>

        {!canLogMealsForSelectedDate && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
            За претходни денови е достапен само преглед. Внесување храна е дозволено само за денес.
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input
            placeholder="Пребарај храна..."
            className="pl-12"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {searchResults.map(food => {
            const isStewOrSoup = food.name.toLowerCase().includes('манџа') || food.name.toLowerCase().includes('чорба') || food.name.toLowerCase().includes('грав');
            const isMeat = food.name.toLowerCase().includes('стек') || food.name.toLowerCase().includes('бифтек') || food.name.toLowerCase().includes('месо');
            const defaultGrams = food.defaultPortion || (isStewOrSoup ? 300 : isMeat ? 150 : 100);

            return (
              <div key={food.id} className="w-full bg-zinc-900 rounded-2xl flex items-center overflow-hidden">
                <button
                  onClick={() => logMeal(food.id, defaultGrams)}
                  disabled={!canLogMealsForSelectedDate}
                  className={cn(
                    'flex-1 p-4 text-left transition-colors',
                    canLogMealsForSelectedDate ? 'hover:bg-zinc-800' : 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <h4 className="font-medium">{food.name}</h4>
                  <p className="text-xs text-zinc-500">
                    {food.calories} kcal • П: {food.protein}г • Ј: {food.carbs}г • М: {food.fat}г
                  </p>
                  <p className="text-[10px] text-emerald-500 mt-1 font-bold uppercase tracking-wider">
                    + Додај порција ({defaultGrams}г)
                  </p>
                </button>
                <button
                  onClick={() => { if (!canLogMealsForSelectedDate) return; setSelectedFoodForQuantity(food); setFoodQuantity(String(food.defaultPortion || 100)); }}
                  disabled={!canLogMealsForSelectedDate}
                  className={cn(
                    'p-4 h-full border-l border-zinc-800 text-zinc-500 transition-colors',
                    canLogMealsForSelectedDate ? 'hover:bg-zinc-800' : 'opacity-60 cursor-not-allowed',
                  )}
                >
                  <Plus size={20} />
                </button>
              </div>
            );
          })}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-zinc-500 py-8">Нема пронајдено храна.</p>
          )}
        </div>

        {/* Barcode Scanner Button — premium only */}
        {isPremium && (
          <div className="mt-6 pb-8">
            {scanError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 mb-4 text-sm text-red-400">
                <X size={16} className="shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
            <button
              onClick={scanBarcode}
              disabled={scanning || !canLogMealsForSelectedDate}
              className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-zinc-300 font-semibold text-base transition-all active:scale-95 disabled:opacity-50"
            >
              <ScanLine size={22} className={scanning ? 'animate-pulse text-emerald-400' : 'text-emerald-400'} />
              {scanning ? 'Скенирање...' : 'Скенирај баркод'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Quantity Modal */}
      <AnimatePresence>
        {selectedFoodForQuantity && (
          <div className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center p-4" style={{ height: '100dvh' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFoodForQuantity(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-1">{selectedFoodForQuantity.name}</h3>
                <p className="text-zinc-500 text-sm">Внесете количина во грамови</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 px-1">
                    <span>Количина (г)</span>
                    <span className="text-emerald-500">{foodQuantity}г</span>
                  </div>
                  <Input
                    type="number"
                    value={foodQuantity}
                    onChange={e => setFoodQuantity(e.target.value)}
                    className="text-center text-2xl font-bold py-6 bg-black border-zinc-800"
                    autoFocus
                  />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[100, 200, 350, 500].map(q => (
                      <button
                        key={q}
                        onClick={() => setFoodQuantity(String(q))}
                        className={cn(
                          'py-2 rounded-xl text-xs font-bold border transition-all',
                          Number(foodQuantity) === q ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500',
                        )}
                      >
                        {q === 350 ? 'Порција' : `${q}г`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Кал', value: Math.round((selectedFoodForQuantity.calories * Number(foodQuantity || 0)) / 100), color: 'text-white' },
                    { label: 'Прот', value: ((selectedFoodForQuantity.protein * Number(foodQuantity || 0)) / 100).toFixed(1), color: 'text-emerald-500' },
                    { label: 'Јагл', value: ((selectedFoodForQuantity.carbs * Number(foodQuantity || 0)) / 100).toFixed(1), color: 'text-blue-500' },
                    { label: 'Масти', value: ((selectedFoodForQuantity.fat * Number(foodQuantity || 0)) / 100).toFixed(1), color: 'text-amber-500' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-black/40 rounded-2xl p-3 text-center border border-zinc-800/50">
                      <div className={cn('text-sm font-bold mb-0.5', stat.color)}>{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setSelectedFoodForQuantity(null)} className="bg-zinc-800 text-white flex-1">
                    Откажи
                  </Button>
                  <Button
                    onClick={() => {
                      if (!canLogMealsForSelectedDate) return;
                      if (selectedFoodForQuantity.id.startsWith('barcode-')) {
                        logMealScanned(selectedFoodForQuantity, Number(foodQuantity || 0));
                      } else {
                        logMeal(selectedFoodForQuantity.id, Number(foodQuantity || 0));
                      }
                    }}
                    disabled={!canLogMealsForSelectedDate}
                    className="bg-emerald-500 text-black flex-[2]"
                  >
                    Додади
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
