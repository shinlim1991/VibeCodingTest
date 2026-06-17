import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Keyboard,
  Gamepad2,
  Play,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ChevronRight,
  Sparkles,
  Swords,
  XCircle
} from "lucide-react";
import HeroCharacter from "./components/HeroCharacter";
import EnemyCharacter from "./components/EnemyCharacter";
import StatsPanel from "./components/StatsPanel";
import { sound } from "./utils/sound";

// Particles for satisfying tap feedback
interface TapParticle {
  id: number;
  x: number;
  y: number;
  text: string;
}

export default function App() {
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "battle_animation" | "result">("idle");
  const [tapsCount, setTapsCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(10.0);
  const [countdown, setCountdown] = useState<number>(3);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("spacebar_high_score") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuteState());
  const [particles, setParticles] = useState<TapParticle[]>([]);
  const [battleStep, setBattleStep] = useState<number>(0); // 0: Fire start, 1: Impact, 2: Final blow / defeat, 3: Completed
  
  // Cheat macro status state
  const [isMacroActive, setIsMacroActive] = useState<boolean>(false);

  const historyRef = useRef<number[]>(new Array(10).fill(0));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const latestTapsCount = useRef<number>(0);
  const particlesIdRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const macroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref up to date for key listeners
  useEffect(() => {
    latestTapsCount.current = tapsCount;
  }, [tapsCount]);

  // Keep playing reference
  useEffect(() => {
    isPlayingRef.current = (gameState === "playing");
  }, [gameState]);

  // Track dynamic time left via a ref to completely prevent stale closure ticks
  const timeLeftRef = useRef<number>(10.0);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Reference to the freshest version of triggerTap to permit access inside the setInterval macro
  const triggerTapRef = useRef<() => void>(() => {});

  // Triggering Spacebar tap action (with ref-based dynamic clock timing)
  const triggerTap = () => {
    if (gameState !== "playing" || timeLeftRef.current <= 0) return;

    sound.playTap(latestTapsCount.current / 100);

    setTapsCount((prev) => {
      const newCount = prev + 1;
      
      // Map elapsed seconds to history slots (0-9)
      const elapsed = 10 - timeLeftRef.current;
      const secondIndex = Math.min(9, Math.floor(elapsed));
      historyRef.current[secondIndex] = (historyRef.current[secondIndex] || 0) + 1;
      
      return newCount;
    });

    // Create tap visual floating particle
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const pX = Math.cos(randomAngle) * distance;
    const pY = Math.sin(randomAngle) * distance - 20;

    const newParticle: TapParticle = {
      id: particlesIdRef.current++,
      x: pX,
      y: pY,
      text: `+1`
    };

    setParticles((prev) => [...prev, newParticle]);

    // Cleanup particle after a brief duration
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 600);
  };

  useEffect(() => {
    triggerTapRef.current = triggerTap;
  }, [tapsCount, gameState, timeLeft]);

  // Start continuous turbo tap macro
  const startMacro = () => {
    if (macroIntervalRef.current) return;
    setIsMacroActive(true);
    triggerTapRef.current();
    macroIntervalRef.current = setInterval(() => {
      triggerTapRef.current();
    }, 35); // Rapid auto-tapping every 35 milliseconds (~28 taps per second)
  };

  // Stop continuous turbo tap macro
  const stopMacro = () => {
    if (macroIntervalRef.current) {
      clearInterval(macroIntervalRef.current);
      macroIntervalRef.current = null;
    }
    setIsMacroActive(false);
  };

  // Stop macro when changing state or unmounting
  useEffect(() => {
    if (gameState !== "playing") {
      stopMacro();
    }
  }, [gameState]);

  // Cleanup macro interval on unmount
  useEffect(() => {
    return () => {
      if (macroIntervalRef.current) {
        clearInterval(macroIntervalRef.current);
      }
    };
  }, []);

  // Handle Spacebar and Secret Cheat Macro ('0') listening globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser spacebar scroll behavior
      if (e.code === "Space") {
        e.preventDefault();
        if (e.repeat) return; // Prevent counting on keydown hold/repeat
        if (isPlayingRef.current) {
          triggerTap();
        } else if (gameState === "idle") {
          startGame();
        }
      } else if (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0") {
        if (e.repeat) return; // Prevent setting duplicate intervals on repeat
        if (isPlayingRef.current) {
          e.preventDefault();
          startMacro();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0") {
        stopMacro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Mute toggle helper
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Game Start Sequence
  const startGame = () => {
    // Reset configurations
    setTapsCount(0);
    setTimeLeft(10.0);
    setCountdown(3);
    setBattleStep(0);
    historyRef.current = new Array(10).fill(0);
    setGameState("countdown");

    // Clear animations or existing timeouts
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Dynamic initial play chime (helps bypass browser autoplay restrictions)
    sound.playBeep(false);

    let currentCount = 3;
    countdownRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        sound.playBeep(false);
      } else if (currentCount === 0) {
        // GO state
        setCountdown(0);
        sound.playBeep(true);
      } else {
        clearInterval(countdownRef.current!);
        setGameState("playing");
        startTimer();
      }
    }, 1000);
  };

  // 10-Second Countdown Timer Engine using Epoch offset
  const startTimer = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingSecs = Math.max(0, 10 - elapsed / 1000);
      setTimeLeft(parseFloat(remainingSecs.toFixed(2)));

      if (elapsed >= 10000) {
        if (timerRef.current) clearInterval(timerRef.current);
        triggerBattlePhase();
      }
    }, 33); // Sync display at ~30 FPS
  };

  // Determine battle performance threshold results
  const triggerBattlePhase = () => {
    setGameState("battle_animation");
    setBattleStep(0); // Attack launch

    const finalScore = latestTapsCount.current;
    const passed = finalScore >= 100;

    // STAGED TIMED OUT ANIMATION STAGES for battle cinematic
    if (passed) {
      // SUCCESS ANIMATION TIMELINE:
      // 0s: Launch laser beam sequence
      sound.playLaser();
      
      // 1.0s: Strike impact on standard boss
      setTimeout(() => {
        setBattleStep(1); // Hits enemy
        sound.playExplosion();
      }, 1000);

      // 2.3s: Enemy explodes & flies out, player wins
      setTimeout(() => {
        setBattleStep(2); // Boss defeat complete
        sound.playVictoryJingle();
        
        // Save new highscore locally
        try {
          const currentHigh = parseInt(localStorage.getItem("spacebar_high_score") || "0", 10);
          if (finalScore > currentHigh) {
            localStorage.setItem("spacebar_high_score", finalScore.toString());
            setHighScore(finalScore);
          }
        } catch {}
      }, 2300);

      // 3.8s: Cinematic completed, offer user result display
      setTimeout(() => {
        setBattleStep(3);
      }, 3500);

    } else {
      // FAILURE DIZZYING STAGES:
      // 0s: Beam tries to charge but fizzles. Hero gets tired.
      sound.playFizzle();

      // 1.0s: Enemy laughs & counter blasts hero with plasma fire
      setTimeout(() => {
        setBattleStep(1); // Boss counterattack hits player
        sound.playExplosion();
      }, 1000);

      // 2.3s: Hero collapses, dizzy, boss triumphs. Defeat theme plays.
      setTimeout(() => {
        setBattleStep(2); // Hero falls
        sound.playDefeatJingle();
      }, 2300);

      // 3.8s: Transition ready to stats
      setTimeout(() => {
        setBattleStep(3);
      }, 3500);
    }
  };

  // Proceed from battle cinematic to stats panel immediately
  const handleRevealStats = () => {
    setGameState("result");
  };

  // Calculate quick metrics for real-time widgets
  const currentRatio = Math.min(1.0, tapsCount / 100);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05070a] font-sans text-white flex flex-col items-center justify-between py-6 px-4">
      {/* Visual Retro Glow Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 scanlines opacity-20" />
      <div className="absolute inset-0 pointer-events-none tech-grid opacity-25" />

      {/* Decorative starry glowing backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* TOP HEADER STATUS BAR */}
      <header className="relative w-full max-w-4xl z-20 flex items-center justify-between mb-4 border-b border-slate-800 pb-4 bg-[#0a0f18]/30 px-4 py-3 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">Operation</span>
            <span className="text-xl font-black text-blue-500 tracking-tighter">SPACEBAR OVERDRIVE</span>
          </div>
        </div>

        {/* Global Sound, High Score and Game status indicators in the Header */}
        <div className="flex items-center gap-6">
          <div className="text-center hidden md:block">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Time Limit</div>
            <div className="text-lg font-mono text-cyan-400 font-bold tracking-widest">10.00s</div>
          </div>

          <div className="bg-[#0a0f18] border border-slate-850 rounded-lg px-3 py-1 text-xs font-mono flex items-center gap-2">
            <span className="text-slate-500">HI-SCORE:</span>
            <span className="text-cyan-400 font-black">{highScore}</span>
            <span className="text-[9px] text-slate-500">回</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="control-mute"
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 transition-colors border border-slate-800 text-slate-400 hover:text-white"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-500" />}
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN DYNAMIC CONTENT CONTAINER */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center z-20 relative">
        <AnimatePresence mode="wait">
                    {/* STATE 1: IDLE / OUTLET SCREEN */}
          {gameState === "idle" && (
            <motion.div
              key="screen-idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-2xl bg-[#0a0f18]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 text-center shadow-2xl relative overflow-hidden"
            >
              {/* Retro decorative framing glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
              
              <div className="mb-6 inline-flex p-3 bg-[#05070a]/90 rounded-full border border-slate-800 ring-4 ring-blue-500/10 animate-[pulse_2.5s_infinite]">
                <Swords className="w-10 h-10 text-blue-500" />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                10秒間スペースキー連打バトル
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-6">
                10秒間でスペースキーを限界まで叩け！
                <br />
                目標は <span className="text-blue-400 font-bold decoration-solid underline decoration-2 underline-offset-4">100回</span>。
                チャージしたパワーで、巨大エネミーボスを一撃で駆逐せよ！
              </p>

              {/* Targets and Rules Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">成功条件: 【勝者】</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      10秒間で100回以上。
                      <br />
                      極太レーザー連撃でボスを消沈
                    </p>
                  </div>
                </div>

                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">失敗条件: 【敗北】</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      10秒間で99回以下。
                      <br />
                      パワーが暴走、ボスの反撃に沈む
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Trigger Button */}
              <div className="flex flex-col items-center gap-4">
                <motion.button
                  id="btn-start-game"
                  onClick={startGame}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg shadow-lg tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="fill-white w-5 h-5" />
                  <span>バトルスタート (SPACE / CLICK)</span>
                </motion.button>
                <div className="flex flex-col items-center gap-2 mt-1 select-none">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono opacity-85">
                    <Keyboard className="w-4 h-4" />
                    <span>スペースキー または どこでもクリックで開始・連打可能</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 px-3 py-1 bg-slate-950/40 border border-slate-900 rounded-lg" title="Secret macro command activated">
                    <span className="text-cyan-600 font-bold">💡 [裏メカニクス]</span>
                    <span>戦闘中に数字の <span className="text-cyan-500 font-bold font-sans">0</span> キー長押し or 連打で連続スペース入力マクロが発動！</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: COUNTDOWN TIMER OVERLAY */}
          {gameState === "countdown" && (
            <motion.div
              key="screen-countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center justify-center h-64 text-center select-none"
            >
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-mono">Combat System Loading</p>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={countdown}
                  initial={{ opacity: 0, y: 40, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 1.5, filter: "blur(5px)" }}
                  transition={{ duration: 0.4 }}
                  className="font-black"
                >
                  {countdown === 0 ? (
                    <span className="text-6xl md:text-8xl text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)] tracking-wider">
                      MASH !!
                    </span>
                  ) : (
                    <span className="text-8xl md:text-9xl text-cyan-400 font-mono drop-shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                      {countdown}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
              <p className="text-sm text-slate-400 mt-6 tracking-wide animate-pulse">準備を整えろ！</p>
            </motion.div>
          )}

          {/* STATE 3: ACTIVE PLAYING GAMEPLAY ARENA */}
          {gameState === "playing" && (
            <motion.div
              key="screen-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              {/* TOP PLAY STATS BAR */}
              <div className="w-full flex items-center justify-between mb-4 bg-slate-900/40 border border-slate-800/80 rounded-xl px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-mono leading-none">TIME REMAINING</span>
                  <span className="text-2xl md:text-3xl font-black font-mono text-cyan-300 tracking-tight mt-1">
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>

                {/* Big space energy gauge bar */}
                <div className="flex-1 mx-6 relative">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1.5 px-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>CHARGE: {tapsCount}</span>
                    </span>
                    <span>GOAL: 100</span>
                  </div>
                  
                  {/* Outer Bar */}
                  <div className="w-full h-4 bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        tapsCount >= 100
                          ? "bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                          : tapsCount >= 70
                          ? "bg-gradient-to-r from-purple-500 to-yellow-500"
                          : "bg-gradient-to-r from-blue-500 to-purple-500"
                      }`}
                      style={{ width: `${Math.min(100, (tapsCount / 100) * 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                    
                    {/* Goal reference indicator */}
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none pr-2">
                      <div className="w-1.5 h-full bg-emerald-500/80 rounded" title="Goal 100 Line" />
                    </div>
                  </div>

                  {/* Goal cleared floating banner */}
                  {tapsCount >= 100 && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-0 -bottom-5 text-[9px] font-black text-emerald-400 font-mono flex items-center gap-0.5"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> OVERDRIVE ACTIVE
                    </motion.span>
                  )}
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-500 font-mono leading-none">KEY TAPS</span>
                  <span className="text-2xl md:text-3xl font-black font-mono text-white tracking-tight mt-1">
                    {tapsCount}
                  </span>
                </div>
              </div>

              {/* BATTLEGROUND DUEL STAGE */}
              <div className="w-full bg-[#0a0f18]/80 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden my-4 w-full">
                {/* Horizontal Arena division laser wire grid */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-950/40 pointer-events-none" />

                {/* Macro Overdrive Pulse Feedback overlay */}
                <AnimatePresence>
                  {isMacroActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-cyan-500/[0.04] backdrop-blur-[0.5px] border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center pointer-events-none"
                    >
                      <div className="bg-slate-950/90 border border-cyan-500/40 text-cyan-400 text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-2 font-mono font-bold tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-pulse">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                        <span>⚡ SPACE MACRO ACTIVE [TURBO FIRES ON] ⚡</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-full flex items-center justify-between px-2 md:px-12 relative z-10">
                  {/* Hero side */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <HeroCharacter state="charging" chargeCount={tapsCount} />

                      {/* Display floating satisfying tap count indicators (+1s) */}
                      <div className="absolute inset-0 pointer-events-none z-30">
                        {particles.map((p) => (
                          <motion.span
                            key={p.id}
                            style={{ left: `50%`, top: `40%` }}
                            initial={{ opacity: 1, scale: 0.8, x: p.x, y: p.y }}
                            animate={{ opacity: 0, y: p.y - 60, scale: 1.3 }}
                            className="absolute font-black text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-cyan-300 font-mono select-none"
                          >
                            {p.text}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 border border-blue-800 text-blue-400 font-bold tracking-widest leading-none">
                      HERO (YOU)
                    </span>
                  </div>

                  {/* VS Symbol or Arena charging reactor beam */}
                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        className="w-12 h-12 rounded-full border border-blue-500/20 flex items-center justify-center bg-blue-500/5"
                        animate={
                          tapsCount >= 80
                            ? { scale: [1, 1.3, 1], borderColor: ["#3b82f6", "#60a5fa", "#3b82f6"] }
                            : { scale: [1, 1.05, 1], borderColor: ["#1e3a8a", "#2563eb", "#1e3a8a"] }
                        }
                        transition={{ repeat: Infinity, duration: Math.max(0.1, 1 - tapsCount / 100) }}
                      >
                        <span className="font-mono text-sm font-black text-blue-500 tracking-wider">VS</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Enemy side */}
                  <div className="flex flex-col items-center gap-2">
                    <EnemyCharacter state="charging" chargeCount={tapsCount} />
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 border border-rose-900 text-rose-400 font-bold tracking-widest leading-none">
                      BOSS ENEMY
                    </span>
                  </div>
                </div>
              </div>

              {/* TACTILE MASSIVE AREA CLICK BUTTON FOR MOBILE/IFRAME FOCUS DETECTOR */}
              <div className="w-full max-w-lg mt-2 mb-4">
                <motion.button
                  id="btn-mash-pad"
                  onClick={triggerTap}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-24 md:h-28 rounded-2xl bg-[#0a0f18] hover:bg-[#0d1522] border border-blue-500/30 hover:border-blue-500/60 text-slate-400 hover:text-white flex flex-col justify-center items-center gap-2 cursor-pointer relative overflow-hidden group shadow-lg"
                >
                  {/* Energy waves inside button */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <span className="text-sm font-extrabold tracking-widest text-blue-400 group-hover:text-cyan-300 transition-colors uppercase">
                    スペースキー または ここを猛連打！
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Zap className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                    <span>TAP DEVICE SCREEN / CLICK TO RE-FOCUS WINDOW</span>
                  </div>
                  
                  {/* High visual speed ticker */}
                  <div className="absolute bottom-1 right-2 text-[9px] text-slate-600 font-mono">
                    TPS: {((historyRef.current[Math.max(0, Math.floor(10 - timeLeft) - 1)] || 0)).toFixed(0)} / s
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STATE 4: CINEMATIC BATTLE RESOLUTION SCREEN */}
          {gameState === "battle_animation" && (
            <motion.div
              key="screen-battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl bg-slate-950/90 rounded-2xl border border-slate-900 p-8 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden"
            >
              <div className="absolute top-3 left-4 text-xs font-mono text-slate-500 uppercase tracking-widest select-none flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" strokeLinecap="round" />
                <span>RESOLVING COMBAT SIMULATION SCENE...</span>
              </div>

              {/* TIMELINE VISUAL OUTCOMES */}
              <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-between relative mt-4">
                
                {/* 1. HERO FIGHTER */}
                <div className="flex flex-col items-center order-1 md:order-none relative z-10 my-4 md:my-0">
                  <HeroCharacter
                    state={
                      tapsCount >= 100
                        ? battleStep === 0
                          ? "attacking"
                          : battleStep === 1
                          ? "attacking"
                          : "victory"
                        : battleStep === 0
                        ? "idle"
                        : battleStep === 1
                        ? "hit"
                        : "defeated"
                    }
                    chargeCount={tapsCount}
                  />
                  <span className="text-xs font-mono text-slate-400 mt-2 font-semibold">
                    HERO Lvl.{tapsCount}
                  </span>
                </div>

                {/* THE MIDDLE LASER/FIRE EFFECTS CANAL */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none h-24 overflow-visible z-20 flex items-center justify-center">
                  
                  {/* PATH A: SUCCESS LASER EFFECT */}
                  {tapsCount >= 100 && battleStep < 2 && (
                    <motion.div
                      initial={{ scaleY: 0.1, opacity: 0.2 }}
                      animate={
                        battleStep === 0
                          ? { scaleY: [0.1, 1, 0.8], opacity: [0.3, 1, 0.9], x: [-100, 0] }
                          : { scaleY: [1, 2, 0.3, 0], opacity: [0.9, 1, 0.4, 0] }
                      }
                      transition={{ duration: battleStep === 0 ? 0.3 : 0.8 }}
                      className="w-full flex items-center"
                    >
                      {/* Laser shaft */}
                      <div className="h-10 w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-400 relative rounded-full">
                        <div className="absolute inset-0 h-4 bg-white rounded-full top-3 filter blur-sm" />
                        
                        {/* Shimmer laser sparklers */}
                        <div className="absolute -inset-2 bg-cyan-400/30 filter blur-md animate-pulse rounded-full" />
                      </div>

                      {/* Laser point impact sparkles */}
                      {battleStep === 1 && (
                        <motion.div
                          animate={{ scale: [1, 2.5, 1], rotate: [0, 90] }}
                          transition={{ repeat: Infinity, duration: 0.2 }}
                          className="absolute right-12 w-16 h-16 bg-yellow-300 rounded-full filter blur-sm flex items-center justify-center"
                        >
                          <div className="w-8 h-8 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* PATH B: FAIL FIZZLE & ENEMY PLASMA COUNTER BLAST */}
                  {tapsCount < 100 && (
                    <div className="w-full h-full relative">
                      
                      {/* Step 0: Small smoke/fizzle puff at player */}
                      {battleStep === 0 && (
                        <motion.div
                          initial={{ scale: 0.1, opacity: 0 }}
                          animate={{ scale: [0.5, 1.4, 0.9], opacity: [0, 0.8, 0], x: [-80, -40] }}
                          transition={{ duration: 0.9 }}
                          className="absolute left-16 top-1/2 h-10 w-10 bg-slate-500 rounded-full filter blur-md flex items-center justify-center"
                        >
                          <span className="text-[10px] text-zinc-300 font-mono">FIZZLE</span>
                        </motion.div>
                      )}

                      {/* Step 1: Boss fires colossal shadow laser of retribution */}
                      {battleStep === 1 && (
                        <motion.div
                          initial={{ scaleY: 0.1, opacity: 0 }}
                          animate={{ scaleY: [0.1, 1.5, 1.2], opacity: [0.3, 1, 0.9] }}
                          transition={{ duration: 0.3 }}
                          className="w-full flex items-center flex-row-reverse"
                        >
                          <div className="h-12 w-full bg-gradient-to-l from-rose-600 via-purple-600 to-rose-400 relative rounded-full">
                            <div className="absolute inset-x-0 h-5 bg-yellow-200 rounded-full top-3.5 filter blur-xs" />
                            <div className="absolute -inset-3 bg-rose-600/30 filter blur-md animate-pulse rounded-full" />
                          </div>
                        </motion.div>
                      )}

                    </div>
                  )}

                </div>

                {/* 2. ENEMY BOSS FIGHTER */}
                <div className="flex flex-col items-center order-2 md:order-none relative z-10 my-4 md:my-0">
                  <EnemyCharacter
                    state={
                      tapsCount >= 100
                        ? battleStep === 0
                          ? "charging"
                          : battleStep === 1
                          ? "hit"
                          : "defeated"
                        : battleStep === 0
                        ? "idle"
                        : battleStep === 1
                        ? "victory"
                        : "victory"
                    }
                    chargeCount={tapsCount}
                  />
                  <span className="text-xs font-mono text-slate-400 mt-2 font-semibold">
                    BOSS MASH-BOT
                  </span>
                </div>

              </div>

              {/* ACTION DIALOG TITLE */}
              <div className="relative text-center w-full max-w-lg mt-8 mb-4 h-20 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {/* Step 0: Startup words */}
                  {battleStep === 0 && (
                    <motion.div
                      key="step-0-anim"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-center"
                    >
                      <h3 className="text-xl md:text-2xl font-black font-mono tracking-wider text-yellow-500 animate-pulse">
                        {tapsCount >= 100 ? "POWER PEAK ACHIEVED!" : "CHARGE INSUFFICIENT!"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-widest">
                        {tapsCount >= 100 ? "Firing ultimate supercharged beam" : "Energy loop collapsing..."}
                      </p>
                    </motion.div>
                  )}

                  {/* Step 1: Laser blast hit impact */}
                  {battleStep === 1 && (
                    <motion.div
                      key="step-1-anim"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <h3 className={`text-2xl md:text-3xl font-black italic tracking-tighter ${
                        tapsCount >= 100 ? "text-cyan-400" : "text-rose-500"
                      }`}>
                        {tapsCount >= 100 ? "CRITICAL HIT !!!" : "ENEMY STRIKES BACK !!!"}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono mt-1">
                        {tapsCount >= 100 ? "BOSS SHELL FRACTURED" : "CRITICAL CHASSIS DAMAGE"}
                      </p>
                    </motion.div>
                  )}

                  {/* Step 2: Ultimate resolve */}
                  {battleStep === 2 && (
                    <motion.div
                      key="step-2-anim"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center"
                    >
                      <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${
                        tapsCount >= 100 ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-rose-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      }`}>
                        {tapsCount >= 100 ? "VICTORY !!!" : "DEFEAT !!!"}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-1 tracking-widest uppercase">
                        {tapsCount >= 100 ? "Enemy boss totally vaporized!" : "Fighter was incinerated..."}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Battle ends */}
                  {battleStep === 3 && (
                    <motion.div
                      key="step-3-anim"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="text-sm font-semibold text-indigo-300">シミュレーションが完了しました。</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">Battle telemetry ready</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* TIMELINE NEXT TRIGGER CTA */}
              <div className="mt-4 flex flex-col items-center w-full max-w-xs">
                {battleStep === 3 ? (
                  <motion.button
                    id="btn-show-stats"
                    onClick={handleRevealStats}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 text-slate-950 font-black tracking-wider py-4 px-6 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2"
                  >
                    <span>戦績レポートを表示 (Reveal Stats)</span>
                    <ChevronRight className="w-5 h-5 shrink-0" />
                  </motion.button>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic animate-pulse">
                    シネマティックアニメーション再生中... (Skip available on completion)
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STATE 5: PERFORMANCE REPORT STATS PANEL */}
          {gameState === "result" && (
            <motion.div
              key="screen-result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-4"
            >
              <StatsPanel
                totalTaps={tapsCount}
                tapHistory={historyRef.current}
                onRetry={startGame}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER METADATA SYSTEM LABEL */}
      <footer className="w-full max-w-4xl z-20 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-4 mt-6">
        <p className="tracking-wide">
          10-Second Spacebar Overdrive Game — Created for maximum tactile gaming efficiency.
        </p>
        <p className="font-mono tracking-widest mt-2 sm:mt-0 uppercase">
          [ FPS STATUS: 60Hz | GOAL: 100 TAPS / 10 SECONDS ]
        </p>
      </footer>
    </div>
  );
}
