import { motion } from "motion/react";
import { Award, Zap, AwardIcon, RotateCcw, Flame, CheckCircle, AlertTriangle } from "lucide-react";

interface StatsPanelProps {
  tapHistory: number[]; // Taps recorded per second (10 items)
  totalTaps: number;
  onRetry: () => void;
}

export default function StatsPanel({ tapHistory, totalTaps, onRetry }: StatsPanelProps) {
  const goal = 100;
  const passed = totalTaps >= goal;
  const avgSpeed = (totalTaps / 10).toFixed(1);
  const peakSpeed = Math.max(...tapHistory, 0);
  
  // Calculate margins and ratios
  const percentOfGoal = Math.round((totalTaps / goal) * 100);

  // SVG Chart Dimensions & Computations
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const maxValInHistory = Math.max(...tapHistory, 10); // Standardize scale based on peak
  const maxScaleVal = Math.ceil(maxValInHistory / 5) * 5; // Round to nearest 5

  const points = tapHistory.map((val, i) => {
    const x = paddingX + (i * (chartWidth - paddingX * 2)) / 9;
    const y = chartHeight - paddingY - (val / maxScaleVal) * (chartHeight - paddingY * 2);
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Goal indicator line y-position
  const goalSpeedPerSec = 10; // 10 taps/sec = 100 taps total
  const goalY =
    chartHeight - paddingY - (goalSpeedPerSec / maxScaleVal) * (chartHeight - paddingY * 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl bg-[#0a0f18]/95 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Decorative Glowing Accent Grid */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-12 -mb-12" />

      {/* Header Banner */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
          style={{
            backgroundColor: passed ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: passed ? "#10b981" : "#ef4444",
            border: `1px solid ${passed ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
          }}
        >
          {passed ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>目標クリア (Target Cleared!)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>目標未達 (Target Failed)</span>
            </>
          )}
        </motion.div>
        
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          BATTLE RESULTS
        </h2>
        <p className="text-slate-400 text-sm mt-1">10秒間のスペース連打パーソナルリポート</p>
      </div>

      {/* Grid of Key Numerical Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* TOTAL TAPS METRIC */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-[#05070a]/70 border border-slate-805 p-4 rounded-xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>合計連打数 (Total Taps)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white font-mono">{totalTaps}</span>
            <span className="text-xs text-slate-400">/ 100 回</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                passed ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-rose-500"
              }`}
              style={{ width: `${Math.min(100, percentOfGoal)}%` }}
            />
          </div>
          <span className="text-[10px] text-right text-slate-400 mt-1 font-mono">
            目標の {percentOfGoal}% 達成
          </span>
        </motion.div>

        {/* AVERAGE TAPS/SEC METRIC */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-[#05070a]/70 border border-slate-805 p-4 rounded-xl flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>平均連打速度 (Avg Speed)</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-black text-white font-mono">{avgSpeed}</span>
            <span className="text-xs text-slate-400">回/秒</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {passed
              ? "目標基準 (10.0回/秒) をクリア！"
              : `秒間あと ${(10 - parseFloat(avgSpeed)).toFixed(1)}回 叩ければクリア...`}
          </p>
        </motion.div>

        {/* PEAK SPEED */}
        <div className="bg-[#05070a]/70 border border-slate-805 p-3 rounded-xl flex items-center justify-between col-span-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 leading-none">瞬間最高速度</p>
              <p className="text-xs text-slate-300 font-semibold mt-1">Peak Speed</p>
            </div>
          </div>
          <span className="text-2xl font-black text-cyan-300 font-mono">{peakSpeed} <span className="text-[10px] text-slate-400">回/秒</span></span>
        </div>

        {/* COMBAT RATING */}
        <div className="bg-[#05070a]/70 border border-slate-805 p-3 rounded-xl flex items-center justify-between col-span-1">
          <div className="flex items-center gap-2">
            <AwardIcon className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] text-slate-400 leading-none">戦闘力ランク</p>
              <p className="text-xs text-slate-300 font-semibold mt-1">Combat Rating</p>
            </div>
          </div>
          <span
            className="text-2xl font-black font-mono px-2 py-0.5 rounded"
            style={{
              color:
                totalTaps >= 140
                  ? "#a855f7" // Purple
                  : totalTaps >= 115
                  ? "#22c55e" // Green
                  : totalTaps >= 100
                  ? "#60a5fa" // Blue
                  : totalTaps >= 80
                  ? "#f59e0b" // Orange
                  : "#ef4444", // Red
            }}
          >
            {totalTaps >= 140
              ? "S"
              : totalTaps >= 115
              ? "A"
              : totalTaps >= 100
              ? "B"
              : totalTaps >= 80
              ? "C"
              : "D"}
          </span>
        </div>
      </div>

      {/* Real-time Taps over Time Speed Chart */}
      <div className="bg-[#05070a]/80 rounded-xl border border-slate-800/70 p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            <span>連打速度推移 (Taps Per Second Graph)</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">x: 経過時間(秒), y: 秒間連打回数</span>
        </div>

        {/* Render responsive SVG Chart */}
        <div className="w-full overflow-hidden flex justify-center">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-lg overflow-visible text-slate-500 font-mono text-[9px]"
          >
            {/* Background Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" />
            <line
              x1={paddingX}
              y1={chartHeight / 2}
              x2={chartWidth - paddingX}
              y2={chartHeight / 2}
              stroke="#1e293b"
              strokeDasharray="3 3"
            />
            <line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              stroke="#1e293b"
            />

            {/* Target 10 taps/sec Goal reference line */}
            {goalY >= paddingY && goalY <= chartHeight - paddingY && (
              <g>
                <line
                  x1={paddingX}
                  y1={goalY}
                  x2={chartWidth - paddingX}
                  y2={goalY}
                  stroke="rgba(16, 185, 129, 0.45)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - paddingX + 5}
                  y={goalY + 3}
                  className="fill-emerald-400 font-semibold"
                >
                  GOAL (10)
                </text>
              </g>
            )}

            {/* Grid Y-axis Labels */}
            <text x={paddingX - 8} y={paddingY + 3} textAnchor="end" className="fill-slate-500">
              {maxScaleVal}
            </text>
            <text x={paddingX - 8} y={chartHeight / 2 + 3} textAnchor="end" className="fill-slate-500">
              {Math.round(maxScaleVal / 2)}
            </text>
            <text x={paddingX - 8} y={chartHeight - paddingY + 3} textAnchor="end" className="fill-slate-500">
              0
            </text>

            {/* Grid X-axis Labels */}
            {points.map((p, i) => (
              <text key={i} x={p.x} y={chartHeight - paddingY + 14} textAnchor="middle" className="fill-slate-400">
                {i + 1}s
              </text>
            ))}

            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={passed ? "#06b6d4" : "#ec4899"} stopOpacity="0.4" />
                <stop offset="100%" stopColor={passed ? "#10b981" : "#f43f5e"} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Render Filled Area under line */}
            <path d={areaD} fill="url(#chartGradient)" />

            {/* Render Speed Plot Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={passed ? "#06b6d4" : "#ec4899"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            {/* Render Circles and labels on points */}
            {points.map((p, i) => (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke={p.val >= 10 ? "#10b981" : "#475569"}
                  strokeWidth="2"
                  whileHover={{ r: 6 }}
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  className="fill-slate-300 font-semibold text-[8px]"
                >
                  {p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Restart Button CTA */}
      <motion.button
        id="btn-retry-game"
        onClick={onRetry}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        <span>もう一度挑戦する (Play Again)</span>
      </motion.button>
    </motion.div>
  );
}
