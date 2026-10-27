/**
 * MATH AIR FORCE: EXPONENT MISSION
 * Game Edukasi Pesawat Tempur Matematika SMK Fase E
 * 
 * Dikembangkan oleh: Suwandi, S.Pd.
 * Instansi: SMKN 4 Soppeng
 * Jenjang: SMK Kelas X | Fase E | Mata Pelajaran: Matematika
 * Materi: Sifat-Sifat Bilangan Berpangkat
 * 
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, ExponentQuestion, MissionConfig, TeacherSettings, StudentSessionRecord } from './types/game';
import { MISSIONS, DEFAULT_QUESTIONS, STORAGE_KEYS, loadQuestions, saveQuestions } from './data/questions';
import { sound } from './utils/audio';

// Components
import { TitleScreen } from './components/TitleScreen';
import { SetupScreen } from './components/SetupScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUDOverlay } from './components/HUDOverlay';
import { MathChallengeModal } from './components/MathChallengeModal';
import { ResultsScreen } from './components/ResultsScreen';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { TeacherModeModal } from './components/TeacherModeModal';
import { Play, Home, RotateCcw } from 'lucide-react';

export default function App() {
  // Navigation & Game State Machine
  const [gameState, setGameState] = useState<GameState>('MENU');

  // Cadet Profile
  const [studentName, setStudentName] = useState<string>('Kadet Pilot');
  const [studentClass, setStudentClass] = useState<string>('X TJKT 1');
  const [currentMissionId, setCurrentMissionId] = useState<number>(1);

  // Questions Bank
  const [questions, setQuestions] = useState<ExponentQuestion[]>(loadQuestions);

  // Teacher Settings
  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      questionsPerMission: 4,
      initialLives: 3,
      wrongPenaltyEnergy: 25,
      enemySpeedMultiplier: 1.0,
      questionTimerSeconds: 0, // unlimited by default
      soundEnabled: true,
      soundVolume: 0.5
    };
  });

  // Student Session Records
  const [studentRecords, setStudentRecords] = useState<StudentSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Touch device detection & manual override
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isTouchForced, setIsTouchForced] = useState<boolean>(false);
  const [virtualDirection, setVirtualDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [virtualFireTrigger, setVirtualFireTrigger] = useState<number>(0);

  // Active Mission State
  const [hudStats, setHudStats] = useState({
    health: 3,
    maxHealth: 3,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    bossHealth: null as number | null,
    bossMaxHealth: null as number | null
  });

  // Question Challenge Trigger State
  const [activeQuestion, setActiveQuestion] = useState<ExponentQuestion | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(1);
  const [questionsAnsweredInSession, setQuestionsAnsweredInSession] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState<number>(0);

  // Last Answer Result to trigger super blast / penalty in GameCanvas
  const [lastAnswerResult, setLastAnswerResult] = useState<{ isCorrect: boolean; timestamp: number } | null>(null);

  // Match session timer
  const sessionStartTimeRef = useRef<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [enemiesDestroyedCount, setEnemiesDestroyedCount] = useState<number>(0);
  const [isVictoryResult, setIsVictoryResult] = useState<boolean>(false);

  // Detect touch capability on mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    // Load persisted cadet info
    try {
      const lastPlayer = localStorage.getItem(STORAGE_KEYS.LAST_PLAYER);
      if (lastPlayer) {
        const parsed = JSON.parse(lastPlayer);
        if (parsed.name) setStudentName(parsed.name);
        if (parsed.class) setStudentClass(parsed.class);
      }
    } catch {
      // ignore
    }
  }, []);

  const activeMission = MISSIONS.find(m => m.id === currentMissionId) || MISSIONS[0];

  // Start mission handler
  const handleLaunchMission = (name: string, sClass: string, missionId: number) => {
    setStudentName(name);
    setStudentClass(sClass);
    setCurrentMissionId(missionId);
    setLastAnswerResult(null);

    // Save cadet profile
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYER, JSON.stringify({ name, class: sClass }));
    } catch {
      // ignore
    }

    // Reset session trackers
    sessionStartTimeRef.current = Date.now();
    setQuestionsAnsweredInSession(0);
    setCorrectAnswersCount(0);
    setWrongAnswersCount(0);
    setEnemiesDestroyedCount(0);
    setGameState('PLAYING');
  };

  // Math question triggered along flight path
  const handleTriggerQuestion = (qIndex: number) => {
    // Filter questions available for current mission
    const missionQuestions = questions.filter(q => q.missionId === currentMissionId);
    const pool = missionQuestions.length > 0 ? missionQuestions : DEFAULT_QUESTIONS;
    const selectedQ = pool[(qIndex - 1) % pool.length];

    setActiveQuestion(selectedQ);
    setActiveQuestionIndex(qIndex);
    setGameState('QUESTION_ACTIVE');
  };

  // Math question answered
  const handleQuestionAnswer = (isCorrect: boolean) => {
    setQuestionsAnsweredInSession(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      setWrongAnswersCount(prev => prev + 1);
    }

    // Forward reward/blast to GameCanvas via state
    setLastAnswerResult({ isCorrect, timestamp: Date.now() });
  };

  const handleContinueAfterQuestion = () => {
    setActiveQuestion(null);
    setGameState('PLAYING');
  };

  // Record completed mission session to local storage
  const recordSession = (victory: boolean, finalScore: number, destroyed: number) => {
    const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    setSessionDuration(duration);
    setEnemiesDestroyedCount(destroyed);
    setIsVictoryResult(victory);

    const totalQ = questionsAnsweredInSession || 1;
    const acc = Math.round((correctAnswersCount / totalQ) * 100);

    let starRating = 1;
    if (victory) {
      if (acc >= 85) starRating = 3;
      else if (acc >= 65) starRating = 2;
    }

    const newRecord: StudentSessionRecord = {
      id: `rec-${Date.now()}`,
      studentName: studentName || 'Kadet Pilot',
      studentClass: studentClass || 'SMK KELAS X',
      missionId: currentMissionId,
      missionName: activeMission.title,
      score: finalScore,
      totalQuestions: totalQ,
      correctCount: correctAnswersCount,
      wrongCount: wrongAnswersCount,
      accuracy: acc,
      durationSeconds: duration,
      enemiesDestroyed: destroyed,
      stars: starRating,
      timestamp: new Date().toLocaleString('id-ID')
    };

    const updatedRecords = [newRecord, ...studentRecords];
    setStudentRecords(updatedRecords);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updatedRecords));
    } catch {
      // ignore
    }

    setGameState('LEVEL_COMPLETE');
  };

  const handleMissionVictory = (finalScore: number, destroyed: number) => {
    recordSession(true, finalScore, destroyed);
  };

  const handleMissionDefeat = (finalScore: number, destroyed: number) => {
    recordSession(false, finalScore, destroyed);
  };

  // Retry same mission
  const handleRetryMission = () => {
    handleLaunchMission(studentName, studentClass, currentMissionId);
  };

  // Advance to next mission
  const handleNextMission = () => {
    const nextId = currentMissionId + 1;
    if (nextId <= MISSIONS.length) {
      handleLaunchMission(studentName, studentClass, nextId);
    } else {
      setGameState('MENU');
    }
  };

  const handleClearRecords = () => {
    setStudentRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#030712] overflow-hidden select-none">
      {/* 1. Title Screen */}
      {gameState === 'MENU' && (
        <TitleScreen
          onStartGame={() => setGameState('SETUP')}
          onOpenGuide={() => setGameState('GUIDE')}
          onOpenSettings={() => setGameState('SETTINGS')}
          onOpenTeacherMode={() => setGameState('TEACHER_MODE')}
        />
      )}

      {/* 2. Setup Screen (Cadet Name, Class & Mission Selector) */}
      {gameState === 'SETUP' && (
        <SetupScreen
          initialStudentName={studentName}
          initialStudentClass={studentClass}
          onLaunchMission={handleLaunchMission}
          onBackToMenu={() => setGameState('MENU')}
        />
      )}

      {/* 3. Gameplay Canvas & Overlays */}
      {(gameState === 'PLAYING' || gameState === 'QUESTION_ACTIVE' || gameState === 'PAUSED') && (
        <div className="relative w-full h-full">
          <GameCanvas
            mission={activeMission}
            settings={teacherSettings}
            isPaused={gameState !== 'PLAYING'}
            lastAnswerResult={lastAnswerResult}
            onUpdateHUD={setHudStats}
            onTriggerQuestion={handleTriggerQuestion}
            onMissionVictory={handleMissionVictory}
            onMissionDefeat={handleMissionDefeat}
            virtualDirection={virtualDirection}
            virtualFireTrigger={virtualFireTrigger}
          />

          <HUDOverlay
            score={hudStats.score}
            missionCode={activeMission.code}
            missionTitle={activeMission.title}
            health={hudStats.health}
            maxHealth={hudStats.maxHealth}
            energy={hudStats.energy}
            maxEnergy={hudStats.maxEnergy}
            currentQuestionIndex={activeQuestionIndex}
            totalQuestions={teacherSettings.questionsPerMission}
            bossHealth={hudStats.bossHealth}
            bossMaxHealth={hudStats.bossMaxHealth}
            bossName={activeMission.bossName}
            studentName={studentName}
            studentClass={studentClass}
            isPaused={gameState === 'PAUSED'}
            onTogglePause={() => {
              sound.playClick();
              setGameState(prev => (prev === 'PAUSED' ? 'PLAYING' : 'PAUSED'));
            }}
            onFireTouch={() => setVirtualFireTrigger(prev => prev + 1)}
            onDirectionTouch={dir => setVirtualDirection(dir)}
            isTouchDevice={isTouchDevice || isTouchForced}
          />
        </div>
      )}

      {/* 4. Math Challenge Modal (When encountering an Exponent checkpoint) */}
      {gameState === 'QUESTION_ACTIVE' && activeQuestion && (
        <MathChallengeModal
          question={activeQuestion}
          questionNumber={activeQuestionIndex}
          totalQuestions={teacherSettings.questionsPerMission}
          timeLimitSeconds={teacherSettings.questionTimerSeconds}
          onAnswer={handleQuestionAnswer}
          onContinue={handleContinueAfterQuestion}
        />
      )}

      {/* 5. In-Game Pause Menu */}
      {gameState === 'PAUSED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <h2 className="text-2xl font-tech font-bold text-yellow-300 uppercase tracking-widest">
              MISI DIJEDA
            </h2>
            <p className="text-xs text-slate-300 font-tech">
              Pesawat tempur berada dalam posisi melayang aman.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setGameState('PLAYING');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-tech font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LANJUTKAN MISI</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  handleRetryMission();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-tech font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ULANGI MISI</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setGameState('MENU');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-tech font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>KEMBALI KE MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Post-Mission Results Screen */}
      {(gameState === 'LEVEL_COMPLETE' || gameState === 'GAME_OVER') && (
        <ResultsScreen
          isVictory={isVictoryResult}
          score={hudStats.score}
          missionId={currentMissionId}
          studentName={studentName}
          studentClass={studentClass}
          totalQuestions={questionsAnsweredInSession || 1}
          correctCount={correctAnswersCount}
          wrongCount={wrongAnswersCount}
          accuracy={Math.round((correctAnswersCount / (questionsAnsweredInSession || 1)) * 100)}
          durationSeconds={sessionDuration}
          enemiesDestroyed={enemiesDestroyedCount}
          stars={
            isVictoryResult 
              ? Math.round((correctAnswersCount / (questionsAnsweredInSession || 1)) * 100) >= 85 ? 3 : 2 
              : 1
          }
          onRetryMission={handleRetryMission}
          onNextMission={handleNextMission}
          onBackToMenu={() => setGameState('MENU')}
          onOpenTeacherMode={() => setGameState('TEACHER_MODE')}
        />
      )}

      {/* 7. Panduan Bermain Modal */}
      {gameState === 'GUIDE' && (
        <GuideModal onClose={() => setGameState('MENU')} />
      )}

      {/* 8. Settings Modal */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          onClose={() => setGameState('MENU')}
          isTouchForced={isTouchForced}
          onToggleTouch={setIsTouchForced}
        />
      )}

      {/* 9. Teacher Mode Modal */}
      {gameState === 'TEACHER_MODE' && (
        <TeacherModeModal
          questions={questions}
          onUpdateQuestions={setQuestions}
          settings={teacherSettings}
          onUpdateSettings={setTeacherSettings}
          records={studentRecords}
          onClearRecords={handleClearRecords}
          onClose={() => setGameState('MENU')}
        />
      )}
    </div>
  );
}
