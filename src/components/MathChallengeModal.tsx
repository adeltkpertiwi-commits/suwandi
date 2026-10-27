import React, { useState, useEffect } from 'react';
import { ExponentQuestion } from '../types/game';
import { sound } from '../utils/audio';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, Zap, Target, Clock } from 'lucide-react';

interface MathChallengeModalProps {
  question: ExponentQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLimitSeconds: number; // 0 for unlimited
  onAnswer: (isCorrect: boolean) => void;
  onContinue: () => void;
}

export const MathChallengeModal: React.FC<MathChallengeModalProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeLimitSeconds,
  onAnswer,
  onContinue
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);

  // Timer countdown if configured by teacher
  useEffect(() => {
    if (timeLimitSeconds <= 0 || isAnswered) return;
    setTimeLeft(timeLimitSeconds);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto select wrong answer on timeout
          handleSelect(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimitSeconds, isAnswered, question]);

  // Keyboard shortcut listener for options (1, 2, 3, 4) or Enter to continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        if (e.key === '1' || e.key.toLowerCase() === 'a') handleSelect(0);
        else if (e.key === '2' || e.key.toLowerCase() === 'b') handleSelect(1);
        else if (e.key === '3' || e.key.toLowerCase() === 'c') handleSelect(2);
        else if (e.key === '4' || e.key.toLowerCase() === 'd') handleSelect(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          onContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, question]);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;

    const correct = idx === question.correctIndex;
    setSelectedIndex(idx);
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    onAnswer(correct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.4)] overflow-hidden">
        {/* Futuristic Top Header Bar */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-4 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs uppercase font-tech tracking-wider text-cyan-400 font-bold">
                TANTANGAN MATEMATIKA AIR FORCE
              </div>
              <div className="text-sm font-semibold text-slate-200 truncate">
                {question.topic}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {timeLimitSeconds > 0 && !isAnswered && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-mono-code font-bold ${
                timeLeft <= 5 
                  ? 'bg-red-950 border-red-500 text-red-400 animate-ping' 
                  : 'bg-slate-800 border-cyan-500/40 text-cyan-300'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-tech font-bold text-xs">
              SOAL {questionNumber} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Question Text & Expression */}
          <div className="text-center space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-300 font-tech text-base sm:text-lg">
              {question.questionText}
            </p>

            <div className="py-2 inline-block">
              <div className="text-3xl sm:text-4xl font-mono-code font-bold text-cyan-300 tracking-wider text-glow-cyan bg-slate-900/90 px-6 py-2.5 rounded-lg border border-cyan-500/50 shadow-inner">
                {question.mathExpression}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-tech flex items-center justify-center gap-1.5">
              <span>Sifat Kunci:</span>
              <span className="font-mono-code px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {question.ruleUsed}
              </span>
            </div>
          </div>

          {/* 4 Answer Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200 hover:border-cyan-400';

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
                } else if (idx === selectedIndex) {
                  btnStyle = 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
                } else {
                  btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`relative p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-left group ${btnStyle} ${
                    !isAnswered ? 'active:scale-98 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-md bg-slate-950/90 border border-slate-700 flex items-center justify-center font-tech font-bold text-xs text-cyan-400 group-hover:border-cyan-400">
                      {letter}
                    </span>
                    <span className="text-base sm:text-lg font-mono-code font-bold">
                      {option}
                    </span>
                  </div>

                  {isAnswered && idx === question.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedIndex && idx !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation Card (Shown after answering) */}
          {isAnswered && (
            <div className={`p-4 rounded-xl border animate-in slide-in-from-bottom-2 duration-300 ${
              isCorrect 
                ? 'bg-emerald-950/50 border-emerald-500/50' 
                : 'bg-red-950/50 border-red-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2 font-tech font-bold text-sm sm:text-base">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300">TARGET TERCAPAI! Sifat Berhasil Diterapkan (+100 PTS)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">COBA LAGI, PILOT! Pelajari Trik Matematikanya:</span>
                  </>
                )}
              </div>

              {/* Explanation breakdown */}
              <div className="mt-2 text-xs sm:text-sm text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="font-tech font-bold text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>PELAJARI TRIK MATEMATIKANYA:</span>
                </div>
                <p className="whitespace-pre-line font-mono-code text-xs leading-relaxed text-slate-200">
                  {question.explanation}
                </p>
              </div>

              {/* Reward status */}
              <div className="mt-3 flex items-center justify-between text-xs font-tech text-slate-400">
                <div className="flex items-center gap-1 text-cyan-300">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>{isCorrect ? 'Energi Serangan Maksimal Diaktifkan!' : 'Energi Pesawat Berkurang.'}</span>
                </div>

                <button
                  onClick={onContinue}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-tech font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <span>LANJUTKAN MISI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
