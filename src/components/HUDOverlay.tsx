import React from 'react';
import { Volume2, VolumeX, Pause, Play, Heart, Zap, Shield, Crosshair } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDOverlayProps {
  score: number;
  missionCode: string;
  missionTitle: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  bossHealth: number | null;
  bossMaxHealth: number | null;
  bossName?: string;
  studentName: string;
  studentClass: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onFireTouch?: () => void;
  onDirectionTouch?: (dir: { x: number; y: number }) => void;
  isTouchDevice: boolean;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  score,
  missionCode,
  missionTitle,
  health,
  maxHealth,
  energy,
  maxEnergy,
  currentQuestionIndex,
  totalQuestions,
  bossHealth,
  bossMaxHealth,
  bossName,
  studentName,
  studentClass,
  isPaused,
  onTogglePause,
  onFireTouch,
  onDirectionTouch,
  isTouchDevice
}) => {
  const [isMuted, setIsMuted] = React.useState(!sound.isEnabled());

  const handleMuteToggle = () => {
    const newState = sound.toggleSound();
    setIsMuted(!newState);
  };

  const energyPercent = Math.min(100, Math.max(0, (energy / maxEnergy) * 100));
  const isBossActive = bossHealth !== null && bossMaxHealth !== null && bossHealth > 0;
  const bossPercent = isBossActive ? Math.min(100, Math.max(0, (bossHealth / bossMaxHealth) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none overflow-hidden z-10">
      {/* Top HUD Bar */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Player & Mission Status */}
        <div className="bg-slate-900/85 backdrop-blur-xs border border-cyan-500/30 rounded-lg p-2.5 shadow-lg max-w-xs sm:max-w-sm pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono-code">
              {missionCode}
            </span>
            <span className="text-sm font-tech font-bold text-white truncate tracking-wider">
              {missionTitle}
            </span>
          </div>

          <div className="text-xs text-slate-300 flex items-center gap-2 font-tech">
            <span className="text-cyan-400 font-semibold truncate">PILOT: {studentName || 'KADET'}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{studentClass || 'SMK KELAS X'}</span>
          </div>

          {/* Health & Energy Bars */}
          <div className="mt-2 space-y-1.5">
            {/* Health Hearts */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-red-400 w-12 font-tech flex items-center gap-1">
                <Heart className="w-3 h-3 fill-red-500 text-red-500" /> INTEGRITAS
              </span>
              <div className="flex gap-1">
                {Array.from({ length: maxHealth }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-3 rounded-xs border transition-colors ${
                      i < health
                        ? 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Energy Bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 w-12 font-tech flex items-center gap-1">
                <Zap className="w-3 h-3 fill-cyan-400 text-cyan-400" /> ENERGI
              </span>
              <div className="flex-1 h-2.5 bg-slate-950 rounded border border-cyan-900/60 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400 transition-all duration-200"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono-code text-cyan-300 w-8 text-right">
                {Math.round(energyPercent)}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Math Challenge Progress */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/85 backdrop-blur-xs border border-cyan-500/40 rounded-lg px-4 py-1.5 text-center shadow-lg">
            <div className="text-[10px] uppercase tracking-wider font-tech text-cyan-300 flex items-center justify-center gap-1">
              <Crosshair className="w-3 h-3 text-cyan-400" /> TARGET ENKRIPSI SOAL
            </div>
            <div className="text-lg font-tech font-bold text-white tracking-widest">
              <span className="text-cyan-400">{currentQuestionIndex}</span> / {totalQuestions}
            </div>
          </div>

          {/* Boss HP Bar (if Boss Active) */}
          {isBossActive && (
            <div className="mt-2 bg-red-950/90 border-2 border-red-500 rounded-lg p-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] w-64 sm:w-80 text-center animate-pulse">
              <div className="flex justify-between text-xs font-bold font-tech text-red-200 mb-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-red-400" /> {bossName || 'BOSS WARSHIP'}
                </span>
                <span className="font-mono-code">{Math.round(bossPercent)}%</span>
              </div>
              <div className="h-3 bg-black rounded overflow-hidden border border-red-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-400 transition-all duration-150"
                  style={{ width: `${bossPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Score Counter & Game Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Score display */}
          <div className="bg-slate-900/85 backdrop-blur-xs border border-blue-500/40 rounded-lg px-3.5 py-1.5 text-right shadow-lg">
            <div className="text-[10px] uppercase tracking-wider font-tech text-blue-300">
              SKOR TEMPUR
            </div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-yellow-300 tabular-nums">
              {score.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Audio & Pause Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleMuteToggle}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-slate-800 transition active:scale-95 shadow"
              title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={onTogglePause}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-yellow-400 hover:bg-slate-800 transition active:scale-95 flex items-center gap-1.5 font-tech text-xs font-bold shadow"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
              <span>{isPaused ? 'LANJUT' : 'JEDA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Controls Hint for Desktop / On-screen buttons for Mobile */}
      <div className="flex items-end justify-between pointer-events-none">
        {/* Control Hints for Desktop */}
        {!isTouchDevice && (
          <div className="hidden sm:flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 rounded-full px-4 py-1.5 text-xs text-slate-400 font-tech">
            <span><strong className="text-cyan-300">W A S D</strong> / <strong className="text-cyan-300">Panah</strong> Gerak</span>
            <span className="text-slate-600">·</span>
            <span><strong className="text-yellow-300">SPASI</strong> Tembak</span>
            <span className="text-slate-600">·</span>
            <span><strong className="text-slate-300">ESC</strong> Jeda</span>
          </div>
        )}

        {/* Mobile On-Screen Touch Controls */}
        {isTouchDevice && (
          <div className="w-full flex justify-between items-end p-2 pointer-events-auto">
            {/* Virtual D-Pad / Direction Touch Buttons */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
              <div />
              <button
                onTouchStart={() => onDirectionTouch?.({ x: 0, y: -1 })}
                onTouchEnd={() => onDirectionTouch?.({ x: 0, y: 0 })}
                className="w-12 h-12 bg-slate-800/90 active:bg-cyan-600 border border-slate-600 active:border-cyan-300 text-white font-bold rounded-lg flex items-center justify-center text-lg active:scale-95 shadow"
              >
                ▲
              </button>
              <div />
              <button
                onTouchStart={() => onDirectionTouch?.({ x: -1, y: 0 })}
                onTouchEnd={() => onDirectionTouch?.({ x: 0, y: 0 })}
                className="w-12 h-12 bg-slate-800/90 active:bg-cyan-600 border border-slate-600 active:border-cyan-300 text-white font-bold rounded-lg flex items-center justify-center text-lg active:scale-95 shadow"
              >
                ◀
              </button>
              <button
                onTouchStart={() => onDirectionTouch?.({ x: 0, y: 1 })}
                onTouchEnd={() => onDirectionTouch?.({ x: 0, y: 0 })}
                className="w-12 h-12 bg-slate-800/90 active:bg-cyan-600 border border-slate-600 active:border-cyan-300 text-white font-bold rounded-lg flex items-center justify-center text-lg active:scale-95 shadow"
              >
                ▼
              </button>
              <button
                onTouchStart={() => onDirectionTouch?.({ x: 1, y: 0 })}
                onTouchEnd={() => onDirectionTouch?.({ x: 0, y: 0 })}
                className="w-12 h-12 bg-slate-800/90 active:bg-cyan-600 border border-slate-600 active:border-cyan-300 text-white font-bold rounded-lg flex items-center justify-center text-lg active:scale-95 shadow"
              >
                ▶
              </button>
            </div>

            {/* Fire Button for Mobile */}
            <div className="flex flex-col items-center gap-2">
              <button
                onTouchStart={() => onFireTouch?.()}
                onMouseDown={() => onFireTouch?.()}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-amber-600 active:from-red-400 active:to-yellow-400 border-2 border-red-300 text-white font-tech font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] active:scale-95 flex flex-col items-center justify-center gap-0.5"
              >
                <Zap className="w-6 h-6 fill-white" />
                TEMBAK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
