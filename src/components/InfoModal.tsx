import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export default function InfoModal({ open, onClose, title, description }: InfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ height: '100dvh' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
