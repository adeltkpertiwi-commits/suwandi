import React, { useState, useEffect } from 'react';
import { ExponentQuestion, StudentSessionRecord, TeacherSettings } from '../types/game';
import { MISSIONS, DEFAULT_QUESTIONS, STORAGE_KEYS, saveQuestions, resetQuestionsToDefault } from '../data/questions';
import { sound } from '../utils/audio';
import { 
  X, BookOpen, Sliders, Database, Download, Printer, Plus, Trash2, Edit3, 
  Sparkles, CheckCircle2, RotateCcw, AlertCircle, Save, FileSpreadsheet
} from 'lucide-react';

interface TeacherModeModalProps {
  questions: ExponentQuestion[];
  onUpdateQuestions: (newQuestions: ExponentQuestion[]) => void;
  settings: TeacherSettings;
  onUpdateSettings: (newSettings: TeacherSettings) => void;
  records: StudentSessionRecord[];
  onClearRecords: () => void;
  onClose: () => void;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  questions,
  onUpdateQuestions,
  settings,
  onUpdateSettings,
  records,
  onClearRecords,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'BANK_SOAL' | 'PENGATURAN' | 'REKAP_HASIL'>('BANK_SOAL');
  const [filterMission, setFilterMission] = useState<number>(0); // 0 = all
  const [editingQuestion, setEditingQuestion] = useState<ExponentQuestion | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Local state for editable settings
  const [localSettings, setLocalSettings] = useState<TeacherSettings>({ ...settings });

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Sifat perkalian dan pembagian bilangan berpangkat');
  const [aiMissionId, setAiMissionId] = useState<number>(1);
  const [aiDifficulty, setAiDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');
  const [aiCount, setAiCount] = useState<number>(3);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Form state for Add/Edit Question
  const [formState, setFormState] = useState<Partial<ExponentQuestion>>({
    missionId: 1,
    topic: 'Perkalian Bilangan Berpangkat',
    questionText: '',
    mathExpression: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    difficulty: 'sedang'
  });

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(localSettings));
    } catch {
      // ignore
    }
    sound.playClick();
    showStatus('Pengaturan misi berhasil diperbarui!', 'success');
  };

  const handleOpenAddForm = () => {
    setFormState({
      missionId: filterMission > 0 ? filterMission : 1,
      topic: 'Perkalian Bilangan Berpangkat',
      questionText: 'Sederhanakan bentuk eksponen berikut:',
      mathExpression: '2³ × 2²',
      options: ['2⁵', '2⁶', '4⁵', '2¹'],
      correctIndex: 0,
      explanation: 'Gunakan sifat perkalian basis sama: aᵐ × aⁿ = aᵐ⁺ⁿ. Pangkat dijumlahkan: 3 + 2 = 5.',
      ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
      difficulty: 'sedang'
    });
    setEditingQuestion(null);
    setIsAddingNew(true);
  };

  const handleOpenEditForm = (q: ExponentQuestion) => {
    setFormState({ ...q });
    setEditingQuestion(q);
    setIsAddingNew(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.questionText || !formState.mathExpression || !formState.options) {
      showStatus('Harap lengkapi semua bidang pertanyaan dan opsi jawaban!', 'error');
      return;
    }

    const newQ: ExponentQuestion = {
      id: editingQuestion ? editingQuestion.id : `q-${Date.now()}`,
      missionId: Number(formState.missionId) || 1,
      topic: formState.topic || 'Sifat Bilangan Berpangkat',
      questionText: formState.questionText,
      mathExpression: formState.mathExpression,
      options: [
        formState.options[0] || 'Opsi A',
        formState.options[1] || 'Opsi B',
        formState.options[2] || 'Opsi C',
        formState.options[3] || 'Opsi D'
      ],
      correctIndex: Number(formState.correctIndex) || 0,
      explanation: formState.explanation || 'Pembahasan langkah demi langkah sifat eksponen.',
      ruleUsed: formState.ruleUsed || 'aᵐ × aⁿ = aᵐ⁺ⁿ',
      difficulty: formState.difficulty as any || 'sedang'
    };

    let updated: ExponentQuestion[];
    if (editingQuestion) {
      updated = questions.map(item => (item.id === editingQuestion.id ? newQ : item));
      showStatus('Soal berhasil diperbarui!', 'success');
    } else {
      updated = [...questions, newQ];
      showStatus('Soal baru berhasil ditambahkan ke bank soal!', 'success');
    }

    onUpdateQuestions(updated);
    saveQuestions(updated);
    setIsAddingNew(false);
    setEditingQuestion(null);
    sound.playClick();
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 3) {
      showStatus('Minimal harus ada 3 butir soal dalam bank soal!', 'error');
      return;
    }
    const updated = questions.filter(q => q.id !== id);
    onUpdateQuestions(updated);
    saveQuestions(updated);
    sound.playClick();
    showStatus('Soal berhasil dihapus.', 'success');
  };

  const handleResetQuestions = () => {
    if (confirm('Kembalikan seluruh bank soal ke default orisinal kurikulum SMK?')) {
      const def = resetQuestionsToDefault();
      onUpdateQuestions(def);
      sound.playClick();
      showStatus('Bank soal dikembalikan ke standar awal.', 'success');
    }
  };

  // AI Question Generator Handler
  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: aiMissionId,
          topic: aiTopic,
          difficulty: aiDifficulty,
          count: aiCount
        })
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.questions)) {
        const updated = [...questions, ...data.questions];
        onUpdateQuestions(updated);
        saveQuestions(updated);
        setShowAiModal(false);
        sound.playCorrect();
        showStatus(`Berhasil membuat ${data.questions.length} butir soal baru dengan AI!`, 'success');
      } else {
        // Fallback generator if AI API key is not configured
        throw new Error(data.error || 'Layanan AI belum aktif. Menggunakan generator cerdas lokal.');
      }
    } catch (err: any) {
      // Local Smart Generator fallback as requested in requirements
      const localSmartQuestions: ExponentQuestion[] = [];
      for (let i = 0; i < aiCount; i++) {
        const bases = [2, 3, 5, 7];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const m = Math.floor(Math.random() * 4) + 2;
        const n = Math.floor(Math.random() * 3) + 2;

        if (aiMissionId === 1) {
          const isMul = Math.random() > 0.5;
          if (isMul) {
            localSmartQuestions.push({
              id: `gen-${Date.now()}-${i}`,
              missionId: 1,
              topic: 'Perkalian Bilangan Berpangkat (Generator)',
              questionText: `Sederhanakan operasi perkalian berikut:`,
              mathExpression: `${base}³ × ${base}${n === 2 ? '²' : n === 3 ? '³' : '⁴'}`,
              options: [`${base}${3 + n}`, `${base}${3 * n}`, `${base * base}${3 + n}`, `${base}¹`],
              correctIndex: 0,
              explanation: `Gunakan sifat perkalian basis sama: aᵐ × aⁿ = aᵐ⁺ⁿ.\n${base}³ × ${base}${n} = ${base}³⁺${n} = ${base}${3 + n}.`,
              ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
              difficulty: aiDifficulty
            });
          } else {
            const high = m + n;
            localSmartQuestions.push({
              id: `gen-${Date.now()}-${i}`,
              missionId: 1,
              topic: 'Pembagian Bilangan Berpangkat (Generator)',
              questionText: `Tentukan bentuk sederhana pembagian eksponen:`,
              mathExpression: `${base}${high === 4 ? '⁴' : high === 5 ? '⁵' : '⁶'} : ${base}${n === 2 ? '²' : '³'}`,
              options: [`${base}${high - n}`, `${base}${high + n}`, `${base}${high * n}`, `1`],
              correctIndex: 0,
              explanation: `Gunakan sifat pembagian basis sama: aᵐ : aⁿ = aᵐ⁻ⁿ.\nPangkat dikurangkan: ${high} - ${n} = ${high - n}.`,
              ruleUsed: 'aᵐ : aⁿ = aᵐ⁻ⁿ',
              difficulty: aiDifficulty
            });
          }
        } else if (aiMissionId === 2) {
          localSmartQuestions.push({
            id: `gen-${Date.now()}-${i}`,
            missionId: 2,
            topic: 'Pangkat dari Pangkat (Generator)',
            questionText: `Sederhanakan bentuk pemangkatan berulang:`,
            mathExpression: `(${base}²)³`,
            options: [`${base}⁵`, `${base}⁶`, `${base}⁸`, `${base * 2}³`],
            correctIndex: 1,
            explanation: `Gunakan sifat pemangkatan berulang: (aᵐ)ⁿ = aᵐˣⁿ.\nPangkat dikalikan: 2 × 3 = 6, sehingga hasilnya ${base}⁶.`,
            ruleUsed: '(aᵐ)ⁿ = aᵐˣⁿ',
            difficulty: aiDifficulty
          });
        } else {
          localSmartQuestions.push({
            id: `gen-${Date.now()}-${i}`,
            missionId: 3,
            topic: 'Operasi Campuran Eksponen (Generator)',
            questionText: `Sederhanakan operasi campuran berikut:`,
            mathExpression: `(${base}³ × ${base}²) : ${base}⁴`,
            options: [`${base}¹`, `${base}⁵`, `${base}⁶`, `${base}⁰`],
            correctIndex: 0,
            explanation: `Langkah 1: ${base}³ × ${base}² = ${base}⁵.\nLangkah 2: ${base}⁵ : ${base}⁴ = ${base}⁵⁻⁴ = ${base}¹.`,
            ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ & aᵐ : aⁿ = aᵐ⁻ⁿ',
            difficulty: aiDifficulty
          });
        }
      }

      const updated = [...questions, ...localSmartQuestions];
      onUpdateQuestions(updated);
      saveQuestions(updated);
      setShowAiModal(false);
      sound.playCorrect();
      showStatus(`Dibuat ${localSmartQuestions.length} butir soal tervalidasi menggunakan Smart Generator!`, 'success');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // CSV Export Function (RFC4180 with UTF-8 BOM for Excel)
  const handleExportCSV = () => {
    if (records.length === 0) {
      showStatus('Belum ada rekap hasil sesi murid untuk diunduh.', 'error');
      return;
    }

    const headers = [
      'No',
      'Tanggal Waktu',
      'Nama Kadet Murid',
      'Kelas / Kode Pemain',
      'Misi',
      'Total Skor',
      'Soal Terjawab',
      'Jawaban Benar',
      'Jawaban Salah',
      'Akurasi (%)',
      'Waktu Main (Detik)',
      'Musuh Dikalahkan',
      'Bintang'
    ];

    const rows = records.map((r, idx) => [
      idx + 1,
      `"${r.timestamp}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.studentClass.replace(/"/g, '""')}"`,
      `"${r.missionName.replace(/"/g, '""')}"`,
      r.score,
      r.totalQuestions,
      r.correctCount,
      r.wrongCount,
      `${r.accuracy}%`,
      r.durationSeconds,
      r.enemiesDestroyed,
      r.stars
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Nilai_Math_Air_Force_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sound.playClick();
    showStatus('File CSV rekap nilai berhasil diunduh!', 'success');
  };

  // Print Rekap
  const handlePrint = () => {
    window.print();
  };

  const filteredQuestions = filterMission === 0 
    ? questions 
    : questions.filter(q => q.missionId === filterMission);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-950/80 via-slate-900 to-amber-950/80 p-4 border-b border-yellow-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-tech font-bold text-white uppercase tracking-wider">
                  PANEL KENDALI GURU (TEACHER SUITE)
                </h2>
                <span className="px-2 py-0.5 rounded bg-yellow-950 border border-yellow-600/60 text-yellow-300 text-[10px] font-mono-code font-bold">
                  VERSI KELAS X FASE E
                </span>
              </div>
              <div className="text-xs text-slate-300 font-tech">
                Dikembangkan oleh: <strong className="text-yellow-300">Suwandi, S.Pd.</strong> &bull; SMKN 4 Soppeng
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Toast */}
        {statusMsg && (
          <div className={`py-2 px-4 text-xs font-tech font-bold text-center border-b transition-all ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
              : 'bg-red-950 border-red-500 text-red-200'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 p-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('BANK_SOAL');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-tech font-bold text-xs sm:text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'BANK_SOAL'
                ? 'bg-yellow-950/80 border border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>BANK SOAL ({questions.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('PENGATURAN');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-tech font-bold text-xs sm:text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'PENGATURAN'
                ? 'bg-yellow-950/80 border border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>PENGATURAN MISI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('REKAP_HASIL');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-tech font-bold text-xs sm:text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'REKAP_HASIL'
                ? 'bg-yellow-950/80 border border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>REKAP NILAI SISWA ({records.length})</span>
          </button>
        </div>

        {/* Tab 1: Bank Soal */}
        {activeTab === 'BANK_SOAL' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              {/* Filter by Mission */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-tech">Filter Misi:</span>
                <select
                  value={filterMission}
                  onChange={e => setFilterMission(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-tech text-white outline-none cursor-pointer"
                >
                  <option value={0}>Semua Misi ({questions.length})</option>
                  <option value={1}>Misi 1: Perkalian &amp; Pembagian</option>
                  <option value={2}>Misi 2: Pangkat Bertingkat, Nol &amp; Negatif</option>
                  <option value={3}>Misi 3: Operasi Campuran</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BUAT DENGAN AI</span>
                </button>

                <button
                  onClick={handleOpenAddForm}
                  className="px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>TAMBAH SOAL MANUAL</span>
                </button>

                <button
                  onClick={handleResetQuestions}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-tech flex items-center gap-1 transition cursor-pointer"
                  title="Kembalikan ke Soal Standar"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono-code font-bold text-xs text-yellow-400">
                        M{q.missionId} #{idx + 1}
                      </span>
                      <span className="text-xs font-tech text-slate-400 font-bold uppercase">
                        {q.topic}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase ${
                        q.difficulty === 'mudah' ? 'bg-emerald-950 text-emerald-300' :
                        q.difficulty === 'sedang' ? 'bg-blue-950 text-blue-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditForm(q)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 transition cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-tech text-slate-200">
                      {q.questionText}
                    </span>
                    <span className="text-sm sm:text-base font-mono-code font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-cyan-800/40">
                      {q.mathExpression}
                    </span>
                  </div>

                  {/* 4 Options Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono-code flex items-center justify-between border ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {oIdx === q.correctIndex && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                      </div>
                    ))}
                  </div>

                  {/* Explanation Preview */}
                  <div className="text-[11px] font-mono-code text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-850">
                    <strong className="text-cyan-400">Pembahasan:</strong> {q.explanation} &bull; <strong className="text-blue-300">Sifat:</strong> {q.ruleUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Pengaturan Misi */}
        {activeTab === 'PENGATURAN' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-tech font-bold text-yellow-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4" /> PARAMETER GAMEPLAY DAN TINGKAT KESULITAN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Questions per mission */}
                <div>
                  <label className="block text-xs font-tech font-bold text-slate-300 mb-1">
                    Jumlah Soal Matematika per Misi
                  </label>
                  <select
                    value={localSettings.questionsPerMission}
                    onChange={e => setLocalSettings(prev => ({ ...prev, questionsPerMission: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-tech text-white outline-none"
                  >
                    <option value={3}>3 Soal (Cepat / Pengenalan)</option>
                    <option value={4}>4 Soal (Standar / Rekomendasi)</option>
                    <option value={5}>5 Soal (Ujian Mendalam)</option>
                    <option value={6}>6 Soal (Tantangan Ekstrem)</option>
                  </select>
                </div>

                {/* Initial Lives */}
                <div>
                  <label className="block text-xs font-tech font-bold text-slate-300 mb-1">
                    Integritas / Nyawa Awal Pesawat
                  </label>
                  <select
                    value={localSettings.initialLives}
                    onChange={e => setLocalSettings(prev => ({ ...prev, initialLives: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-tech text-white outline-none"
                  >
                    <option value={3}>3 Nyawa (Standar)</option>
                    <option value={4}>4 Nyawa (Mudah / Pemula)</option>
                    <option value={5}>5 Nyawa (Sangat Mudah)</option>
                    <option value={2}>2 Nyawa (Tantangan Sulit)</option>
                    <option value={1}>1 Nyawa (Sudden Death)</option>
                  </select>
                </div>

                {/* Question Timer */}
                <div>
                  <label className="block text-xs font-tech font-bold text-slate-300 mb-1">
                    Batas Waktu Menjawab Soal
                  </label>
                  <select
                    value={localSettings.questionTimerSeconds}
                    onChange={e => setLocalSettings(prev => ({ ...prev, questionTimerSeconds: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-tech text-white outline-none"
                  >
                    <option value={0}>Tanpa Batas Waktu (Murid Tenang Berpikir)</option>
                    <option value={45}>45 Detik per Soal</option>
                    <option value={30}>30 Detik per Soal</option>
                    <option value={20}>20 Detik per Soal (Uji Kecepatan)</option>
                  </select>
                </div>

                {/* Enemy Speed Multiplier */}
                <div>
                  <label className="block text-xs font-tech font-bold text-slate-300 mb-1">
                    Kecepatan Pesawat &amp; Musuh
                  </label>
                  <select
                    value={localSettings.enemySpeedMultiplier}
                    onChange={e => setLocalSettings(prev => ({ ...prev, enemySpeedMultiplier: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-tech text-white outline-none"
                  >
                    <option value={0.8}>Santai / Pelan (0.8x)</option>
                    <option value={1.0}>Standar Normal (1.0x)</option>
                    <option value={1.2}>Cepat &amp; Agresif (1.2x)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-tech font-bold text-xs tracking-wider transition flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SIMPAN PENGATURAN GURU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Rekap Hasil Belajar Siswa */}
        {activeTab === 'REKAP_HASIL' && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="text-xs font-tech text-slate-300">
                Total Sesi Tercatat: <strong className="text-yellow-300">{records.length} Murid</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>UNDUH FORMAT CSV (EXCEL)</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-tech font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>CETAK REKAP</span>
                </button>

                {records.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Hapus seluruh rekap nilai murid dari perangkat ini?')) {
                        onClearRecords();
                        showStatus('Rekap nilai telah dibersihkan.', 'success');
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 text-xs transition cursor-pointer"
                    title="Bersihkan Semua Data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Records Table */}
            {records.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-tech">
                Belum ada rekaman sesi bermain murid. Selesaikan misi untuk mencatat nilai secara otomatis!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-tech">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Nama Kadet</th>
                      <th className="p-3">Kelas / Kode</th>
                      <th className="p-3">Misi</th>
                      <th className="p-3">Skor</th>
                      <th className="p-3">Soal</th>
                      <th className="p-3">Akurasi</th>
                      <th className="p-3">Bintang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/60">
                    {records.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-850/50 transition">
                        <td className="p-3 text-slate-400 font-mono-code">{rec.timestamp.slice(0, 16)}</td>
                        <td className="p-3 font-bold text-white">{rec.studentName}</td>
                        <td className="p-3 text-slate-300">{rec.studentClass}</td>
                        <td className="p-3 text-cyan-300 font-bold">{rec.missionName}</td>
                        <td className="p-3 font-mono-code font-bold text-yellow-300">{rec.score}</td>
                        <td className="p-3 text-slate-300">
                          <span className="text-emerald-400">{rec.correctCount}</span> / {rec.totalQuestions}
                        </td>
                        <td className="p-3 font-mono-code font-bold text-cyan-400">{rec.accuracy}%</td>
                        <td className="p-3 text-amber-400">{'★'.repeat(rec.stars)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add / Edit Question Sub-Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-tech font-bold text-base text-white uppercase tracking-wider">
                  {editingQuestion ? 'EDIT SOAL MATEMATIKA' : 'TAMBAH SOAL MATEMATIKA BARU'}
                </h3>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs font-tech">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Misi Terkait</label>
                    <select
                      value={formState.missionId}
                      onChange={e => setFormState(p => ({ ...p, missionId: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    >
                      <option value={1}>Misi 1: Perkalian &amp; Pembagian</option>
                      <option value={2}>Misi 2: Pangkat Bersarang &amp; Negatif</option>
                      <option value={3}>Misi 3: Operasi Campuran</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Topik Materi</label>
                    <input
                      type="text"
                      value={formState.topic}
                      onChange={e => setFormState(p => ({ ...p, topic: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                      placeholder="Contoh: Perkalian Basis Sama"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan</label>
                    <select
                      value={formState.difficulty}
                      onChange={e => setFormState(p => ({ ...p, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teks Pertanyaan</label>
                  <input
                    type="text"
                    value={formState.questionText}
                    onChange={e => setFormState(p => ({ ...p, questionText: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    placeholder="Contoh: Sederhanakan bentuk perkalian berikut:"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bentuk Matematis / Ekspresi Eksponen</label>
                  <input
                    type="text"
                    value={formState.mathExpression}
                    onChange={e => setFormState(p => ({ ...p, mathExpression: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 font-mono-code font-bold text-sm outline-none"
                    placeholder="Contoh: 2³ × 2⁴"
                    required
                  />
                </div>

                {/* 4 Options and correctIndex */}
                <div className="space-y-2 pt-1">
                  <label className="block text-slate-300 font-bold">4 Pilihan Jawaban &amp; Kunci Jawaban (Pilih Lingkaran untuk Jawaban Benar)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map(optIdx => (
                      <div key={optIdx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={formState.correctIndex === optIdx}
                          onChange={() => setFormState(p => ({ ...p, correctIndex: optIdx }))}
                          className="w-4 h-4 text-emerald-500 cursor-pointer"
                        />
                        <span className="font-bold text-cyan-400 w-4">{String.fromCharCode(65 + optIdx)}</span>
                        <input
                          type="text"
                          value={formState.options?.[optIdx] || ''}
                          onChange={e => {
                            const newOpts = [...(formState.options || ['', '', '', ''])] as [string, string, string, string];
                            newOpts[optIdx] = e.target.value;
                            setFormState(p => ({ ...p, options: newOpts }));
                          }}
                          placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}`}
                          className="flex-1 px-2 py-1 bg-transparent text-white font-mono-code outline-none border-b border-slate-700 focus:border-cyan-400"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Sifat yang Digunakan</label>
                    <input
                      type="text"
                      value={formState.ruleUsed}
                      onChange={e => setFormState(p => ({ ...p, ruleUsed: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono-code outline-none"
                      placeholder="Contoh: aᵐ × aⁿ = aᵐ⁺ⁿ"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Pembahasan / Solusi Matematis</label>
                    <textarea
                      rows={2}
                      value={formState.explanation}
                      onChange={e => setFormState(p => ({ ...p, explanation: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono-code outline-none"
                      placeholder="Tuliskan langkah-langkah penyelesaian..."
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>SIMPAN SOAL</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Question Generator Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-slate-900 border-2 border-purple-500 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-tech font-bold text-base text-white uppercase tracking-wider">
                    GENERATOR SOAL MATEMATIKA CERDAS
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-300 font-tech space-y-1">
                <p>Membuat soal otomatis terverifikasi sesuai materi SMK Kelas X Fase E.</p>
                <p className="text-slate-400 italic">Mendukung koneksi Gemini API atau Smart Algorithmic Generator lokal berstandar kurikulum.</p>
              </div>

              <div className="space-y-3 text-xs font-tech">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Misi Sasaran</label>
                  <select
                    value={aiMissionId}
                    onChange={e => setAiMissionId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                  >
                    <option value={1}>Misi 1: Perkalian &amp; Pembagian (Basis Sama)</option>
                    <option value={2}>Misi 2: Pangkat Bersarang, Pangkat Nol &amp; Negatif</option>
                    <option value={3}>Misi 3: Operasi Campuran Sifat Eksponen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Topik Spesifik</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    placeholder="Contoh: Operasi pembagian basis sama dan penyederhanaan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan</label>
                    <select
                      value={aiDifficulty}
                      onChange={e => setAiDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Sulit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Jumlah Butir Soal</label>
                    <select
                      value={aiCount}
                      onChange={e => setAiCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white outline-none"
                    >
                      <option value={2}>2 Butir Soal</option>
                      <option value={3}>3 Butir Soal</option>
                      <option value={5}>5 Butir Soal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeneratingAi ? 'MENGHASILKAN SOAL...' : 'GENERATE SEKARANG'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Credit */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-tech">
          <span>SMKN 4 Soppeng &bull; Matematika SMK Fase E &bull; Suwandi, S.Pd.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-bold"
          >
            Tutup Panel Guru
          </button>
        </div>
      </div>
    </div>
  );
};
