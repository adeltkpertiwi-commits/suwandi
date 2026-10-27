import { ExponentQuestion, MissionConfig } from '../types/game';

export const MISSIONS: MissionConfig[] = [
  {
    id: 1,
    code: 'MISI-01',
    title: 'SKY PATROL',
    subtitle: 'Zona Latihan Udara & Pangkalan Depan',
    description: 'Kuasai kendali pesawat dan taklukkan sifat perkalian serta pembagian bilangan berpangkat berbaris sama.',
    briefing: 'Pilot Tempur! Masuki sektor udara Sky Patrol. Musuh meluncurkan drone pengintai berkecepatan tinggi. Selesaikan perhitungan eksponen perkalian dan pembagian untuk mengisi energi meriam plasma dan hancurkan komandan udara Aero-Sentinel MK-1!',
    topicsCovered: [
      'Perkalian bilangan berpangkat basis sama: aᵐ × aⁿ = aᵐ⁺ⁿ',
      'Pembagian bilangan berpangkat basis sama: aᵐ : aⁿ = aᵐ⁻ⁿ'
    ],
    targetScore: 400,
    totalDistance: 2200,
    bossName: 'AERO-SENTINEL MK-1',
    bossSubtitle: 'Heavy Drone Commander',
    bossMaxHealth: 60,
    enemySpawnRate: 140, // frames between spawns
    bgColors: {
      skyTop: '#051937',
      skyBottom: '#004d7a',
      starColor: '#ffffff',
      gridColor: '#008793',
      cloudColor: 'rgba(255, 255, 255, 0.08)'
    }
  },
  {
    id: 2,
    code: 'MISI-02',
    title: 'ENEMY AIRSPACE',
    subtitle: 'Wilayah Udara Musuh & Benteng Cyber',
    description: 'Hadapi drone tempur dan terapkan sifat pangkat dipangkatkan, pangkat nol, serta pangkat negatif.',
    briefing: 'Peringatan! Radar mendeteksi armada pesawat tempur siluman musuh. Selesaikan enkripsi pangkat bersarang, nilai pangkat nol, dan pengubahan pangkat negatif menjadi pecahan untuk menembus pertahanan Cyber-Cruiser Titan!',
    topicsCovered: [
      'Pangkat dari bilangan berpangkat: (aᵐ)ⁿ = aᵐˣⁿ',
      'Pangkat nol: a⁰ = 1 (untuk a ≠ 0)',
      'Pangkat negatif: a⁻ⁿ = 1 / aⁿ'
    ],
    targetScore: 600,
    totalDistance: 2600,
    bossName: 'CYBER-CRUISER TITAN',
    bossSubtitle: 'Armored Battleship',
    bossMaxHealth: 90,
    enemySpawnRate: 110,
    bgColors: {
      skyTop: '#100b2b',
      skyBottom: '#2d114d',
      starColor: '#c084fc',
      gridColor: '#7c3aed',
      cloudColor: 'rgba(168, 85, 247, 0.08)'
    }
  },
  {
    id: 3,
    code: 'MISI-03',
    title: 'FINAL STRIKE',
    subtitle: 'Zona Pertempuran Terakhir & Inti Nexus',
    description: 'Selesaikan tantangan operasi campuran sifat-sifat bilangan berpangkat dengan tingkat kesulitan tinggi!',
    briefing: 'Ini adalah misi penentuan! Seluruh armada pertahanan lawan telah dikerahkan mengelilingi markas komando Nexus Overlord. Gunakan seluruh sifat bilangan berpangkat dalam operasi campuran untuk membuka kelemahan perisai kuantum musuh!',
    topicsCovered: [
      'Pangkat dari perkalian: (a × b)ⁿ = aⁿ × bⁿ',
      'Operasi gabungan perkalian, pembagian, dan pemangkatan',
      'Menyederhanakan bentuk aljabar eksponen'
    ],
    targetScore: 800,
    totalDistance: 3000,
    bossName: 'NEXUS OVERLORD',
    bossSubtitle: 'Flagship Quantum Fortress',
    bossMaxHealth: 120,
    enemySpawnRate: 90,
    bgColors: {
      skyTop: '#1a0505',
      skyBottom: '#450a0a',
      starColor: '#fca5a5',
      gridColor: '#dc2626',
      cloudColor: 'rgba(239, 68, 68, 0.09)'
    }
  }
];

