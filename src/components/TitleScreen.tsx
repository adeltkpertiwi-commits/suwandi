import React, { useEffect, useState } from 'react';
import { Play, BookOpen, Settings, GraduationCap, Volume2, VolumeX, ShieldAlert, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenTeacherMode: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenGuide,
  onOpenSettings,
  onOpenTeacherMode
}) => {
  const [isMuted, setIsMuted] = useState(!sound.isEnabled());

  // Listen for Enter or Space to quickly start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const handleToggleSound = () => {
    const state = sound.toggleSound();
    setIsMuted(!state);
    if (state) sound.playClick();
  };

  return (
    <div className="relative w-full h-screen bg-[#030712] overflow-hidden flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Animated Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep space nebula gradients */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_30%] from-blue-900/30 via-slate-950/80 to-[#030712]" />
        
        {/* Animated Perspective Combat Grid */}
        <div 
          className="absolute inset-x-0 bottom-0 h-96 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(400px) rotateX(60deg) translateY(60px)',
            transformOrigin: 'bottom'
          }}
        />

        {/* Floating Stars & Dust Particles */}
        <div className="absolute inset-0 opacity-40">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute top-1/4 left-1/6 animate-pulse" />
          <div className="w-2 h-2 bg-blue-300 rounded-full absolute top-1/3 right-1/4 animate-ping" />
          <div className="w-1 h-1 bg-white rounded-full absolute top-2/3 left-1/3" />
          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full absolute top-1/2 right-1/6 animate-pulse" />
        </div>
      </div>

      {/* Top Header: Developer Credit Badge (Permanent & Clear) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl px-4 py-2 shadow-lg backdrop-blur-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-tech tracking-wider text-cyan-400 font-bold">
              KARYA INOVASI PEMBELAJARAN ORISINAL
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-tech">
              Dikembangkan oleh: <span className="text-cyan-300">Suwandi, S.Pd.</span>
            </div>
            <div className="text-xs text-slate-400 font-tech">
              SMKN 4 Soppeng &bull; SMK Kelas X Fase E Matematika
            </div>
          </div>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={handleToggleSound}
          className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition flex items-center gap-2 font-tech text-xs cursor-pointer shadow"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          <span>SUARA: {isMuted ? 'NONAKTIF' : 'AKTIF'}</span>
        </button>
      </div>

      {/* Center Stage: Hero Fighter Jet & Bespoke Title Lockup */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-4xl mx-auto px-4">
        {/* Hero Fighter Jet SVG Artwork */}
        <div className="w-64 h-36 sm:w-80 sm:h-44 mb-2 animate-bounce duration-1000">
          <svg viewBox="0 0 240 120" className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="engineFlame" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* Jet Exhaust Thruster Plume */}
            <polygon points="10,60 38,54 38,66" fill="url(#engineFlame)" opacity="0.9">
              <animate attributeName="points" dur="0.15s" repeatCount="indefinite" values="5,60 38,53 38,67; 0,60 38,54 38,66; 8,60 38,55 38,65; 5,60 38,53 38,67" />
            </polygon>
            <circle cx="22" cy="60" r="14" fill="#06b6d4" opacity="0.3" filter="blur(6px)" />

            {/* Rear Stabilizers */}
            <polygon points="40,35 65,48 45,60" fill="#dc2626" />
            <polygon points="40,85 65,72 45,60" fill="#dc2626" />

            {/* Main Delta Wings */}
            <polygon points="75,60 115,15 145,55" fill="url(#wingGrad)" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="75,60 115,105 145,65" fill="url(#wingGrad)" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Wingtip Missiles / Lasers */}
            <rect x="105" y="12" width="28" height="4" rx="2" fill="#ef4444" />
            <rect x="105" y="104" width="28" height="4" rx="2" fill="#ef4444" />
            <circle cx="134" cy="14" r="2.5" fill="#38bdf8" />
            <circle cx="134" cy="106" r="2.5" fill="#38bdf8" />

            {/* Jet Fuselage */}
            <polygon points="35,60 70,45 190,56 225,60 190,64 70,75" fill="url(#bodyGrad)" stroke="#93c5fd" strokeWidth="1.5" />

            {/* Cockpit Canopy */}
            <polygon points="120,54 165,56 150,60 120,60" fill="#38bdf8" opacity="0.85" />
            <polygon points="125,55 155,56.5 145,59 125,59" fill="#ffffff" opacity="0.6" />

            {/* Red & White Racing Stripes */}
            <polygon points="80,50 100,50 90,70 70,70" fill="#ffffff" opacity="0.9" />
            <polygon points="102,51 122,51 112,69 92,69" fill="#ef4444" opacity="0.9" />

            {/* Nose Cone Probe */}
            <line x1="225" y1="60" x2="238" y2="60" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bespoke Title Lockup */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-tech tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white drop-shadow-[0_5px_25px_rgba(6,182,212,0.6)]">
            MATH AIR FORCE
          </h1>
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="text-lg sm:text-2xl font-tech font-bold tracking-widest text-cyan-300 uppercase">
              EXPONENT MISSION
            </span>
          </div>
        </div>

        {/* Tagline & Subtitle */}
        <p className="mt-3 text-slate-300 text-sm sm:text-lg font-tech font-semibold tracking-wide max-w-xl">
          “Kuasai Sifat Bilangan Berpangkat, Taklukkan Tantangan!”
        </p>

        {/* Action Buttons Matrix (All 4 primary buttons + sound toggle) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {/* Primary CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-tech font-bold text-base sm:text-lg tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-300 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>MULAI MISI</span>
          </button>

          {/* Secondary Guide CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGuide();
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 active:scale-95 text-slate-200 font-tech font-bold text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>PANDUAN</span>
          </button>

          {/* Teacher Mode CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTeacherMode();
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-yellow-400 active:scale-95 text-slate-200 font-tech font-bold text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            <GraduationCap className="w-4 h-4 text-yellow-400" />
            <span>MODE GURU</span>
          </button>

          {/* Settings CTA */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-400 active:scale-95 text-slate-300 hover:text-white transition flex items-center justify-center cursor-pointer shadow"
            title="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Flat Control Hint Line */}
        <div className="mt-6 text-xs text-slate-400 font-tech">
          Tekan <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono-code">ENTER</kbd> / <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono-code">SPASI</kbd> untuk Mulai &bull; WASD / Panah untuk Mengemudi
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-tech border-t border-slate-800/80 pt-3 gap-2">
        <div className="text-center sm:text-left">
          <span>Game Edukasi Pesawat Tempur Matematika Fase E</span>
          <span className="hidden sm:inline mx-2 text-slate-600">|</span>
          <span className="text-cyan-400">SMKN 4 Soppeng</span>
        </div>
        <div className="text-slate-400 text-center sm:text-right">
          Hak Cipta Karya Pembelajaran &copy; Suwandi, S.Pd.
        </div>
      </div>
    </div>
  );
};
