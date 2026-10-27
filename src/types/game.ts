export type GameState = 
  | 'MENU' 
  | 'SETUP' 
  | 'PLAYING' 
  | 'QUESTION_ACTIVE' 
  | 'PAUSED' 
  | 'ANSWER_FEEDBACK' 
  | 'LEVEL_COMPLETE' 
  | 'GAME_OVER' 
  | 'GAME_COMPLETE'
  | 'GUIDE'
  | 'SETTINGS'
  | 'TEACHER_MODE';

export interface ExponentQuestion {
  id: string;
  missionId: number; // 1, 2, or 3
  topic: string; // e.g. "Perkalian Bilangan Berpangkat", "Pembagian", "Pangkat Nol & Negatif", etc.
  questionText: string; // e.g. "Sederhanakan bentuk perkalian berikut:"
  mathExpression: string; // e.g. "2³ × 2⁴"
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string; // Step-by-step mathematical explanation
  ruleUsed: string; // e.g. "aᵐ × aⁿ = aᵐ⁺ⁿ"
  difficulty: 'mudah' | 'sedang' | 'sulit';
}

export interface MissionConfig {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  briefing: string;
  topicsCovered: string[];
  targetScore: number;
  totalDistance: number;
  bossName: string;
  bossSubtitle: string;
  bossMaxHealth: number;
  enemySpawnRate: number;
  bgColors: {
    skyTop: string;
    skyBottom: string;
    starColor: string;
    gridColor: string;
    cloudColor: string;
  };
}

export interface PlayerStats {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  speed: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  shieldTimer: number; // Invincibility frames
  isShooting: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
}

export type EnemyType = 'drone' | 'scout' | 'interceptor' | 'heavy' | 'boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  shootTimer: number;
  shootInterval: number;
  scoreValue: number;
  pattern: 'straight' | 'sine' | 'dive' | 'boss_hover';
  patternTime: number;
  baseY: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Powerup {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'energy' | 'shield' | 'score' | 'heal';
  radius: number;
  pulse: number;
}

export interface MathTriggerGate {
  id: string;
  distance: number; // progress distance along the level
  x: number;
  questionIndex: number;
  triggered: boolean;
  label: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface StudentSessionRecord {
  id: string;
  studentName: string;
  studentClass: string;
  missionId: number;
  missionName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number; // 0 - 100
  durationSeconds: number;
  enemiesDestroyed: number;
  stars: number; // 1, 2, or 3
  timestamp: string;
}

export interface TeacherSettings {
  questionsPerMission: number;
  initialLives: number;
  wrongPenaltyEnergy: number;
  enemySpeedMultiplier: number;
  questionTimerSeconds: number; // 0 means unlimited
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
}
