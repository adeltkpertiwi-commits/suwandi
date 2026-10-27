import React, { useState } from 'react';
import { X, BookOpen, Gamepad2, Award, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'CARA_MAIN' | 'SIFAT_EKSPONEN'>('CARA_MAIN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 p-4 border-b border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-tech font-bold text-white uppercase tracking-wider">
                PANDUAN OPERASIONAL & MATERI PEMBELAJARAN
              </h2>
              <div className="text-xs text-cyan-300 font-tech">
                MATH AIR FORCE: EXPONENT MISSION &bull; Suwandi, S.Pd. (SMKN 4 Soppeng)
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 p-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('CARA_MAIN');
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-tech font-bold text-xs sm:text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'CARA_MAIN'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>CARA BERMAIN & KONTROL</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('SIFAT_EKSPONEN');
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-tech font-bold text-xs sm:text-sm tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'SIFAT_EKSPONEN'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>RINGKASAN SIFAT BILANGAN BERPANGKAT</span>
          </button>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-200">
          {activeTab === 'CARA_MAIN' ? (
            <div className="space-y-6">
              {/* Objective */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-900/60 space-y-2">
                <div className="text-xs uppercase font-tech font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>TUJUAN UTAMA PERMAINAN</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-tech leading-relaxed">
                  Kendalikan jet tempur canggih, taklukkan armada drone musuh, selesaikan tantangan sifat-sifat bilangan berpangkat SMK Fase E untuk mengisi ulang energi meriam plasma, dan kalahkan Komandan Boss pada akhir setiap misi!
                </p>
              </div>

              {/* 8 Langkah Bermain */}
              <div className="space-y-3">
                <div className="text-xs uppercase font-tech font-bold text-slate-400 tracking-wider">
                  8 LANGKAH MENYELESAIKAN MISI:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { num: '1', title: 'Pilih MULAI MISI', desc: 'Isi nama pilot dan pilih salah satu dari 3 zona misi tempur.' },
                    { num: '2', title: 'Manuver Pesawat', desc: 'Gunakan tombol panah/WASD atau sentuh layar untuk menghindari tembakan musuh.' },
                    { num: '3', title: 'Tembak Musuh', desc: 'Tekan SPASI atau tombol TEMBAK di layar sentuh untuk menembakkan meriam laser.' },
                    { num: '4', title: 'Pemberhentian Aman', desc: 'Saat gerbang tantangan matematika tercapai, permainan dijeda otomatis secara aman.' },
                    { num: '5', title: 'Pilih Jawaban Tepat', desc: 'Terapkan sifat bilangan berpangkat yang sesuai untuk memilih satu dari 4 opsi.' },
                    { num: '6', title: 'Pelajari Trik Matematika', desc: 'Baca pembahasan langkah demi langkah untuk memperdalam pemahaman konsep.' },
                    { num: '7', title: 'Kumpulkan Skor & Energi', desc: 'Jawaban benar memberi +100 poin dan memicu tembakan super meriam plasma!' },
                    { num: '8', title: 'Kalahkan Boss Akhir', desc: 'Gunakan seluruh pemahaman matematika untuk meruntuhkan perisai boss!' }
                  ].map((step, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-mono-code font-bold text-xs text-cyan-300 shrink-0">
                        {step.num}
                      </div>
                      <div>
                        <div className="font-tech font-bold text-sm text-white">{step.title}</div>
                        <div className="text-xs text-slate-400 font-tech mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kontrol */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs uppercase font-tech font-bold text-cyan-400">
                  SKEMA KENDALI PERANGKAT:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-tech">
                  <div className="space-y-1.5">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Komputer / Laptop:
                    </div>
                    <ul className="text-slate-400 space-y-1 pl-3.5">
                      <li>• <strong>W, A, S, D</strong> atau <strong>Tombol Panah</strong>: Bergerak 4 arah</li>
                      <li>• <strong>SPASI</strong>: Menembak meriam laser (bisa tahan)</li>
                      <li>• <strong>ESC / P</strong>: Menjeda permainan</li>
                      <li>• <strong>1, 2, 3, 4</strong>: Memilih jawaban pada panel soal</li>
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      HP Android &amp; Tablet (Sentuh):
                    </div>
                    <ul className="text-slate-400 space-y-1 pl-3.5">
                      <li>• <strong>D-Pad Sentuh</strong> di kiri bawah untuk manuver arah</li>
                      <li>• <strong>Tombol Merah TEMBAK</strong> di kanan bawah</li>
                      <li>• <strong>Tombol JEDA</strong> di sudut atas</li>
                      <li>• Ketuk langsung pada kotak pilihan jawaban matematika</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab: Sifat-Sifat Bilangan Berpangkat (Matematika SMK Kelas X Fase E) */
            <div className="space-y-4">
              <div className="text-xs font-tech text-slate-400">
                Materi kurikulum Matematika SMK Kelas X Fase E &bull; Penyusun: <strong>Suwandi, S.Pd.</strong>
              </div>

              <div className="space-y-3">
                {[
                  {
                    no: '1',
                    name: 'Perkalian Bilangan Berpangkat (Basis Sama)',
                    formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
                    desc: 'Jika basisnya sama, hasil kali diperoleh dengan menjumlahkan pangkat-pangkatnya.',
                    example: 'Contoh: 2³ × 2⁴ = 2³⁺⁴ = 2⁷ = 128'
                  },
                  {
                    no: '2',
                    name: 'Pembagian Bilangan Berpangkat (Basis Sama)',
                    formula: 'aᵐ : aⁿ = aᵐ⁻ⁿ  (a ≠ 0)',
                    desc: 'Jika basisnya sama, hasil bagi diperoleh dengan mengurangkan pangkat pembilang dengan pangkat penyebut.',
                    example: 'Contoh: 5⁷ : 5³ = 5⁷⁻³ = 5⁴ = 625'
                  },
                  {
                    no: '3',
                    name: 'Pangkat dari Bilangan Berpangkat',
                    formula: '(aᵐ)ⁿ = aᵐˣⁿ',
                    desc: 'Bilangan berpangkat yang dipangkatkan lagi menghasilkan perkalian antar pangkatnya.',
                    example: 'Contoh: (3²)³ = 3²ˣ³ = 3⁶ = 729'
                  },
                  {
                    no: '4',
                    name: 'Pangkat dari Perkalian Bilangan',
                    formula: '(a × b)ⁿ = aⁿ × bⁿ',
                    desc: 'Pangkat dari suatu perkalian sama dengan perkalian dari masing-masing faktor yang dipangkatkan.',
                    example: 'Contoh: (2 × 3)³ = 2³ × 3³ = 8 × 27 = 216'
                  },
                  {
                    no: '5',
                    name: 'Pangkat dari Pembagian Bilangan',
                    formula: '(a / b)ⁿ = aⁿ / bⁿ  (b ≠ 0)',
                    desc: 'Pangkat dari pecahan sama dengan pembilang berpangkat dibagi penyebut berpangkat.',
                    example: 'Contoh: (2 / 3)² = 2² / 3² = 4 / 9'
                  },
                  {
                    no: '6',
                    name: 'Pangkat Nol',
                    formula: 'a⁰ = 1  (untuk setiap a ≠ 0)',
                    desc: 'Setiap bilangan real bukan nol jika dipangkatkan nol selalu bernilai 1.',
                    example: 'Contoh: 7⁰ = 1 ;  1000⁰ = 1 ;  (2x)⁰ = 1'
                  },
                  {
                    no: '7',
                    name: 'Pangkat Bulat Negatif',
                    formula: 'a⁻ⁿ = 1 / aⁿ  (a ≠ 0)',
                    desc: 'Pangkat negatif menyatakan kebalikan (pecahan) dari bilangan berpangkat positif.',
                    example: 'Contoh: 2⁻³ = 1 / 2³ = 1 / 8 = 0,125'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono-code font-bold text-xs flex items-center justify-center">
                          {item.no}
                        </span>
                        <span className="font-tech font-bold text-sm sm:text-base text-white">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono-code text-sm font-bold text-cyan-400 bg-slate-900 px-3 py-1 rounded-md border border-cyan-800/60 shadow-xs">
                        {item.formula}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-tech">
                      {item.desc}
                    </p>
                    <div className="text-xs font-mono-code text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/60">
                      {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Credit & Close Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-tech">
            Dikembangkan oleh: <strong className="text-slate-300">Suwandi, S.Pd.</strong> &bull; SMKN 4 Soppeng
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-tech font-bold text-xs tracking-wider transition shadow cursor-pointer"
          >
            TUTUP PANDUAN
          </button>
        </div>
      </div>
    </div>
  );
};
