import React, { useState } from 'react';
import { MISSIONS } from '../data/questions';
import { sound } from '../utils/audio';
import { Plane, ChevronRight, User, ShieldAlert, Award, ArrowLeft, Crosshair, BookOpen } from 'lucide-react';

interface SetupScreenProps {
  initialStudentName: string;
  initialStudentClass: string;
  onLaunchMission: (studentName: string, studentClass: string, missionId: number) => void;
  onBackToMenu: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialStudentName,
  initialStudentClass,
  onLaunchMission,
  onBackToMenu
}) => {
  const [studentName, setStudentName] = useState(initialStudentName || '');
  const [studentClass, setStudentClass] = useState(initialStudentClass || '');
  const [selectedMissionId, setSelectedMissionId] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedMission = MISSIONS.find(m => m.id === selectedMissionId) || MISSIONS[0];

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Harap masukkan Nama Kadet / Murid terlebih dahulu!');
      sound.playWrong();
      return;
    }
    sound.playClick();
    onLaunchMission(studentName.trim(), studentClass.trim() || 'SMK KELAS X', selectedMissionId);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#030712] overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
      {/* Background grid */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_20%] from-blue-950/40 via-slate-950/80 to-[#030712] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => {
            sound.playClick();
            onBackToMenu();
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition flex items-center gap-2 font-tech text-xs sm:text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE MENU</span>
        </button>

        <div className="text-right">
          <div className="text-xs uppercase font-tech font-bold text-cyan-400">
            BRIEFING MISI PERSIAPAN
          </div>
          <div className="text-sm font-bold text-white font-tech">
            MATH AIR FORCE: EXPONENT MISSION
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        {/* Left Column: Cadet Profile & Mission Launch (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 text-cyan-400">
              <User className="w-5 h-5" />
              <h2 className="text-lg font-tech font-bold tracking-wider uppercase text-white">
                PROFIL PILOT TEMPUR
              </h2>
            </div>

            <form onSubmit={handleLaunch} className="space-y-4">
              <div>
                <label className="block text-xs font-tech font-bold text-slate-300 uppercase mb-1">
                  Nama Kadet / Murid <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => {
                    setStudentName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Contoh: Muhammad Rian"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white font-tech text-base outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-tech font-bold text-slate-300 uppercase mb-1">
                  Kelas / Kode Pemain
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={e => setStudentClass(e.target.value)}
                  placeholder="Contoh: X TJKT 1 / SMKN 4 Soppeng"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white font-tech text-base outline-none transition"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-tech">
                  {errorMsg}
                </div>
              )}

              {/* Developer Attribution Card */}
              <div className="pt-2">
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs font-tech space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>DEDIKASI PENDIDIKAN</span>
                  </div>
                  <p className="text-slate-300">
                    Dikembangkan oleh <strong>Suwandi, S.Pd.</strong>
                  </p>
                  <p className="text-slate-400">
                    SMKN 4 Soppeng &bull; Matematika SMK Fase E
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-white font-tech font-bold text-lg tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-cyan-300 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Plane className="w-5 h-5 fill-white" />
                <span>LUNCURKAN PESAWAT</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Mission Selection & Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-tech font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              PILIH ZONA MISI PERTEMPURAN
            </h2>
            <span className="text-xs text-slate-400 font-tech">3 Misi Bertingkat</span>
          </div>

          {/* Mission Cards Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MISSIONS.map(m => {
              const isSelected = m.id === selectedMissionId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedMissionId(m.id);
                  }}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="text-[10px] font-mono-code font-bold text-cyan-400 mb-1">
                    {m.code}
                  </div>
                  <div className="font-tech font-bold text-sm sm:text-base text-white">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {m.subtitle}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Mission Briefing Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-lg backdrop-blur-xs space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono-code text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                    {selectedMission.code}
                  </span>
                  <h3 className="text-xl font-tech font-bold text-white mt-1">
                    {selectedMission.title} &mdash; <span className="text-cyan-300 font-normal">{selectedMission.subtitle}</span>
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-tech text-slate-400">TARGET SKOR</div>
                  <div className="text-base font-mono-code font-bold text-yellow-300">
                    {selectedMission.targetScore} PTS
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-tech">
                {selectedMission.briefing}
              </p>
            </div>

            {/* Sifat-Sifat yang Diuji */}
            <div className="space-y-2">
              <div className="text-xs font-tech font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>SIFAT BILANGAN BERPANGKAT YANG DIUJI:</span>
              </div>
              <ul className="space-y-1.5">
                {selectedMission.topicsCovered.map((topic, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs sm:text-sm font-mono-code text-slate-200 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boss Threat Profile */}
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-xl flex items-center justify-between text-xs font-tech">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-900/60 border border-red-500/60 flex items-center justify-center text-red-300">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-red-400 font-bold uppercase">TARGET BOSS AKHIR MISI</div>
                  <div className="text-white font-bold">{selectedMission.bossName} ({selectedMission.bossSubtitle})</div>
                </div>
              </div>
              <div className="text-right font-mono-code text-red-300 font-bold">
                HP: {selectedMission.bossMaxHealth}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 font-tech mt-6">
        Dikembangkan oleh Suwandi, S.Pd. &bull; SMKN 4 Soppeng &bull; Matematika SMK Fase E
      </div>
    </div>
  );
};
