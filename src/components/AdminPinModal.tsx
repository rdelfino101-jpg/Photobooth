import React, { useState } from 'react';
import { Lock, Delete, X, ShieldAlert, KeyRound } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface AdminPinModalProps {
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
  language?: Language;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  correctPin,
  onSuccess,
  onClose,
  language = 'es',
}) => {
  const t = TRANSLATIONS[language];
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      const next = pin + digit;
      setPin(next);
      setError(false);
      if (next === correctPin) {
        setTimeout(() => onSuccess(), 100);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-xs bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transition-transform ${
          error ? 'animate-shake border-red-500/80 shadow-red-500/20' : ''
        }`}
      >
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t.pinTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title={t.pinCancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-neutral-100 font-display mb-1">
          {language === 'es' ? 'Ingresa el PIN de Evento' : 'Enter Event PIN'}
        </h3>
        <p className="text-xs text-neutral-400 mb-5">
          {language === 'es' ? 'Protegido para operadores (PIN por defecto: ' : 'Protected for operators (Default PIN: '}
          <span className="font-mono text-neutral-300">1234</span>)
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                i < pin.length
                  ? 'bg-amber-400 border-amber-300 scale-110 shadow-sm shadow-amber-400/50'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-3">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{t.pinIncorrect}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="min-h-[52px] rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-800 text-neutral-100 font-bold text-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="min-h-[52px] rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 active:scale-95 text-xs text-neutral-400 font-semibold flex items-center justify-center transition-all cursor-pointer"
          >
            {language === 'es' ? 'Borrar' : 'Clear'}
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="min-h-[52px] rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-800 text-neutral-100 font-bold text-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="min-h-[52px] rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 active:scale-95 text-neutral-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleManualSubmit}
          className="w-full min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-98"
        >
          {language === 'es' ? 'Desbloquear Panel' : 'Unlock Panel'}
        </button>
      </div>
    </div>
  );
};