export const DEFAULT_QUESTIONS: ExponentQuestion[] = [
  // ================= MISSION 1: Perkalian & Pembagian =================
  {
    id: 'm1-q1',
    missionId: 1,
    topic: 'Perkalian Bilangan Berpangkat',
    questionText: 'Sederhanakan bentuk perkalian berikut:',
    mathExpression: '2³ × 2⁴',
    options: ['2⁷', '2¹²', '4⁷', '2¹'],
    correctIndex: 0,
    explanation: 'Gunakan sifat perkalian basis sama: aᵐ × aⁿ = aᵐ⁺ⁿ.\n2³ × 2⁴ = 2³⁺⁴ = 2⁷ (atau 128).',
    ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    difficulty: 'mudah'
  },
  {
    id: 'm1-q2',
    missionId: 1,
    topic: 'Pembagian Bilangan Berpangkat',
    questionText: 'Tentukan hasil penyederhanaan pembagian berikut:',
    mathExpression: '5⁷ : 5³',
    options: ['5¹⁰', '5⁴', '5²¹', '1⁴'],
    correctIndex: 1,
    explanation: 'Gunakan sifat pembagian basis sama: aᵐ : aⁿ = aᵐ⁻ⁿ.\n5⁷ : 5³ = 5⁷⁻³ = 5⁴ (atau 625).',
    ruleUsed: 'aᵐ : aⁿ = aᵐ⁻ⁿ',
    difficulty: 'mudah'
  },
  {
    id: 'm1-q3',
    missionId: 1,
    topic: 'Perkalian Bilangan Berpangkat',
    questionText: 'Berapakah nilai sederhana dari perkalian basis 3:',
    mathExpression: '3² × 3⁵',
    options: ['3¹⁰', '9⁷', '3⁷', '3³'],
    correctIndex: 2,
    explanation: 'Basis sama (3), maka pangkat dijumlahkan: 2 + 5 = 7.\nJadi hasilnya adalah 3⁷.',
    ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    difficulty: 'mudah'
  },
  {
    id: 'm1-q4',
    missionId: 1,
    topic: 'Pembagian Bilangan Berpangkat',
    questionText: 'Sederhanakan pembagian bilangan berpangkat berikut:',
    mathExpression: '7⁸ / 7⁶',
    options: ['7²', '7¹⁴', '7⁴⁸', '1²'],
    correctIndex: 0,
    explanation: 'Sesuai sifat aᵐ / aⁿ = aᵐ⁻ⁿ:\n7⁸ / 7⁶ = 7⁸⁻⁶ = 7² = 49.',
    ruleUsed: 'aᵐ : aⁿ = aᵐ⁻ⁿ',
    difficulty: 'mudah'
  },
  {
    id: 'm1-q5',
    missionId: 1,
    topic: 'Perkalian Variabel Berpangkat',
    questionText: 'Bentuk sederhana dari perkalian variabel p:',
    mathExpression: 'p⁴ × p³ × p',
    options: ['p⁷', 'p⁸', 'p¹²', '3p⁸'],
    correctIndex: 1,
    explanation: 'Ingat bahwa p = p¹. Maka p⁴ × p³ × p¹ = p⁴⁺³⁺¹ = p⁸.',
    ruleUsed: 'aᵐ × aⁿ × aᵖ = aᵐ⁺ⁿ⁺ᵖ',
    difficulty: 'sedang'
  },
  {
    id: 'm1-q6',
    missionId: 1,
    topic: 'Pembagian & Nilai Bilangan',
    questionText: 'Tentukan nilai hasil pembagian eksponen berikut:',
    mathExpression: '2⁶ : 2²',
    options: ['8', '16', '32', '64'],
    correctIndex: 1,
    explanation: '2⁶ : 2² = 2⁶⁻² = 2⁴.\nNilai dari 2⁴ = 2 × 2 × 2 × 2 = 16.',
    ruleUsed: 'aᵐ : aⁿ = aᵐ⁻ⁿ',
    difficulty: 'sedang'
  },

  // ================= MISSION 2: Pangkat dari Pangkat, Nol & Negatif =================
  {
    id: 'm2-q1',
    missionId: 2,
    topic: 'Pangkat dari Bilangan Berpangkat',
    questionText: 'Sederhanakan bentuk pemangkatan berulang berikut:',
    mathExpression: '(3²)³',
    options: ['3⁵', '3⁶', '3⁸', '9³'],
    correctIndex: 1,
    explanation: 'Gunakan sifat (aᵐ)ⁿ = aᵐˣⁿ.\n(3²)³ = 3²ˣ³ = 3⁶ (atau 729). Pangkat dikalikan, bukan dijumlahkan!',
    ruleUsed: '(aᵐ)ⁿ = aᵐˣⁿ',
    difficulty: 'mudah'
  },
  {
    id: 'm2-q2',
    missionId: 2,
    topic: 'Pangkat Nol',
    questionText: 'Tentukan hasil operasi hitung berikut:',
    mathExpression: '2⁰ + 3²',
    options: ['9', '10', '11', '12'],
    correctIndex: 1,
    explanation: 'Sifat pangkat nol: a⁰ = 1 (untuk a ≠ 0).\nMaka 2⁰ = 1, dan 3² = 9.\nHasilnya = 1 + 9 = 10.',
    ruleUsed: 'a⁰ = 1',
    difficulty: 'mudah'
  },
  {
    id: 'm2-q3',
    missionId: 2,
    topic: 'Pangkat Negatif',
    questionText: 'Ubah bilangan berpangkat negatif ke bentuk pecahan:',
    mathExpression: '2⁻³',
    options: ['-6', '-8', '1/8', '1/6'],
    correctIndex: 2,
    explanation: 'Sifat pangkat negatif: a⁻ⁿ = 1 / aⁿ.\n2⁻³ = 1 / 2³ = 1 / 8.',
    ruleUsed: 'a⁻ⁿ = 1 / aⁿ',
    difficulty: 'sedang'
  },
  {
    id: 'm2-q4',
    missionId: 2,
    topic: 'Pangkat dari Pangkat',
    questionText: 'Bentuk sederhana dari pemangkatan variabel (x⁴)⁵ adalah:',
    mathExpression: '(x⁴)⁵',
    options: ['x⁹', 'x²⁰', 'x⁴⁵', '5x⁴'],
    correctIndex: 1,
    explanation: 'Gunakan sifat (aᵐ)ⁿ = aᵐˣⁿ:\n(x⁴)⁵ = x⁴ˣ⁵ = x²⁰.',
    ruleUsed: '(aᵐ)ⁿ = aᵐˣⁿ',
    difficulty: 'sedang'
  },
  {
    id: 'm2-q5',
    missionId: 2,
    topic: 'Pangkat Negatif',
    questionText: 'Tentukan nilai dari 5⁻²:',
    mathExpression: '5⁻²',
    options: ['-25', '-10', '1/10', '1/25'],
    correctIndex: 3,
    explanation: '5⁻² = 1 / 5² = 1 / 25 = 0,04.',
    ruleUsed: 'a⁻ⁿ = 1 / aⁿ',
    difficulty: 'sedang'
  },
  {
    id: 'm2-q6',
    missionId: 2,
    topic: 'Kombinasi Pangkat Nol & Negatif',
    questionText: 'Hitunglah nilai operasi eksponen berikut:',
    mathExpression: '4⁰ + 4⁻¹',
    options: ['1', '5/4', '4', '1/4'],
    correctIndex: 1,
    explanation: '4⁰ = 1 dan 4⁻¹ = 1/4.\n1 + 1/4 = 4/4 + 1/4 = 5/4 (atau 1,25).',
    ruleUsed: 'a⁰ = 1 dan a⁻ⁿ = 1/aⁿ',
    difficulty: 'sulit'
  },

  // ================= MISSION 3: Pangkat Perkalian & Operasi Campuran =================
  {
    id: 'm3-q1',
    missionId: 3,
    topic: 'Operasi Campuran Sifat Eksponen',
    questionText: 'Sederhanakan operasi gabungan perkalian dan pembagian:',
    mathExpression: '(2³ × 2²) : 2⁴',
    options: ['2¹ = 2', '2⁹', '2⁶', '2⁰ = 1'],
    correctIndex: 0,
    explanation: 'Langkah 1: Selesaikan perkalian: 2³ × 2² = 2³⁺² = 2⁵.\nLangkah 2: Selesaikan pembagian: 2⁵ : 2⁴ = 2⁵⁻⁴ = 2¹ = 2.',
    ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ dan aᵐ : aⁿ = aᵐ⁻ⁿ',
    difficulty: 'sedang'
  },
  {
    id: 'm3-q2',
    missionId: 3,
    topic: 'Pangkat Perkalian Beberapa Bilangan',
    questionText: 'Sederhanakan bentuk pemangkatan perkalian:',
    mathExpression: '(2 × 3)³',
    options: ['2³ × 3', '2 × 3³', '2³ × 3³', '6⁶'],
    correctIndex: 2,
    explanation: 'Sifat pangkat dari perkalian: (a × b)ⁿ = aⁿ × bⁿ.\n(2 × 3)³ = 2³ × 3³ (atau 8 × 27 = 216).',
    ruleUsed: '(a × b)ⁿ = aⁿ × bⁿ',
    difficulty: 'sedang'
  },
  {
    id: 'm3-q3',
    missionId: 3,
    topic: 'Operasi Campuran Kompleks',
    questionText: 'Tentukan bentuk paling sederhana dari pecahan eksponen:',
    mathExpression: '(3²)³ × 3⁴ / 3⁸',
    options: ['3²', '3¹⁴', '3⁰ = 1', '3⁴'],
    correctIndex: 0,
    explanation: '1) (3²)³ = 3⁶\n2) 3⁶ × 3⁴ = 3⁶⁺⁴ = 3¹⁰\n3) 3¹⁰ / 3⁸ = 3¹⁰⁻⁸ = 3² = 9.',
    ruleUsed: '(aᵐ)ⁿ = aᵐˣⁿ, aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ/aⁿ = aᵐ⁻ⁿ',
    difficulty: 'sulit'
  },
  {
    id: 'm3-q4',
    missionId: 3,
    topic: 'Operasi Aljabar Eksponen',
    questionText: 'Sederhanakan bentuk aljabar berikut:',
    mathExpression: '(a³ b²)² / (a⁴ b)',
    options: ['a² b²', 'a² b³', 'a b³', 'a² b'],
    correctIndex: 1,
    explanation: '1) Pembilang: (a³ b²)² = a³ˣ² b²ˣ² = a⁶ b⁴.\n2) Bagi dengan penyebut: (a⁶ b⁴) / (a⁴ b¹) = a⁶⁻⁴ b⁴⁻¹ = a² b³.',
    ruleUsed: '(aᵐ bⁿ)ᵖ = aᵐᵖ bⁿᵖ dan aᵐ/aⁿ = aᵐ⁻ⁿ',
    difficulty: 'sulit'
  },
  {
    id: 'm3-q5',
    missionId: 3,
    topic: 'Operasi Campuran Negatif & Pecahan',
    questionText: 'Tentukan hasil akhir dari operasi hitung:',
    mathExpression: '(2⁻² × 2⁴) + 5⁰',
    options: ['3', '4', '5', '8'],
    correctIndex: 2,
    explanation: '1) 2⁻² × 2⁴ = 2⁻²⁺⁴ = 2² = 4.\n2) 5⁰ = 1.\n3) 4 + 1 = 5.',
    ruleUsed: 'aᵐ × aⁿ = aᵐ⁺ⁿ dan a⁰ = 1',
    difficulty: 'sulit'
  },
  {
    id: 'm3-q6',
    missionId: 3,
    topic: 'Penyederhanaan Basis Campuran',
    questionText: 'Berapakah nilai dari (4² × 2³) / 2⁵ jika diubah ke basis 2:',
    mathExpression: '(4² × 2³) : 2⁵',
    options: ['2¹ = 2', '2² = 4', '2³ = 8', '2⁴ = 16'],
    correctIndex: 1,
    explanation: 'Ubah 4 menjadi basis 2: 4 = 2².\nMaka 4² = (2²)² = 2⁴.\nOperasi menjadi: (2⁴ × 2³) : 2⁵ = 2⁷ : 2⁵ = 2⁷⁻⁵ = 2² = 4.',
    ruleUsed: 'Konversi basis ke 2, (aᵐ)ⁿ = aᵐˣⁿ, aᵐ × aⁿ = aᵐ⁺ⁿ',
    difficulty: 'sulit'
  }
];

// Local storage management for teacher customized questions
export const STORAGE_KEYS = {
  QUESTIONS: 'math_air_force_questions',
  SETTINGS: 'math_air_force_teacher_settings',
  RECORDS: 'math_air_force_student_records',
  LAST_PLAYER: 'math_air_force_last_player'
};

export function loadQuestions(): ExponentQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load questions from storage, using defaults', e);
  }
  return DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: ExponentQuestion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions to storage', e);
  }
}

export function resetQuestionsToDefault(): ExponentQuestion[] {
  saveQuestions(DEFAULT_QUESTIONS);
  return DEFAULT_QUESTIONS;
}
