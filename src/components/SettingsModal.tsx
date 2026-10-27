import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sliders, Smartphone, RotateCcw, Check, Music } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
  isTouchForced: boolean;
  onToggleTouch: (forced: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isTouchForced,
  onToggleTouch
}) => {
  const [volume, setVolume] = useState<number>(sound.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(!sound.isEnabled());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
    if (isMuted && val > 0) {
      sound.setSoundEnabled(true);
      setIsMuted(false);
    }
  };

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setIsMuted(!newState);
  };

  const handleTestLaser = () => {
    sound.playLaser(false);
  };

  const handleTestExplosion = () => {
    sound.playExplosion(false);
  };

  const handleTestChime = () => {
    sound.playCorrect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-4 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-tech font-bold text-white uppercase tracking-wider">
              PENGATURAN PERMAINAN
            </h2>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-slate-200 text-xs sm:text-sm font-tech">
          {/* Audio Settings */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 uppercase flex items-center gap-2">
                <Music className="w-4 h-4" />
                SUARA DAN EFEK AUDIO
              </span>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isMuted 
                    ? 'bg-red-950 border border-red-500 text-red-300' 
                    : 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                }`}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? 'TERBUNGKAM' : 'AKTIF'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono-code">
                <span>Volume Audio</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Audio Test Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Tes Efek:</span>
              <button
                onClick={handleTestLaser}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition cursor-pointer"
              >
                Laser
              </button>
              <button
                onClick={handleTestExplosion}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs transition cursor-pointer"
              >
                Ledakan
              </button>
              <button
                onClick={handleTestChime}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs transition cursor-pointer"
              >
                Nada Benar
              </button>
            </div>
          </div>

          {/* Touch Controls Toggle for Testing on Desktop */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>KONTROL VIRTUAL SENTUH</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Tampilkan tombol arah dan tembak di layar (otomatis aktif di HP/tablet).
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onToggleTouch(!isTouchForced);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-bold border transition cursor-pointer ${
                  isTouchForced
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {isTouchForced ? 'SELALU TAMPIL' : 'OTOMATIS'}
              </button>
            </div>
          </div>

          {/* Credits */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            MATH AIR FORCE: EXPONENT MISSION &bull; Suwandi, S.Pd. &bull; SMKN 4 Soppeng
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-bold text-xs transition cursor-pointer"
          >
            SIMPAN &amp; TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
