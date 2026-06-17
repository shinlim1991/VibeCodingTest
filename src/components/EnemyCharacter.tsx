import { motion } from "motion/react";

interface EnemyProps {
  state: "idle" | "countdown" | "charging" | "attacking" | "victory" | "defeated" | "hit";
  chargeCount: number;
}

export default function EnemyCharacter({ state, chargeCount }: EnemyProps) {
  // Determine boss eyes
  const percent = Math.min(100, (chargeCount / 100) * 100);

  const getFaceStyle = () => {
    switch (state) {
      case "defeated":
        return "exploded";
      case "hit":
        return "stunned";
      case "victory":
        return "laughing";
      case "charging":
        return percent >= 80 ? "alarm" : "growling";
      default:
        return "menacing";
    }
  };

  const face = getFaceStyle();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Red evil aura, grows stronger as player fails to reach 100 or when boss prepares counters */}
      <motion.div
        className="absolute rounded-full filter blur-2xl opacity-40 bg-rose-600"
        style={{
          width: "140px",
          height: "140px",
        }}
        animate={
          state === "victory"
            ? {
                scale: [1.2, 1.6, 1.2],
                opacity: [0.5, 0.9, 0.5],
              }
            : state === "hit" || state === "defeated"
            ? {
                scale: [1, 0.3],
                opacity: [0.4, 0],
              }
            : {
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }
        }
        transition={{
          repeat: state === "victory" || state === "idle" || state === "charging" ? Infinity : 0,
          duration: state === "victory" ? 0.3 : 2,
          ease: "easeInOut",
        }}
      />

      {/* Main Enemy Body */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={
          state === "hit"
            ? {
                x: [0, 20, -15, 15, -10, 0],
                y: [0, -10, 10, -5, 5, 0],
                scale: [1, 0.85, 1.1, 0.95, 1],
                filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
              }
            : state === "defeated"
            ? {
                rotate: [0, 180, 360, 720],
                scale: [1, 1.1, 0.4, 0],
                opacity: [1, 1, 0.5, 0],
                y: [0, -50, 150],
              }
            : state === "victory"
            ? {
                y: [0, -10, 15, -10, 0],
                scale: [1, 1.2, 1.1, 1.25, 1],
              }
            : state === "charging"
            ? {
                // Shake more violently as the player's charge approaches 100
                y: percent >= 80 ? [0, -4, 4, -4, 0] : [0, -1, 1, 0],
                x: percent >= 80 ? [-3, 3, -3, 3, 0] : [0, 0],
              }
            : {
                // Floating up and down (slow sinister hover)
                y: [0, -10, 0],
              }
        }
        transition={
          state === "hit"
            ? { duration: 0.5 }
            : state === "defeated"
            ? { duration: 1.2, ease: "easeInOut" }
            : state === "victory"
            ? { repeat: Infinity, duration: 1.5, ease: "linear" }
            : state === "charging"
            ? { repeat: Infinity, duration: percent >= 80 ? 0.12 : 0.4 }
            : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
        }
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for Gradients */}
          <defs>
            <linearGradient id="bossArmor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" /> {/* Dark violet */}
              <stop offset="60%" stopColor="#1e1b4b" /> {/* Indig-950 */}
              <stop offset="100%" stopColor="#030712" /> {/* Black */}
            </linearGradient>
            <linearGradient id="bossMetalPlates" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="bossEyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>
          </defs>

          {/* BACK SPARK ELEMENTS (Floating shield or spikes) */}
          <g opacity="0.8">
            <motion.path
              d="M 30 50 L 50 20 L 70 50 Z"
              fill="#1e1b4b"
              stroke="#ec4899"
              strokeWidth="2"
              animate={{ rotate: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
              d="M 170 50 L 150 20 L 130 50 Z"
              fill="#1e1b4b"
              stroke="#ec4899"
              strokeWidth="2"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
              d="M 25 120 L 5 130 L 30 145 Z"
              fill="#1e1b4b"
              stroke="#f43f5e"
              strokeWidth="2.5"
            />
            <motion.path
              d="M 175 120 L 195 130 L 170 145 Z"
              fill="#1e1b4b"
              stroke="#f43f5e"
              strokeWidth="2.5"
            />
          </g>

          {/* CHASSIS ORB */}
          <circle cx="100" cy="100" r="65" fill="url(#bossArmor)" stroke="#090d16" strokeWidth="5" />

          {/* STEEL ARMOR CORNER PLATES */}
          {/* Top-left plate */}
          <path d="M 60 45 C 75 35, 125 35, 140 45 L 125 60 C 110 53, 90 53, 75 60 Z" fill="url(#bossMetalPlates)" stroke="#111827" strokeWidth="2" />
          {/* Bottom protective jaw plate */}
          <path d="M 50 120 C 70 155, 130 155, 150 120 L 130 125 C 115 133, 85 133, 70 125 Z" fill="url(#bossMetalPlates)" stroke="#111827" strokeWidth="2" />

          {/* MENACING EYE ORB CORE */}
          <circle cx="100" cy="100" r="38" fill="#111827" stroke="#312e81" strokeWidth="4" />

          {/* LARGE GLOWING PUPIL */}
          <motion.circle
            cx="100"
            cy="100"
            r={face === "stunned" ? "12" : face === "exploded" ? "4" : "24"}
            fill="url(#bossEyeGlow)"
            animate={
              state === "charging"
                ? { scale: [1, 1.15, 1] }
                : { scale: [1, 1.04, 1] }
            }
            transition={{ repeat: Infinity, duration: percent >= 80 ? 0.15 : 1 }}
          />

          {/* CYBERNETIC PUPIL PATTERNS */}
          {face === "menacing" && (
            <g>
              {/* Vicious slit pupil */}
              <ellipse cx="100" cy="100" rx="6" ry="20" fill="#fef08a" />
              <circle cx="100" cy="100" r="3" fill="#ffffff" />
              {/* Digital target lines */}
              <line x1="100" y1="68" x2="100" y2="76" stroke="#f43f5e" strokeWidth="2" />
              <line x1="100" y1="124" x2="100" y2="132" stroke="#f43f5e" strokeWidth="2" />
              {/* Menacing eyebrows */}
              <path d="M 50 68 Q 100 85 150 68" fill="none" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {face === "growling" && (
            <g>
              {/* Wide red lens, anger */}
              <ellipse cx="100" cy="100" rx="14" ry="14" fill="#fb7185" />
              <polygon points="100,85 110,105 90,105" fill="#fef08a" />
              <path d="M 50 64 Q 100 89 150 64" fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
            </g>
          )}

          {face === "alarm" && (
            <g>
              {/* High alarm glowing state */}
              <circle cx="100" cy="100" r="28" fill="#ec4899" />
              <polygon points="100,60 115,110 85,110" fill="#ffffff" />
              <circle cx="100" cy="100" r="8" fill="#e11d48" />
              <path d="M 45 55 L 100 85 L 155 55" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            </g>
          )}

          {face === "stunned" && (
            <g>
              {/* Shrunken dizzy cross pupil */}
              <ellipse cx="100" cy="100" rx="8" ry="8" fill="#fbbf24" />
              <path d="M 92 92 L 108 108 M 108 92 L 92 108" stroke="#ffffff" strokeWidth="2.5" />
              {/* Sweaty lines, worried armor eyebrows */}
              <path d="M 60 78 Q 100 65 140 78" fill="none" stroke="#f59e0b" strokeWidth="4.5" />
            </g>
          )}

          {face === "exploded" && (
            <g>
              {/* Totally broken eyeball */}
              <path d="M 85 85 L 115 115 M 115 85 L 85 115" stroke="#4b5563" strokeWidth="4" />
              <path d="M 70 100 H 130" stroke="#4b5563" strokeWidth="3" />
            </g>
          )}

          {face === "laughing" && (
            <g>
              {/* Happy/mocking squinting evil eye */}
              <path d="M 75 105 Q 100 70 125 105" fill="none" stroke="#fb7185" strokeWidth="6.5" strokeLinecap="round" />
              <path d="M 75 100 Q 100 125 125 100" fill="none" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" />
              {/* Evil smug eyebrow arches */}
              <path d="M 55 55 Q 80 75 100 60 Q 120 75 145 55" fill="none" stroke="#be123c" strokeWidth="4.5" strokeLinecap="round" />
            </g>
          )}

          {/* ADDITIONAL DETAIL: CYBER WHISKERS / HORNS */}
          <path d="M 100 35 L 100 15" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" opacity={percent >= 80 ? 1 : 0.6} />
          {percent >= 100 && (
            <circle cx="100" cy="12" r="5" fill="#f43f5e">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="0.2s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
