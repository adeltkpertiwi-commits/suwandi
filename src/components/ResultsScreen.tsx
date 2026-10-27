import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, ArrowRight, Home, Star, CheckCircle, XCircle, Clock, ShieldCheck, Target } from 'lucide-react';
import { sound } from '../utils/audio';
import { MISSIONS } from '../data/questions';

interface ResultsScreenProps {
  isVictory: boolean;
  score: number;
  missionId: number;
  studentName: string;
  studentClass: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  durationSeconds: number;
  enemiesDestroyed: number;
  stars: number;
  onRetryMission: () => void;
  onNextMission?: () => void;
  onBackToMenu: () => void;
  onOpenTeacherMode: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  isVictory,
  score,
  missionId,
  studentName,
  studentClass,
  totalQuestions,
  correctCount,
  wrongCount,
  accuracy,
  durationSeconds,
  enemiesDestroyed,
  stars,
  onRetryMission,
  onNextMission,
  onBackToMenu,
  onOpenTeacherMode
}) => {
  const currentMission = MISSIONS.find(m => m.id === missionId) || MISSIONS[0];
  const hasNextMission = isVictory && missionId < MISSIONS.length;

  useEffect(() => {
    if (isVictory) {
      sound.playVictory();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      sound.playExplosion(true);
    }
  }, [isVictory]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTeacherMessage = () => {
    if (isVictory) {
      if (accuracy >= 80) {
        return 'Luar biasa! Pemahaman sifat bilangan berpangkat Anda sangat tajam. Pertahankan prestasi gemilang ini, Pilot Handal!';
      } else {
        return 'Misi berhasil diselesaikan dengan baik! Tingkatkan kembali ketelitian dalam menerapkan sifat eksponen agar skor semakin sempurna.';
      }
    } else {
      return 'Pesawat mengalami kerusakan berat! Jangan berkecil hati. Pelajari kembali ringkasan sifat eksponen pada panduan dan luncurkan misi kembali!';
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-y-auto p-4 sm:p-8 flex flex-col justify-between select-none">
      {/* Background glow */}
      <div className={`absolute inset-0 pointer-events-none bg-radial-[circle_at_50%_30%] ${
        isVictory 
          ? 'from-blue-900/30 via-slate-950/80 to-[#030712]' 
          : 'from-red-950/30 via-slate-950/80 to-[#030712]'
      }`} />

      {/* Top Header: Developer Credit (Requirement 2 & 9) */}
      <div className="relative z-10 text-center border-b border-slate-800 pb-3 mb-4">
        <div className="text-xs uppercase font-tech tracking-widest text-cyan-400 font-bold">
          MATH AIR FORCE &bull; EXPONENT MISSION
        </div>
        <div className="text-xs text-slate-400 font-tech">
          Game Edukasi Matematika SMK Kelas X Fase E &bull; Dikembangkan oleh <strong>Suwandi, S.Pd.</strong> (SMKN 4 Soppeng)
        </div>
      </div>

      {/* Main Results Card */}
      <div className="relative z-10 max-w-2xl mx-auto w-full bg-slate-900/90 border-2 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xs my-auto space-y-6 ${
        isVictory ? 'border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]'
      }">
        {/* Title & Stars */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono-code text-cyan-400">
            {currentMission.code} &mdash; {currentMission.title}
          </div>

          <h2 className={`text-3xl sm:text-4xl font-extrabold font-tech tracking-wider uppercase ${
            isVictory ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-300' : 'text-red-400'
          }`}>
            {isVictory ? 'MISI BERHASIL DITAKLUKKAN!' : 'MISI GAGAL — PESAWAT RUSAK'}
          </h2>

          <div className="text-sm font-tech text-slate-300">
            Kadet: <strong className="text-white">{studentName}</strong> | Kelas: <strong className="text-white">{studentClass}</strong>
          </div>

          {/* Star Rating for Victory */}
          {isVictory && (
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2, 3].map(starNum => (
                <Star
                  key={starNum}
                  className={`w-9 h-9 transition-transform ${
                    starNum <= stars
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110'
                      : 'fill-slate-800 text-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Score */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-tech text-slate-400 uppercase">TOTAL SKOR</div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-yellow-300 mt-1">
              {score}
            </div>
          </div>

          {/* Akurasi Matematika */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-tech text-slate-400 uppercase">AKURASI MATEMATIKA</div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-cyan-400 mt-1">
              {accuracy}%
            </div>
          </div>

          {/* Benar vs Salah */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-tech text-slate-400 uppercase">SOAL TERJAWAB</div>
            <div className="text-sm font-mono-code font-bold mt-1.5 flex items-center justify-center gap-2">
              <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3.5 h-3.5" />{correctCount}</span>
              <span className="text-slate-600">/</span>
              <span className="text-red-400 flex items-center gap-0.5"><XCircle className="w-3.5 h-3.5" />{wrongCount}</span>
            </div>
          </div>

          {/* Waktu Tempuh */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] font-tech text-slate-400 uppercase">WAKTU TEMPUH</div>
            <div className="text-xl sm:text-2xl font-mono-code font-bold text-slate-200 mt-1 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatTime(durationSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Additional Combat Summary */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-around text-xs font-tech text-slate-300">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-red-400" />
            <span>Musuh Dieliminasi: <strong>{enemiesDestroyed} Pesawat</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Target Misi: <strong>{isVictory ? 'Tuntas 100%' : 'Gagal'}</strong></span>
          </div>
        </div>

        {/* Teacher Motivational Message */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/60 space-y-1">
          <div className="text-xs font-tech font-bold text-cyan-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>CATATAN EVALUASI GURU &bull; Suwandi, S.Pd. (SMKN 4 Soppeng):</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic font-tech leading-relaxed">
            "{getTeacherMessage()}"
          </p>
        </div>

        {/* Navigation Action Buttons Matrix */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* Ulangi Misi */}
          <button
            onClick={() => {
              sound.playClick();
              onRetryMission();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-tech font-bold text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ULANGI MISI</span>
          </button>

          {/* Misi Berikutnya (if won and next mission exists) */}
          {hasNextMission && onNextMission && (
            <button
              onClick={() => {
                sound.playClick();
                onNextMission();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 active:scale-95 text-white font-tech font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(52,211,153,0.5)] border border-emerald-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>MISI BERIKUTNYA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Rekap Mode Guru */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTeacherMode();
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-yellow-500/50 text-yellow-300 font-tech font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>LIHAT HASIL</span>
          </button>

          {/* Kembali ke Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onBackToMenu();
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 text-slate-300 hover:text-white font-tech font-bold text-xs tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 font-tech mt-4">
        MATH AIR FORCE: EXPONENT MISSION &bull; Media Pembelajaran Interaktif SMKN 4 Soppeng
      </div>
    </div>
  );
};
