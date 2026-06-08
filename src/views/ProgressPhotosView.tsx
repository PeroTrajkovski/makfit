import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Camera, Image as ImageIcon, Upload, Trash2, X } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import type { ProgressPhoto, ViewType } from '../types';

interface Props {
  user: FirebaseUser | null;
  currentWeight: number;
  setView: (v: ViewType) => void;
}

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('mk-MK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, (base64.length * 3) / 4 - padding);
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read_failed'));
    reader.onloadend = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('img_load_failed'));
      img.onload = () => {
        const MAX_SIDE = 1280;
        let { width, height } = img;
        if (width > MAX_SIDE || height > MAX_SIDE) {
          if (width > height) {
            height = Math.round((height / width) * MAX_SIDE);
            width = MAX_SIDE;
          } else {
            width = Math.round((width / height) * MAX_SIDE);
            height = MAX_SIDE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas_failed'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const OUTPUT_FORMAT = 'image/jpeg';
        const MAX_BYTES = 420 * 1024;
        const MIN_QUALITY = 0.55;

        let bestDataUrl = canvas.toDataURL(OUTPUT_FORMAT, 0.88);
        if (estimateDataUrlBytes(bestDataUrl) <= MAX_BYTES) {
          resolve(bestDataUrl);
          return;
        }

        let low = MIN_QUALITY;
        let high = 0.88;
        for (let i = 0; i < 7; i += 1) {
          const mid = (low + high) / 2;
          const candidate = canvas.toDataURL(OUTPUT_FORMAT, mid);
          if (estimateDataUrlBytes(candidate) <= MAX_BYTES) {
            bestDataUrl = candidate;
            low = mid;
          } else {
            high = mid;
          }
        }

        const finalDataUrl = canvas.toDataURL(OUTPUT_FORMAT, low);
        resolve(estimateDataUrlBytes(finalDataUrl) <= MAX_BYTES ? finalDataUrl : bestDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProgressPhotosView({ user, currentWeight, setView }: Props) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'progress_photos'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      snap => {
        const loaded = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as ProgressPhoto))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPhotos(loaded);
      },
      e => handleFirestoreError(e, OperationType.LIST, 'progress_photos'),
    );
    return () => unsub();
  }, [user]);

  const handlePickUpload = () => {
    uploadInputRef.current?.click();
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);
    try {
      const imageData = await compressImage(file);
      const date = new Date().toISOString();
      await addDoc(collection(db, 'progress_photos'), {
        userId: user.uid,
        imageData,
        date,
        weight: currentWeight,
      });
    } catch (err) {
      setError('Неуспешно прикачување на фотографија. Обиди се повторно.');
      handleFirestoreError(err, OperationType.CREATE, 'progress_photos');
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!user) return;
    const confirmed = window.confirm('Дали сакаш да ја избришеш оваа фотографија?');
    if (!confirmed) return;

    setDeletingPhotoId(photoId);
    setError(null);
    try {
      await deleteDoc(doc(db, 'progress_photos', photoId));
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    } catch (err) {
      setError('Неуспешно бришење на фотографија. Обиди се повторно.');
      handleFirestoreError(err, OperationType.DELETE, `progress_photos/${photoId}`);
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <motion.div
      key="progress-photos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 pt-10 pb-36 safe-area-pt space-y-6"
      style={{ minHeight: '100dvh' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('weight')}
          className="p-2 bg-zinc-900 rounded-xl active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Фотографии за прогрес</h2>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
        <p className="text-sm text-zinc-400">
          Додај фотографија и ќе се зачуваат датумот и твојата тековна тежина.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePickUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-black font-bold active:scale-95 transition-transform disabled:opacity-60"
          >
            <Upload size={18} />
            {uploading ? 'Се прикачува...' : 'Прикачи фотографија'}
          </button>
          <button
            onClick={handleTakePhoto}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 text-white font-bold active:scale-95 transition-transform disabled:opacity-60"
          >
            <Camera size={18} />
            {uploading ? 'Се прикачува...' : 'Сликај'}
          </button>
        </div>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadImage}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleUploadImage}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
          <ImageIcon size={28} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500">Се уште нема фотографии за прогрес.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="relative">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="block w-full text-left"
                >
                  <img src={photo.imageData} alt="Progress" className="w-full aspect-[4/5] object-cover" />
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingPhotoId === photo.id}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 border border-zinc-700 text-red-300 active:scale-90 transition-transform disabled:opacity-60"
                  title="Избриши"
                  aria-label="Избриши"
                >
                  <Trash2 size={16} />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent flex items-end justify-between">
                  <span className="text-[11px] font-bold bg-black/55 px-2 py-1 rounded-lg border border-zinc-700">
                    {formatDate(photo.date)}
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/35">
                    {photo.weight} кг
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-3"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              onClick={e => { e.stopPropagation(); setSelectedPhoto(null); }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200"
              aria-label="Затвори"
            >
              <X size={18} />
            </button>
            <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
              <img src={selectedPhoto.imageData} alt="Progress full" className="w-full max-h-[82dvh] object-contain rounded-2xl border border-zinc-700" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent flex items-end justify-between rounded-b-2xl">
                <span className="text-xs font-bold bg-black/60 px-2 py-1 rounded-lg border border-zinc-700">
                  {formatDate(selectedPhoto.date)}
                </span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/35">
                  {selectedPhoto.weight} кг
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
