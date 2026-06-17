import { motion } from "motion/react";

interface HeroProps {
  state: "idle" | "countdown" | "charging" | "attacking" | "victory" | "defeated" | "hit";
  chargeCount: number;
}

export default function HeroCharacter({ state, chargeCount }: HeroProps) {
  // Goal is 100 taps
  const percent = Math.min(100, (chargeCount / 100) * 100);

  // Aura details based on charge percentage
  const getAuraColor = () => {
    if (percent < 30) return "rgba(59, 130, 246, 0.5)"; // Blue
    if (percent < 70) return "rgba(168, 85, 247, 0.7)"; // Purple
    if (percent < 100) return "rgba(234, 179, 8, 0.9)"; // Yellow
    return "rgba(244, 63, 94, 1.0)"; // Fire Magenta/Pink
  };

  const getAuraScale = () => {
    if (state === "defeated") return 0;
    return 1 + (percent / 100) * 0.5; // Up to 1.5x scale
  };

  // Determine emotional face expression based on game state
  // "normal", "charging", "happy", "dizzy", "firing"
  const getFaceExpression = () => {
    switch (state) {
      case "charging":
        return "charge";
      case "attacking":
        return "firing";
      case "victory":
        return "happy";
      case "defeated":
        return "dizzy";
      case "hit":
        return "hurt";
      default:
        return "normal";
    }
  };

  const expression = getFaceExpression();

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* 1. Energy Aura (Pulsing background) */}
      {(state === "charging" || state === "attacking" || state === "idle") && (
        <motion.div
          className="absolute rounded-full filter blur-xl opacity-70"
          style={{
            width: "130px",
            height: "130px",
            backgroundColor: getAuraColor(),
          }}
          animate={
            state === "charging"
              ? {
                  scale: [getAuraScale(), getAuraScale() * 1.15, getAuraScale()],
                  opacity: [0.6, 0.9, 0.6],
                }
              : {
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.5, 0.4],
                }
          }
          transition={{
            repeat: Infinity,
            duration: state === "charging" ? 0.2 : 1.5,
            ease: "easeInOut",
          }}
        />
      )}

      {/* 2. Main Character Frame */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={
          state === "charging"
            ? {
                y: [0, -3, 0, 3, 0],
                x: [-1, 2, -2, 1, 0],
                rotate: [-0.5, 0.5, -0.5, 0, 0],
              }
            : state === "victory"
            ? {
                y: [0, -25, 0, -15, 0],
                scale: [1, 1.05, 1],
              }
            : state === "defeated"
            ? {
                y: [0, 40],
                rotate: [0, 90],
                opacity: [1, 0],
              }
            : state === "hit"
            ? {
                x: [0, -15, 10, -5, 0],
                scale: [1, 0.9, 1],
              }
            : {
                y: [0, -4, 0], // Gentle breathing in idle
              }
        }
        transition={
          state === "charging"
            ? { repeat: Infinity, duration: 0.1, ease: "linear" }
            : state === "victory"
            ? { duration: 1.2, ease: "easeOut" }
            : state === "defeated"
            ? { duration: 0.8, ease: "easeOut" }
            : state === "hit"
            ? { duration: 0.5 }
            : { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINITIONS for Gradients */}
          <defs>
            <linearGradient id="heroMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d1d5db" />
              <stop offset="50%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#4b5563" />
            </linearGradient>
            <linearGradient id="heroVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="coreOverdrive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* BACKPACK MATCHING CORE CHARGE */}
          <rect x="58" y="105" width="84" height="40" rx="8" fill="#374151" />
          <rect
            x="64"
            y="110"
            width="72"
            height="15"
            rx="4"
            fill={percent >= 100 ? "#fda4af" : percent >= 70 ? "#fef08a" : "#93c5fd"}
            opacity={0.8}
          />

          {/* SHOULDER ARMORS */}
          {/* Left Shoulder */}
          <motion.path
            d="M45 105 C30 105, 30 130, 50 135 Z"
            fill="url(#heroMetal)"
            animate={
              state === "charging"
                ? { rotate: [0, -10, 0] }
                : { rotate: 0 }
            }
          />
          {/* Right Shoulder */}
          <motion.path
            d="M155 105 C170 105, 170 130, 150 135 Z"
            fill="url(#heroMetal)"
            animate={
              state === "charging"
                ? { rotate: [0, 10, 0] }
                : { rotate: 0 }
            }
          />

          {/* ARMS: Charged hands raise up during tapping */}
          {/* Left hand */}
          <motion.path
            d="M 40 120 C 20 120, 15 90, 25 75 C 30 65, 45 65, 40 90 Z"
            fill="#4b5563"
            animate={
              state === "charging"
                ? { y: [0, -15, 0], rotate: [0, -15, 0] }
                : state === "victory"
                ? { y: -30, rotate: -40, x: -10 }
                : { y: 0, rotate: 0 }
            }
          />
          {/* Right hand */}
          <motion.path
            d="M 160 120 C 180 120, 185 90, 175 75 C 170 65, 155 65, 160 90 Z"
            fill="#4b5563"
            animate={
              state === "charging"
                ? { y: [0, -15, 0], rotate: [0, 15, 0] }
                : state === "victory"
                ? { y: -30, rotate: 40, x: 10 }
                : { y: 0, rotate: 0 }
            }
          />

          {/* BODY / CHASSIS */}
          <rect x="55" y="100" width="90" height="65" rx="20" fill="url(#heroMetal)" stroke="#1f2937" strokeWidth="4" />

          {/* CHEST REACTOR (ENERGY METER FEEDBACK) */}
          <circle cx="100" cy="132" r="22" fill="#1e293b" stroke="#374151" strokeWidth="3" />
          <motion.circle
            cx="100"
            cy="132"
            r={10 + (percent / 100) * 10}
            fill={percent >= 100 ? "url(#coreOverdrive)" : "url(#coreGlow)"}
            animate={
              state === "charging"
                ? { scale: [1, 1.2, 1] }
                : { scale: [1, 1.05, 1] }
            }
            transition={{ repeat: Infinity, duration: Math.max(0.1, 1 - percent / 100) }}
          />
          {/* Reactor inner status ring */}
          <circle
            cx="100"
            cy="132"
            r="19"
            fill="none"
            stroke={percent >= 100 ? "#f43f5e" : percent >= 70 ? "#eab308" : "#60a5fa"}
            strokeDasharray="119"
            strokeDashoffset={119 - (percent / 100) * 119}
            strokeWidth="2"
            transform="rotate(-90 100 132)"
          />

          {/* HEAD / HELMET */}
          <rect x="60" y="40" width="80" height="70" rx="24" fill="url(#heroMetal)" stroke="#1f2937" strokeWidth="4" />
          {/* Helmet top accent */}
          <path d="M 85 41 L 100 24 L 115 41 Z" fill="#3b82f6" opacity={percent >= 100 ? 1 : 0.6} />
          {/* Ears / Antennas */}
          <rect x="52" y="60" width="8" height="25" rx="3" fill="#374151" />
          <rect x="140" y="60" width="8" height="25" rx="3" fill="#374151" />

          {/* FACE SCREEN / VISOR */}
          <rect x="70" y="52" width="60" height="42" rx="12" fill="url(#heroVisor)" />

          {/* EXPRESSIVE EMOTICON SCREEN */}
          {expression === "normal" && (
            <g>
              {/* Calm blinking eyes */}
              <ellipse cx="85" cy="70" rx="4" ry="5" fill="#60a5fa" />
              <ellipse cx="115" cy="70" rx="4" ry="5" fill="#60a5fa" />
              <path d="M 94 82 Q 100 86 106 82" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {expression === "charge" && (
            <g>
              {/* Lightning / sharp energised eyes */}
              <path d="M 80 73 L 88 64 L 84 70 L 91 67" stroke="#fbbf24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 110 73 L 118 64 L 114 70 L 121 67" stroke="#fbbf24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Intense focused mouth */}
              <line x1="93" y1="80" x2="107" y2="80" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {expression === "firing" && (
            <g>
              {/* Glowing horizontal laser slits */}
              <rect x="78" y="68" width="14" height="4" rx="2" fill="#f43f5e" />
              <rect x="108" y="68" width="14" height="4" rx="2" fill="#f43f5e" />
              {/* Open mouth yelling */}
              <ellipse cx="100" cy="80" rx="6" ry="4" fill="#f43f5e" />
            </g>
          )}

          {expression === "happy" && (
            <g>
              {/* Curve happy eyes */}
              <path d="M 78 74 Q 85 64 92 74" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 108 74 Q 115 64 122 74" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Big happy mouth */}
              <path d="M 92 80 Q 100 89 108 80 Z" fill="#4ade80" />
            </g>
          )}

          {expression === "dizzy" && (
            <g>
              {/* Spiral/Cross eyes */}
              <path d="M 81 65 L 89 73 M 89 65 L 81 73" stroke="#94a3b8" strokeWidth="3" />
              <path d="M 111 65 L 119 73 M 119 65 L 111 73" stroke="#94a3b8" strokeWidth="3" />
              {/* Squiggly mouth */}
              <path d="M 92 80 Q 96 76 100 80 T 108 80" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
            </g>
          )}

          {expression === "hurt" && (
            <g>
              {/* Tight squeezed eyes */}
              <path d="M 78 68 L 88 74 M 78 74 L 88 68" stroke="#f43f5e" strokeWidth="3.5" />
              <path d="M 112 68 L 122 74 M 112 74 L 122 68" stroke="#f43f5e" strokeWidth="3.5" />
              {/* Frown */}
              <path d="M 94 85 Q 100 79 106 85" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
