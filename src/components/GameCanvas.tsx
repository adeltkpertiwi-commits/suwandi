import React, { useEffect, useRef } from 'react';
import { MissionConfig, PlayerStats, Bullet, Enemy, EnemyType, Particle, Powerup, MathTriggerGate, FloatingText, TeacherSettings } from '../types/game';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  mission: MissionConfig;
  settings: TeacherSettings;
  isPaused: boolean;
  lastAnswerResult?: { isCorrect: boolean; timestamp: number } | null;
  onUpdateHUD: (stats: {
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    score: number;
    bossHealth: number | null;
    bossMaxHealth: number | null;
  }) => void;
  onTriggerQuestion: (questionIndex: number) => void;
  onMissionVictory: (finalScore: number, enemiesDestroyed: number) => void;
  onMissionDefeat: (finalScore: number, enemiesDestroyed: number) => void;
  virtualDirection: { x: number; y: number };
  virtualFireTrigger: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mission,
  settings,
  isPaused,
  lastAnswerResult,
  onUpdateHUD,
  onTriggerQuestion,
  onMissionVictory,
  onMissionDefeat,
  virtualDirection,
  virtualFireTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Use refs for gameplay state so game loop runs at 60fps without React re-renders
  const stateRef = useRef({
    distance: 0,
    score: 0,
    enemiesDestroyed: 0,
    player: {
      x: 80,
      y: 200,
      width: 52,
      height: 28,
      vx: 0,
      vy: 0,
      speed: 340,
      health: settings.initialLives,
      maxHealth: settings.initialLives,
      energy: 100,
      maxEnergy: 100,
      shieldTimer: 0,
      isShooting: false
    } as PlayerStats,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    powerups: [] as Powerup[],
    gates: [] as MathTriggerGate[],
    floatingTexts: [] as FloatingText[],
    boss: null as Enemy | null,
    bossSpawned: false,
    bossDefeated: false,
    enemySpawnTimer: 0,
    shootCooldown: 0,
    starfield: [] as { x: number; y: number; speed: number; size: number; color: string }[],
    clouds: [] as { x: number; y: number; width: number; height: number; speed: number; opacity: number }[],
    shakeTime: 0
  });

  // Track held keyboard keys
  const keysHeld = useRef<{ [key: string]: boolean }>({});

  // Initialize Game World, Math Checkpoint Gates, and Background Layers
  useEffect(() => {
    const s = stateRef.current;
    s.distance = 0;
    s.score = 0;
    s.enemiesDestroyed = 0;
    s.player.health = settings.initialLives;
    s.player.maxHealth = settings.initialLives;
    s.player.energy = 100;
    s.player.shieldTimer = 0;
    s.bullets = [];
    s.enemies = [];
    s.particles = [];
    s.powerups = [];
    s.floatingTexts = [];
    s.boss = null;
    s.bossSpawned = false;
    s.bossDefeated = false;

    // Generate math checkpoint gates evenly distributed along the level
    const gates: MathTriggerGate[] = [];
    const count = settings.questionsPerMission;
    const interval = mission.totalDistance / (count + 1);

    for (let i = 1; i <= count; i++) {
      gates.push({
        id: `gate-${i}`,
        distance: Math.round(interval * i),
        x: 0,
        questionIndex: i,
        triggered: false,
        label: `DATA GATE #${i}`
      });
    }
    s.gates = gates;

    // Initialize stars
    const stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * 1200,
        y: Math.random() * 700,
        speed: 20 + Math.random() * 110,
        size: Math.random() < 0.25 ? 2.5 : 1.2,
        color: Math.random() < 0.3 ? '#38bdf8' : '#ffffff'
      });
    }
    s.starfield = stars;

    // Initialize nebula clouds
    const clouds = [];
    for (let i = 0; i < 7; i++) {
      clouds.push({
        x: Math.random() * 1200,
        y: Math.random() * 500,
        width: 160 + Math.random() * 220,
        height: 80 + Math.random() * 120,
        speed: 15 + Math.random() * 25,
        opacity: 0.05 + Math.random() * 0.08
      });
    }
    s.clouds = clouds;

    sound.startEngine();
    return () => {
      sound.stopEngine();
    };
  }, [mission, settings]);

  // Listen for keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        stateRef.current.player.isShooting = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = false;
      if (e.key === ' ' || e.key === 'Spacebar') {
        stateRef.current.player.isShooting = false;
      }
    };

    const handleBlur = () => {
      keysHeld.current = {};
      if (stateRef.current.player) {
        stateRef.current.player.isShooting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Handle virtual mobile fire trigger
  useEffect(() => {
    if (virtualFireTrigger > 0) {
      firePlayerBullet();
    }
  }, [virtualFireTrigger]);

  const firePlayerBullet = () => {
    const s = stateRef.current;
    if (s.player.health <= 0 || isPaused) return;

    sound.playLaser(false);

    // Twin laser cannons
    s.bullets.push(
      {
        x: s.player.x + s.player.width,
        y: s.player.y + 6,
        vx: 850,
        vy: 0,
        radius: 3.5,
        damage: 15,
        isPlayer: true,
        color: '#22d3ee'
      },
      {
        x: s.player.x + s.player.width,
        y: s.player.y + s.player.height - 6,
        vx: 850,
        vy: 0,
        radius: 3.5,
        damage: 15,
        isPlayer: true,
        color: '#22d3ee'
      }
    );

    // Muzzle flash particles
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: s.player.x + s.player.width,
        y: s.player.y + s.player.height / 2 + (Math.random() * 12 - 6),
        vx: 120 + Math.random() * 80,
        vy: Math.random() * 60 - 30,
        life: 0.12,
        maxLife: 0.12,
        color: '#67e8f9',
        size: 3
      });
    }
  };

  // Plasma Super Blast triggered by correct math answer
  const triggerPlasmaSuperBlast = () => {
    const s = stateRef.current;
    sound.playPlasmaBlast();
    s.shakeTime = 0.35;

    // Create a massive clearing wave
    for (let i = 0; i < 18; i++) {
      s.bullets.push({
        x: s.player.x + 30,
        y: (Math.random() * 500) + 50,
        vx: 1200,
        vy: (Math.random() - 0.5) * 50,
        radius: 7,
        damage: 40,
        isPlayer: true,
        color: '#facc15'
      });
    }

    // Damage all visible enemies on screen
    s.enemies.forEach(e => {
      e.health -= 35;
      if (e.health <= 0) {
        destroyEnemy(e);
      }
    });

    s.floatingTexts.push({
      id: `blast-${Date.now()}`,
      x: s.player.x + 60,
      y: s.player.y - 20,
      text: 'SUPER PLASMA BLAST!',
      color: '#22d3ee',
      life: 1.5,
      maxLife: 1.5
    });
  };

  const destroyEnemy = (enemy: Enemy) => {
    const s = stateRef.current;
    sound.playExplosion(enemy.type === 'boss');
    s.enemiesDestroyed += 1;
    s.score += enemy.scoreValue;

    // Screen shake on heavy kills
    if (enemy.type === 'heavy' || enemy.type === 'boss') {
      s.shakeTime = 0.4;
    }

    // Spawn explosion particles
    const particleCount = enemy.type === 'boss' ? 70 : 18;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * (enemy.type === 'boss' ? 320 : 180);
      s.particles.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.4,
        maxLife: 0.75,
        color: ['#f97316', '#ef4444', '#facc15', '#38bdf8'][Math.floor(Math.random() * 4)],
        size: 3 + Math.random() * 4
      });
    }

    // Chance to spawn powerup
    if (Math.random() < 0.35 && enemy.type !== 'boss') {
      const types: ('energy' | 'shield' | 'score' | 'heal')[] = ['energy', 'score', 'heal', 'shield'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      s.powerups.push({
        id: `pow-${Date.now()}-${Math.random()}`,
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: -60,
        vy: Math.sin(Date.now()) * 20,
        type: chosenType,
        radius: 12,
        pulse: 0
      });
    }

    // Floating score text
    s.floatingTexts.push({
      id: `score-${Date.now()}-${Math.random()}`,
      x: enemy.x,
      y: enemy.y,
      text: `+${enemy.scoreValue}`,
      color: '#facc15',
      life: 1.0,
      maxLife: 1.0
    });
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling on lag spikes

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const s = stateRef.current;

      // Handle Resize smoothly
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const cw = canvas.width;
      const ch = canvas.height;

      // ================= UPDATE LOGIC (Only when not paused) =================
      if (!isPaused && s.player.health > 0) {
        // Distance scroll progress
        s.distance += 110 * dt * settings.enemySpeedMultiplier;

        // Player input direction
        let dirX = 0;
        let dirY = 0;

        // Keyboard
        if (keysHeld.current['w'] || keysHeld.current['arrowup']) dirY -= 1;
        if (keysHeld.current['s'] || keysHeld.current['arrowdown']) dirY += 1;
        if (keysHeld.current['a'] || keysHeld.current['arrowleft']) dirX -= 1;
        if (keysHeld.current['d'] || keysHeld.current['arrowright']) dirX += 1;

        // Virtual Touch
        if (virtualDirection.x !== 0) dirX = virtualDirection.x;
        if (virtualDirection.y !== 0) dirY = virtualDirection.y;

        // Normalize direction vector
        if (dirX !== 0 && dirY !== 0) {
          const invSqrt = 0.7071;
          dirX *= invSqrt;
          dirY *= invSqrt;
        }

        // Apply Player Velocity
        s.player.vx = dirX * s.player.speed;
        s.player.vy = dirY * s.player.speed;

        s.player.x += s.player.vx * dt;
        s.player.y += s.player.vy * dt;

        // Clamp to screen
        s.player.x = Math.max(20, Math.min(cw - s.player.width - 20, s.player.x));
        s.player.y = Math.max(40, Math.min(ch - s.player.height - 30, s.player.y));

        // Player shooting cooldown
        if (s.shootCooldown > 0) {
          s.shootCooldown -= dt;
        }
        if (s.player.isShooting && s.shootCooldown <= 0) {
          firePlayerBullet();
          s.shootCooldown = 0.17; // ~6 shots per sec
        }

        // Update engine sound pitch based on player movement
        const speedRatio = Math.sqrt(dirX * dirX + dirY * dirY);
        sound.updateEnginePitch(speedRatio);

        // Shield countdown
        if (s.player.shieldTimer > 0) {
          s.player.shieldTimer -= dt;
        }

        // Screen shake decay
        if (s.shakeTime > 0) {
          s.shakeTime -= dt;
        }

        // Check Math Checkpoint Gates
        s.gates.forEach(gate => {
          if (!gate.triggered && s.distance >= gate.distance) {
            gate.triggered = true;
            onTriggerQuestion(gate.questionIndex);
          }
        });

        // Spawn Boss when target distance reached
        if (!s.bossSpawned && s.distance >= mission.totalDistance) {
          s.bossSpawned = true;
          sound.playBossAlert();
          s.floatingTexts.push({
            id: `warning-${Date.now()}`,
            x: cw / 2 - 120,
            y: ch / 2 - 40,
            text: `PERINGATAN: ${mission.bossName} MENDEKAT!`,
            color: '#ef4444',
            life: 2.5,
            maxLife: 2.5
          });

          const bossEnemy: Enemy = {
            id: 'mission-boss',
            type: 'boss',
            x: cw + 50,
            y: ch / 2 - 50,
            vx: -70,
            vy: 0,
            width: 130,
            height: 90,
            health: mission.bossMaxHealth,
            maxHealth: mission.bossMaxHealth,
            shootTimer: 0,
            shootInterval: 1.4,
            scoreValue: 500,
            pattern: 'boss_hover',
            patternTime: 0,
            baseY: ch / 2 - 50
          };
          s.boss = bossEnemy;
          s.enemies.push(bossEnemy);
        }

        // Regular Enemy Spawner (before boss or supporting boss)
        s.enemySpawnTimer += dt * 60;
        const currentRate = mission.enemySpawnRate / settings.enemySpeedMultiplier;
        if (s.enemySpawnTimer >= currentRate) {
          s.enemySpawnTimer = 0;

          const types: EnemyType[] = mission.id === 1 
            ? ['drone', 'scout'] 
            : mission.id === 2 
            ? ['scout', 'interceptor', 'drone'] 
            : ['interceptor', 'heavy', 'scout'];

          const chosenType = types[Math.floor(Math.random() * types.length)];
          const spawnY = 50 + Math.random() * (ch - 130);

          let width = 38;
          let height = 24;
          let health = 20;
          let speed = 160;
          let scoreVal = 20;
          let shootInt = 2.2;
          let pat: 'straight' | 'sine' | 'dive' = 'straight';

          if (chosenType === 'scout') {
            width = 42;
            height = 26;
            health = 30;
            speed = 190;
            scoreVal = 30;
            pat = 'sine';
          } else if (chosenType === 'interceptor') {
            width = 46;
            height = 28;
            health = 45;
            speed = 210;
            scoreVal = 40;
            shootInt = 1.6;
            pat = 'sine';
          } else if (chosenType === 'heavy') {
            width = 62;
            height = 42;
            health = 80;
            speed = 120;
            scoreVal = 60;
            shootInt = 1.8;
          }

          s.enemies.push({
            id: `enemy-${Date.now()}-${Math.random()}`,
            type: chosenType,
            x: cw + 40,
            y: spawnY,
            vx: -speed * settings.enemySpeedMultiplier,
            vy: 0,
            width,
            height,
            health,
            maxHealth: health,
            shootTimer: Math.random() * shootInt,
            shootInterval: shootInt,
            scoreValue: scoreVal,
            pattern: pat,
            patternTime: 0,
            baseY: spawnY
          });
        }

        // Update Enemies
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const e = s.enemies[i];
          e.patternTime += dt;

          if (e.pattern === 'sine') {
            e.vy = Math.sin(e.patternTime * 4) * 110;
          } else if (e.pattern === 'boss_hover') {
            // Smooth boss hovering inside the right side of the arena
            if (e.x > cw - e.width - 60) {
              e.x -= 80 * dt;
            }
            e.y = e.baseY + Math.sin(e.patternTime * 2.2) * (ch * 0.28);
          }

          e.x += e.vx * dt;
          e.y += e.vy * dt;

          // Enemy shooting
          e.shootTimer += dt;
          if (e.shootTimer >= e.shootInterval && e.x < cw - 10) {
            e.shootTimer = 0;
            sound.playLaser(true);

            if (e.type === 'boss') {
              // Boss multi-shot
              s.bullets.push(
                { x: e.x, y: e.y + 20, vx: -420, vy: -70, radius: 4.5, damage: 1, isPlayer: false, color: '#ef4444' },
                { x: e.x, y: e.y + e.height / 2, vx: -460, vy: 0, radius: 5.5, damage: 1, isPlayer: false, color: '#f97316' },
                { x: e.x, y: e.y + e.height - 20, vx: -420, vy: 70, radius: 4.5, damage: 1, isPlayer: false, color: '#ef4444' }
              );
            } else {
              s.bullets.push({
                x: e.x,
                y: e.y + e.height / 2,
                vx: -400 * settings.enemySpeedMultiplier,
                vy: (s.player.y - e.y) * 0.4,
                radius: 3.5,
                damage: 1,
                isPlayer: false,
                color: '#f87171'
              });
            }
          }

          // Check Player vs Enemy Body Collision
          if (s.player.shieldTimer <= 0) {
            const hit = (
              s.player.x < e.x + e.width &&
              s.player.x + s.player.width > e.x &&
              s.player.y < e.y + e.height &&
              s.player.y + s.player.height > e.y
            );
            if (hit) {
              s.player.health -= 1;
              s.player.shieldTimer = 1.8;
              sound.playExplosion(false);
              s.shakeTime = 0.3;

              if (e.type !== 'boss') {
                e.health = 0;
                destroyEnemy(e);
                s.enemies.splice(i, 1);
              }

              if (s.player.health <= 0) {
                onMissionDefeat(s.score, s.enemiesDestroyed);
              }
              continue;
            }
          }

          // Offscreen removal
          if (e.x < -e.width - 50) {
            s.enemies.splice(i, 1);
          }
        }

        // Update Bullets
        for (let i = s.bullets.length - 1; i >= 0; i--) {
          const b = s.bullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          let bulletRemoved = false;

          if (b.isPlayer) {
            // Check collision with enemies
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const e = s.enemies[j];
              if (
                b.x + b.radius > e.x &&
                b.x - b.radius < e.x + e.width &&
                b.y + b.radius > e.y &&
                b.y - b.radius < e.y + e.height
              ) {
                e.health -= b.damage;
                bulletRemoved = true;

                // Spark particles
                for (let k = 0; k < 3; k++) {
                  s.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: -b.vx * 0.15 + (Math.random() * 80 - 40),
                    vy: Math.random() * 80 - 40,
                    life: 0.15,
                    maxLife: 0.15,
                    color: '#fef08a',
                    size: 2
                  });
                }

                if (e.health <= 0) {
                  destroyEnemy(e);
                  if (e.type === 'boss') {
                    s.bossDefeated = true;
                    // Add mission completion bonus score
                    s.score += 200;
                    setTimeout(() => {
                      onMissionVictory(s.score, s.enemiesDestroyed);
                    }, 1200);
                  }
                  s.enemies.splice(j, 1);
                }
                break;
              }
            }
          } else {
            // Enemy Bullet hitting player
            if (s.player.shieldTimer <= 0) {
              if (
                b.x + b.radius > s.player.x &&
                b.x - b.radius < s.player.x + s.player.width &&
                b.y + b.radius > s.player.y &&
                b.y - b.radius < s.player.y + s.player.height
              ) {
                bulletRemoved = true;
                s.player.health -= b.damage;
                s.player.shieldTimer = 1.8;
                sound.playExplosion(false);
                s.shakeTime = 0.25;

                if (s.player.health <= 0) {
                  onMissionDefeat(s.score, s.enemiesDestroyed);
                }
              }
            }
          }

          // Boundary removal
          if (bulletRemoved || b.x > cw + 50 || b.x < -50 || b.y > ch + 50 || b.y < -50) {
            s.bullets.splice(i, 1);
          }
        }

        // Update Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.x += p.vx * dt;
          p.pulse += dt * 5;

          // Pickup collision
          const dist = Math.hypot(
            (s.player.x + s.player.width / 2) - p.x,
            (s.player.y + s.player.height / 2) - p.y
          );

          if (dist < p.radius + s.player.width / 2) {
            sound.playPowerup();
            if (p.type === 'energy') {
              s.player.energy = Math.min(100, s.player.energy + 35);
              s.floatingTexts.push({ id: `p-${Date.now()}`, x: p.x, y: p.y, text: '+ENERGI', color: '#38bdf8', life: 1, maxLife: 1 });
            } else if (p.type === 'heal') {
              s.player.health = Math.min(s.player.maxHealth, s.player.health + 1);
              s.floatingTexts.push({ id: `p-${Date.now()}`, x: p.x, y: p.y, text: '+INTEGRITAS', color: '#4ade80', life: 1, maxLife: 1 });
            } else if (p.type === 'shield') {
              s.player.shieldTimer = 4.0;
              s.floatingTexts.push({ id: `p-${Date.now()}`, x: p.x, y: p.y, text: 'PERISAI KEBAL', color: '#c084fc', life: 1, maxLife: 1 });
            } else if (p.type === 'score') {
              s.score += 50;
              s.floatingTexts.push({ id: `p-${Date.now()}`, x: p.x, y: p.y, text: '+50 SKOR', color: '#facc15', life: 1, maxLife: 1 });
            }
            s.powerups.splice(i, 1);
            continue;
          }

          if (p.x < -30) {
            s.powerups.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const part = s.particles[i];
          part.x += part.vx * dt;
          part.y += part.vy * dt;
          part.life -= dt;
          if (part.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Update Floating Text
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 30 * dt;
          ft.life -= dt;
          if (ft.life <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Update Starfield parallax
        s.starfield.forEach(st => {
          st.x -= st.speed * dt * settings.enemySpeedMultiplier;
          if (st.x < 0) {
            st.x = cw;
            st.y = Math.random() * ch;
          }
        });

        // Update Nebula clouds
        s.clouds.forEach(cl => {
          cl.x -= cl.speed * dt * settings.enemySpeedMultiplier;
          if (cl.x < -cl.width) {
            cl.x = cw + 50;
            cl.y = Math.random() * ch;
          }
        });

        // Sync HUD with React via callback (throttled smoothly)
        onUpdateHUD({
          health: s.player.health,
          maxHealth: s.player.maxHealth,
          energy: s.player.energy,
          maxEnergy: s.player.maxEnergy,
          score: s.score,
          bossHealth: s.boss && s.boss.health > 0 ? s.boss.health : null,
          bossMaxHealth: s.boss ? s.boss.maxHealth : null
        });
      }

      // ================= RENDER LOGIC =================
      ctx.save();

      // Camera Shake
      if (s.shakeTime > 0) {
        const shakeMag = s.shakeTime * 12;
        ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
      }

      // Background Sky Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, ch);
      grad.addColorStop(0, mission.bgColors.skyTop);
      grad.addColorStop(1, mission.bgColors.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // Render Starfield
      s.starfield.forEach(st => {
        ctx.fillStyle = st.color;
        ctx.fillRect(st.x, st.y, st.size, st.size);
      });

      // Render Nebula Clouds
      s.clouds.forEach(cl => {
        ctx.fillStyle = mission.bgColors.cloudColor;
        ctx.beginPath();
        ctx.ellipse(cl.x, cl.y, cl.width / 2, cl.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Perspective Combat Grid line at bottom
      ctx.strokeStyle = mission.bgColors.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ch - 25);
      ctx.lineTo(cw, ch - 25);
      ctx.stroke();

      // Render Math Warp Gates
      s.gates.forEach(g => {
        const gateScreenX = (g.distance - s.distance) + 200;
        if (gateScreenX > -100 && gateScreenX < cw + 150) {
          ctx.save();
          ctx.translate(gateScreenX, ch / 2);

          // Glowing holographic gate ring
          ctx.strokeStyle = g.triggered ? '#334155' : '#22d3ee';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 20;

          ctx.beginPath();
          ctx.ellipse(0, 0, 35, ch * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Gate label
          ctx.fillStyle = '#67e8f9';
          ctx.font = 'bold 12px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`WARP ENKRIPSI #${g.questionIndex}`, 0, -ch * 0.42 - 12);

          ctx.restore();
        }
      });

      // Render Powerups
      s.powerups.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        const pulseScale = 1 + Math.sin(p.pulse) * 0.15;
        ctx.scale(pulseScale, pulseScale);

        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'energy' ? '#06b6d4' : p.type === 'heal' ? '#22c55e' : p.type === 'shield' ? '#a855f7' : '#eab308';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'energy' ? 'E' : p.type === 'heal' ? '+' : p.type === 'shield' ? 'S' : '★', 0, 1);

        ctx.restore();
      });

      // Render Enemies
      s.enemies.forEach(e => {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.type === 'boss') {
          // Boss Ship Rendering
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 15;

          // Main heavy fuselage
          ctx.fillStyle = '#1e1b4b';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(e.width, e.height / 2);
          ctx.lineTo(30, 0);
          ctx.lineTo(0, 20);
          ctx.lineTo(20, e.height / 2);
          ctx.lineTo(0, e.height - 20);
          ctx.lineTo(30, e.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glowing energy cores
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(e.width * 0.4, e.height / 2, 14, 0, Math.PI * 2);
          ctx.fill();

          // Boss Title Tag
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 11px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(mission.bossName, e.width / 2, -10);
        } else if (e.type === 'scout') {
          // Sleek purple scout
          ctx.fillStyle = '#4c1d95';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, e.height / 2);
          ctx.lineTo(e.width, 0);
          ctx.lineTo(e.width - 10, e.height / 2);
          ctx.lineTo(e.width, e.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (e.type === 'heavy') {
          // Armored Bomber
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          ctx.fillRect(0, 0, e.width, e.height);
          ctx.strokeRect(0, 0, e.width, e.height);
        } else {
          // Regular Red Drone
          ctx.fillStyle = '#991b1b';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, e.height / 2);
          ctx.lineTo(e.width, 0);
          ctx.lineTo(e.width * 0.7, e.height / 2);
          ctx.lineTo(e.width, e.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      // Render Player Jet
      if (s.player.health > 0) {
        ctx.save();
        ctx.translate(s.player.x, s.player.y);

        // Invincibility shield bubble
        if (s.player.shieldTimer > 0) {
          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.ellipse(s.player.width / 2, s.player.height / 2, s.player.width * 0.75, s.player.height * 0.9, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Engine Thruster Flame (Cyan neon glow)
        const flameLength = 18 + Math.random() * 12;
        const flameGrad = ctx.createLinearGradient(-flameLength, 0, 0, 0);
        flameGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        flameGrad.addColorStop(0.5, '#06b6d4');
        flameGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(0, s.player.height / 2 - 5);
        ctx.lineTo(-flameLength, s.player.height / 2);
        ctx.lineTo(0, s.player.height / 2 + 5);
        ctx.closePath();
        ctx.fill();

        // Metallic Blue Body
        const jetGrad = ctx.createLinearGradient(0, 0, s.player.width, 0);
        jetGrad.addColorStop(0, '#1e3a8a');
        jetGrad.addColorStop(0.5, '#2563eb');
        jetGrad.addColorStop(1, '#60a5fa');

        ctx.fillStyle = jetGrad;
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.5;

        // Fuselage path
        ctx.beginPath();
        ctx.moveTo(0, s.player.height / 2);
        ctx.lineTo(15, 4);
        ctx.lineTo(s.player.width - 8, s.player.height / 2 - 2);
        ctx.lineTo(s.player.width, s.player.height / 2);
        ctx.lineTo(s.player.width - 8, s.player.height / 2 + 2);
        ctx.lineTo(15, s.player.height - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Delta Wings with Red & White Racing Accents
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(12, s.player.height / 2);
        ctx.lineTo(26, -4);
        ctx.lineTo(34, s.player.height / 2 - 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(12, s.player.height / 2);
        ctx.lineTo(26, s.player.height + 4);
        ctx.lineTo(34, s.player.height / 2 + 2);
        ctx.closePath();
        ctx.fill();

        // White racing stripe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, s.player.height / 2 - 2, 10, 4);

        // Cockpit canopy
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(s.player.width * 0.6, s.player.height / 2, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Render Bullets
      s.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Particles
      s.particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Text
      s.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.font = 'bold 14px "Chakra Petch", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life / ft.maxLife;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [mission, isPaused, settings, onTriggerQuestion, onMissionVictory, onMissionDefeat, virtualDirection]);

  // Handle Math Challenge answer results when prop updates
  useEffect(() => {
    if (!lastAnswerResult) return;
    const s = stateRef.current;
    if (lastAnswerResult.isCorrect) {
      s.score += 100;
      s.player.energy = 100;
      triggerPlasmaSuperBlast();
    } else {
      s.player.energy = Math.max(0, s.player.energy - settings.wrongPenaltyEnergy);
    }
  }, [lastAnswerResult, settings.wrongPenaltyEnergy]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-black touch-none cursor-crosshair"
      />
    </div>
  );
};
