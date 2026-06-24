import React, { useState, useEffect, useRef } from "react";
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
  type: "positive" | "negative";
}

interface QuizSlide {
  statement: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  category: string;
  theme: string;
  slides: QuizSlide[];
}

const QUIZ_DATA_JA: QuizQuestion[] = [
  {
    category: "数学・算数 [Mathematics]",
    theme: "数式＆ロジックの正誤をジャッジせよ！",
    slides: [
      { statement: "5 + 7 = 12", isCorrect: true },
      { statement: "9 × 8 = 71", isCorrect: false },
      { statement: "150 ÷ 3 = 50", isCorrect: true },
      { statement: "3⁴ (3の4乗) = 64", isCorrect: false },
      { statement: "1から10までの整数をすべて足すと「55」になる", isCorrect: true },
      { statement: "三角形の内角の和は180度である", isCorrect: true },
      { statement: "偶数と奇数を足すと、必ず「偶数」になる", isCorrect: false },
      { statement: "0は「正の整数（自然数）」に含まれる", isCorrect: false },
      { statement: "半径5cmの円の直径は10cmである", isCorrect: true },
      { statement: "1打（ダース）は全部で12個である", isCorrect: true }
    ]
  },
  {
    category: "理科・科学 [Science]",
    theme: "宇宙と大自然の真実をジャッジせよ！",
    slides: [
      { statement: "植物は、日光を浴びて行う光合成によって「酸素」を作り出す", isCorrect: true },
      { statement: "水が凍って氷になると、体積が小さくなって縮む", isCorrect: false },
      { statement: "光の伝わるスピードは、音のスピードよりも遅い", isCorrect: false },
      { statement: "地球は、太陽のまわりを「1ヶ月」かけて1周している", isCorrect: false },
      { statement: "鉄やアルミなどの金属は、電気や熱をよく通す", isCorrect: true },
      { statement: "カブトムシなどの昆虫の体は、「あたま・むね・おなか」の3つに分かれている", isCorrect: true },
      { statement: "太陽系の惑星の中で、最も大きいのは「地球」である", isCorrect: false },
      { statement: "磁石は、同じ極（N極とN極）同士を近づけると、ピタッと引き寄せ合う", isCorrect: false },
      { statement: "水を温めて沸騰させると、水蒸気という「気体」に変わる", isCorrect: true },
      { statement: "月は、自分で光を放って輝いている星（恒星）である", isCorrect: false }
    ]
  },
  {
    category: "社会・地理 [Social Studies]",
    theme: "歴史・文化・世界の常識をジャッジせよ！",
    slides: [
      { statement: "日本の都道府県の数は、全部で47である", isCorrect: true },
      { statement: "アメリカ合衆国の首都はニューヨークである", isCorrect: false },
      { statement: "赤道の付近は、１年中寒冷な気候である", isCorrect: false },
      { statement: "フランスの首都はパリである", isCorrect: true },
      { statement: "日本国憲法の三大原則は「国民主権」「基本的人権の尊重」「平和主義」である", isCorrect: true },
      { statement: "地球上の陸地と海洋の比率は、ほぼ「陸地7：海洋3」である", isCorrect: false },
      { statement: "イギリス（英国）は島国である", isCorrect: true },
      { statement: "日本で最も面積が広い都道府県は「北海道」である", isCorrect: true },
      { statement: "オーストラリアの首都はシドニーである", isCorrect: false },
      { statement: "本初子午線（経度0度）が通る都市は、イギリスのロンドンである", isCorrect: true }
    ]
  },
  {
    category: "テクノロジー [Technology & IT]",
    theme: "最新デジタル技術とPC知識をジャッジせよ！",
    slides: [
      { statement: "Wi-Fi（ワイファイ）を使うには、必ず太い有線LANケーブルをスマホに直接繋ぐ必要がある", isCorrect: false },
      { statement: "パソコンのキーボードで、最も横幅が長くて大きいのは「スペースキー」である", isCorrect: true },
      { statement: "スマートフォンの「アプリ」は、「アプリケーション」という言葉を略したものである", isCorrect: true },
      { statement: "キーボードのアルファベット配列で、一番上の左側から順番に文字を読むと「QWERTY（クワーティ）」と並んでいる", isCorrect: true },
      { statement: "キーボードの「F」と「J」キーには、タイピングの基準位置（ホームポジション）を示すための小さな突起がある", isCorrect: true },
      { statement: "インターネットの「URL」は、ホームページがどこにあるかを示す「ネット上の住所」のようなものである", isCorrect: true },
      { statement: "コンピューターの脳にあたる「CPU」は、お米の炊き加減を調節するためだけの専用パーツである", isCorrect: false },
      { statement: "Bluetooth（ブルートゥース）機能を使えば、イヤホンとスマホをケーブルで繋がなくても音楽が聴ける", isCorrect: true },
      { statement: "電子メールの件名（タイトル）を書く欄には、本文をすべて丸ごと書き込まなければならない", isCorrect: false },
      { statement: "スマホなどで使う「QRコード」は、3色のカラー信号だけで情報を伝える特別なコードである", isCorrect: false }
    ]
  },
  {
    category: "ひらめき・パズル [Brain Teasers]",
    theme: "誰でも解けるけどほんの少し頭を使う問題をジャッジせよ！",
    slides: [
      { statement: "1年は12ヶ月あるが、そのうち「31日」まである月は全部で7ヶ月ある", isCorrect: true },
      { statement: "一般的なサイコロの向かい合う面の目の数を足すと、どこを足しても必ず「7」になります", isCorrect: true },
      { statement: "ジョーカーを除いたトランプの山札（ハート、ダイヤ、クローバー、スペード）は全部で52枚ある", isCorrect: true },
      { statement: "漢字の「凸」と「凹」は、どちらも画数は同じ「5画」である", isCorrect: true },
      { statement: "1、2、3、4、5をすべて掛け合わせると（1×2×3×4×5）、答えは「100」以上になる", isCorrect: true },
      { statement: "「一月(January)」から「十二月(December)」の中で、英語名にしたときに最も文字数が短いのは「May (5月)」である", isCorrect: true },
      { statement: "日本で現在使われている硬貨（1円〜500円）の中で、穴が空いているのは「50円玉」の1種類だけである", isCorrect: false },
      { statement: "1時間は「3600秒」である", isCorrect: true },
      { statement: "十二支（干支）の12の生き物の中で、唯一実在しない架空の生物は「龍（辰）」である", isCorrect: true },
      { statement: "アルファベットをAから順に並べたとき、「S」の次に来る文字は「T」である", isCorrect: true }
    ]
  }
];

const QUIZ_DATA_EN: QuizQuestion[] = [
  {
    category: "Mathematics",
    theme: "Judge the correctness of formulas & logic!",
    slides: [
      { statement: "5 + 7 = 12", isCorrect: true },
      { statement: "9 × 8 = 71", isCorrect: false },
      { statement: "150 ÷ 3 = 50", isCorrect: true },
      { statement: "3⁴ (3 to the power of 4) = 64", isCorrect: false },
      { statement: "Summing all integers from 1 to 10 equals 55", isCorrect: true },
      { statement: "The sum of interior angles of a triangle is 180 degrees", isCorrect: true },
      { statement: "Adding an even number and an odd number always results in an even number", isCorrect: false },
      { statement: "0 is included in 'positive integers (natural numbers)'", isCorrect: false },
      { statement: "The diameter of a circle with a 5cm radius is 10cm", isCorrect: true },
      { statement: "One dozen is exactly 12 items", isCorrect: true }
    ]
  },
  {
    category: "Science",
    theme: "Judge the truth of space and nature!",
    slides: [
      { statement: "Plants produce oxygen through photosynthesis when exposed to sunlight", isCorrect: true },
      { statement: "When water freezes into ice, its volume decreases and it shrinks", isCorrect: false },
      { statement: "The speed of light is slower than the speed of sound", isCorrect: false },
      { statement: "Earth completes one orbit around the Sun in exactly one month", isCorrect: false },
      { statement: "Metals like iron and aluminum conduct electricity and heat well", isCorrect: true },
      { statement: "An insect's body, such as a beetle, is divided into three parts: head, thorax, and abdomen", isCorrect: true },
      { statement: "Earth is the largest planet in our solar system", isCorrect: false },
      { statement: "Magnets attract each other when two of the same poles (N and N) are brought close together", isCorrect: false },
      { statement: "Heating water to a boil turns it into a gas called water vapor", isCorrect: true },
      { statement: "The Moon is a star that shines by emitting its own light", isCorrect: false }
    ]
  },
  {
    category: "Social Studies & Geography",
    theme: "Judge historical, cultural, and world common sense!",
    slides: [
      { statement: "The total number of prefectures in Japan is 47", isCorrect: true },
      { statement: "The capital of the United States of America is New York", isCorrect: false },
      { statement: "The climate near the equator is cold all year round", isCorrect: false },
      { statement: "The capital of France is Paris", isCorrect: true },
      { statement: "The three principles of the Japanese Constitution are sovereignty of the people, respect for human rights, and pacifism", isCorrect: true },
      { statement: "The ratio of land to ocean on Earth is approximately 7:3", isCorrect: false },
      { statement: "The United Kingdom (UK) is an island nation", isCorrect: true },
      { statement: "Hokkaido has the largest area among Japan's prefectures", isCorrect: true },
      { statement: "The capital of Australia is Sydney", isCorrect: false },
      { statement: "The city through which the Prime Meridian (0 degrees longitude) passes is London, UK", isCorrect: true }
    ]
  },
  {
    category: "Technology & IT",
    theme: "Judge modern digital technology and PC knowledge!",
    slides: [
      { statement: "To use Wi-Fi, you must connect a thick wired LAN cable directly to your smartphone", isCorrect: false },
      { statement: "On a computer keyboard, the widest and largest key is the spacebar", isCorrect: true },
      { statement: "The smartphone term 'App' is short for 'Application'", isCorrect: true },
      { statement: "Reading the alphabet layout on a keyboard from the top-left spells 'QWERTY'", isCorrect: true },
      { statement: "The 'F' and 'J' keys on a keyboard have a small bump to guide typing home positions", isCorrect: true },
      { statement: "An internet 'URL' is like a web address showing where a website is located", isCorrect: true },
      { statement: "The CPU, which is the brain of a computer, is a dedicated part only for adjusting how rice is cooked", isCorrect: false },
      { statement: "Using Bluetooth allows you to listen to music without connecting earphones with a cable", isCorrect: true },
      { statement: "You must write the entire email body within the Subject (title) field", isCorrect: false },
      { statement: "A QR code used on smartphones carries information using only three-color signals", isCorrect: false }
    ]
  },
  {
    category: "Brain Teasers & Puzzles",
    theme: "Solve these puzzles with a bit of brainpower!",
    slides: [
      { statement: "There are 12 months in a year, and 7 of them have exactly 31 days", isCorrect: true },
      { statement: "Opposing sides of a standard die always add up to exactly 7", isCorrect: true },
      { statement: "A standard deck of playing cards excluding jokers consists of 52 cards", isCorrect: true },
      { statement: "The kanji '凸' and '凹' both have the same stroke count of 5", isCorrect: true },
      { statement: "Multiplying 1, 2, 3, 4, 5 together (1x2x3x4x5) results in a number 100 or higher", isCorrect: true },
      { statement: "Among the twelve months from January to December, May has the shortest English name", isCorrect: true },
      { statement: "Among currently circulated coins in Japan, the 50-yen coin is the only one with a hole", isCorrect: false },
      { statement: "One hour is equal to exactly 3600 seconds", isCorrect: true },
      { statement: "Among the 12 animals of the Chinese zodiac, the only mythical creature is the Dragon", isCorrect: true },
      { statement: "In the English alphabet, the letter that comes after 'S' is 'T'", isCorrect: true }
    ]
  }
];

const UI_TEXTS = {
  ja: {
    title: "学力判定！60秒連打クイズバトル",
    subPlay: "バトルスタート (SPACE / CLICK)",
    subRules: "スペースキー または どこでもクリックで開始・連打可能",
    macroTip: "💡 [裏メカニクス] 戦闘中に数字の 0 キー長押し or 連打で連続スペース入力マクロが発動！",
    rulesHeader1: "成功条件: 【勝者】",
    rulesBody1: "合計50回以上の正解連打。正解中のみ連打を繋いでブースト！",
    rulesHeader2: "失敗の罠: 【敗北】",
    rulesBody2: "誤答ステートメントを連打すると凄まじいペナルティ減点が発生！",
    playerName: "プレイヤーの名前",
    bossName: "BOSSの名前",
    timeLimit: "制限時間",
    hiScore: "HI-SCORE",
    goal: "GOAL",
    overdrive: "OVERDRIVE ACTIVE",
    combatSystemLoading: "戦闘システム起動中...",
    prepare: "準備を整えろ！",
    timeRemaining: "残り時間",
    charge: "チャージ",
    keyTaps: "キー連打数",
    correctBonus: "正解ボーナス！",
    wrongPenalty: "不正解ペナルティ！",
    categoryLabel: "カテゴリー",
    themeLabel: "テーマ",
    spaceToHit: "スペースキー または ここを猛連打！",
    activeCombo: "COMBO!",
    victory: "VICTORY !!",
    defeat: "DEFEAT...",
    battleFinished: "BATTLE FINISHED !!",
    revealStats: "戦績レポートを表示 (Reveal Stats)",
    soundMute: "ミュート",
    soundUnmute: "ミュート解除",
    explanation1: "日常や学校で習うクイズが 計４問 (各15秒) 出題される！",
    explanation2: "提示される文章が「正しい」時だけスペースキーを猛連打せよ！",
    explanation3: "間違っている時に叩くと減点（マイナス）されるぞ！",
    sectionProgress: "セクション内",
    questionNum: "問目 / 4",
    maxCharge: "最大出力チャージ完了！",
    insufficientCharge: "チャージエネルギー不足！",
    beamAttack: "が極大ビームを放つ！",
    collapseCircuit: "エネルギー回路が崩壊していく...",
    criticalHit: "会心の一撃 !!!",
    retaliation: "の猛反撃 !!!",
    armorDestroyed: "の装甲が砕け散る！",
    shipWrecked: "の機体が大破！",
    completeVictory: "を完全に撃破した！",
    fallen: "は倒れた...",
    simulationComplete: "シミュレーションが完了しました。",
    telemetryReady: "BATTLE TELEMETRY READY",
    cinematicPlaying: "シネマティックアニメーション再生中... (Skip available on completion)"
  },
  en: {
    title: "Academic Judge! 60s Mash Quiz Battle",
    subPlay: "BATTLE START (SPACE / CLICK)",
    subRules: "Press Spacebar or Click anywhere to start and mash",
    macroTip: "💡 [Secret Macro] Hold or press '0' key during battle to trigger auto-mash spacebar input!",
    rulesHeader1: "Victory Condition",
    rulesBody1: "Reach 50+ total correct mashes. Mash while correct to trigger combo boosts!",
    rulesHeader2: "Defeat Hazard",
    rulesBody2: "Mashing during a false statement triggers a heavy score penalty!",
    playerName: "Player Name",
    bossName: "BOSS Name",
    timeLimit: "Time Limit",
    hiScore: "HI-SCORE",
    goal: "GOAL",
    overdrive: "OVERDRIVE ACTIVE",
    combatSystemLoading: "Combat System Loading...",
    prepare: "Get Ready!",
    timeRemaining: "Time Remaining",
    charge: "CHARGE",
    keyTaps: "KEY TAPS",
    correctBonus: "Correct Bonus!",
    wrongPenalty: "Incorrect Penalty!",
    categoryLabel: "Category",
    themeLabel: "Theme",
    spaceToHit: "Mash Spacebar or Click here!",
    activeCombo: "COMBO!",
    victory: "VICTORY !!",
    defeat: "DEFEAT...",
    battleFinished: "BATTLE FINISHED !!",
    revealStats: "Show Battle Report (Reveal Stats)",
    soundMute: "Mute Sound",
    soundUnmute: "Unmute Sound",
    explanation1: "4 academic quiz questions (15s each) will be presented!",
    explanation2: "Mash the spacebar ONLY when the statement is correct!",
    explanation3: "Mashing on incorrect statements will penalize your score!",
    sectionProgress: "Question",
    questionNum: "of 4 in Section",
    maxCharge: "Max Charge Complete!",
    insufficientCharge: "Insufficient Energy Charge!",
    beamAttack: "fires a devastating beam!",
    collapseCircuit: "The energy circuits are collapsing...",
    criticalHit: "CRITICAL HIT !!!",
    retaliation: "'s counterattack !!!",
    armorDestroyed: "'s armor shattered!",
    shipWrecked: "'s vessel collapsed!",
    completeVictory: "has been completely obliterated!",
    fallen: "has fallen...",
    simulationComplete: "Combat simulation completed.",
    telemetryReady: "BATTLE TELEMETRY READY",
    cinematicPlaying: "Cinematic animation playing... (Skip available on completion)"
  }
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const getRandomQuizzes = (lang: "ja" | "en"): QuizQuestion[] => {
  const data = lang === "ja" ? QUIZ_DATA_JA : QUIZ_DATA_EN;
  const shuffledCategories = shuffleArray(data);
  return shuffledCategories.slice(0, 4).map((q) => {
    const shuffledSlides = shuffleArray(q.slides);
    return {
      ...q,
      slides: shuffledSlides.slice(0, 4),
    };
  });
};

export default function App() {
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "battle_animation" | "result">("idle");
  const [selectedLang, setSelectedLang] = useState<"ja" | "en">(() => {
    try {
      const stored = localStorage.getItem("spacebar_language");
      if (stored === "ja" || stored === "en") {
        return stored;
      }
    } catch {}
    return "ja";
  });
  const [currentQuizzes, setCurrentQuizzes] = useState<QuizQuestion[]>(() => {
    const initialLang = (() => {
      try {
        const stored = localStorage.getItem("spacebar_language");
        if (stored === "ja" || stored === "en") {
          return stored as "ja" | "en";
        }
      } catch {}
      return "ja";
    })();
    return getRandomQuizzes(initialLang);
  });
  const [tapsCount, setTapsCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60.0);
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

  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("spacebar_player_name");
      return stored !== null ? stored : "Player";
    } catch {
      return "Player";
    }
  });

  const [bossName, setBossName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("spacebar_boss_name");
      return stored !== null ? stored : "BOSS";
    } catch {
      return "BOSS";
    }
  });

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPlayerName(val);
    try {
      localStorage.setItem("spacebar_player_name", val);
    } catch {}
  };

  const handleBossNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBossName(val);
    try {
      localStorage.setItem("spacebar_boss_name", val);
    } catch {}
  };

  const finalPlayerName = playerName.trim() || "Player";
  const finalBossName = bossName.trim() || "BOSS";

  const historyRef = useRef<number[]>(new Array(60).fill(0));
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
  const timeLeftRef = useRef<number>(60.0);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Reference to the freshest version of triggerTap to permit access inside the setInterval macro
  const triggerTapRef = useRef<() => void>(() => {});

  // Triggering Spacebar tap action (with ref-based dynamic clock timing)
  const triggerTap = () => {
    if (gameState !== "playing" || timeLeftRef.current <= 0) return;

    // Calculate current slide parameters based on elapsed time (elapsed = 60 - timeLeftRef.current)
    const elapsed = 60 - timeLeftRef.current;
    const currentQuestionIndex = Math.min(3, Math.max(0, Math.floor(elapsed / 15)));
    const currentQuestionElapsed = elapsed % 15;
    const currentSlideIndex = Math.min(3, Math.max(0, Math.floor(currentQuestionElapsed / 3.75)));
    
    const currentQuestion = currentQuizzes[currentQuestionIndex] || currentQuizzes[3];
    const currentSlide = currentQuestion.slides[currentSlideIndex] || currentQuestion.slides[3];
    const isCorrect = currentSlide.isCorrect;

    let particleText = "+1";
    let particleType: "positive" | "negative" = "positive";

    if (isCorrect) {
      sound.playTap(latestTapsCount.current / 120);
      setTapsCount((prev) => {
        const newCount = prev + 1;
        const secondIndex = Math.min(59, Math.floor(elapsed));
        historyRef.current[secondIndex] = (historyRef.current[secondIndex] || 0) + 1;
        return newCount;
      });
      particleText = "+1";
      particleType = "positive";
    } else {
      sound.playFizzle(); // Play penalty sound for tapping on wrong / fake statement
      setTapsCount((prev) => {
        const newCount = Math.max(0, prev - 10);
        // Decrease history speed score slightly
        const secondIndex = Math.min(59, Math.floor(elapsed));
        historyRef.current[secondIndex] = Math.max(0, (historyRef.current[secondIndex] || 0) - 10);
         return newCount;
      });
      particleText = "-10";
      particleType = "negative";
    }

    // Create tap visual floating particle
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const pX = Math.cos(randomAngle) * distance;
    const pY = Math.sin(randomAngle) * distance - 20;

    const newParticle: TapParticle = {
      id: particlesIdRef.current++,
      x: pX,
      y: pY,
      text: particleText,
      type: particleType
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
      // If user is focused on an input or textarea, or composition (IME) is in progress, ignore global hotkeys
      const target = e.target as HTMLElement | null;
      if (
        e.isComposing ||
        (target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable))
      ) {
        return;
      }

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
      const target = e.target as HTMLElement | null;
      if (
        e.isComposing ||
        (target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable))
      ) {
        return;
      }

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
    setTimeLeft(60.0);
    setCountdown(3);
    setBattleStep(0);
    historyRef.current = new Array(60).fill(0);

    // Shuffle and pick 4 random categories on every start / retry
    setCurrentQuizzes(getRandomQuizzes(selectedLang));

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

  // 60-Second Countdown Timer Engine using Epoch offset
  const startTimer = () => {
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingSecs = Math.max(0, 60 - elapsed / 1000);
      setTimeLeft(parseFloat(remainingSecs.toFixed(2)));

      if (elapsed >= 60000) {
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
    const passed = finalScore >= 50;

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
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">BATTLE ARENA</span>
            <span className="text-xl font-black text-blue-500 tracking-tighter">{finalPlayerName} VS {finalBossName}</span>
          </div>
        </div>

        {/* Global Sound, High Score and Game status indicators in the Header */}
        <div className="flex items-center gap-6">
          <div className="text-center hidden md:block">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Time Limit</div>
            <div className="text-lg font-mono text-cyan-400 font-bold tracking-widest">60.00s</div>
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
              
              <div className="mb-4 inline-flex p-3 bg-[#05070a]/90 rounded-full border border-slate-800 ring-4 ring-blue-500/10 animate-[pulse_2.5s_infinite]">
                <Swords className="w-10 h-10 text-blue-500" />
              </div>

              {/* Language Selection Tabs */}
              <div className="flex justify-center gap-3 mb-5 max-w-xs mx-auto">
                <button
                  id="lang-select-ja"
                  onClick={() => {
                    setSelectedLang("ja");
                    try { localStorage.setItem("spacebar_language", "ja"); } catch(_) {}
                    setCurrentQuizzes(getRandomQuizzes("ja"));
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedLang === "ja"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)] font-black"
                      : "bg-[#05070a]/60 border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-700"
                  }`}
                >
                  <span>🇯🇵 日本語</span>
                </button>
                <button
                  id="lang-select-en"
                  onClick={() => {
                    setSelectedLang("en");
                    try { localStorage.setItem("spacebar_language", "en"); } catch(_) {}
                    setCurrentQuizzes(getRandomQuizzes("en"));
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedLang === "en"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)] font-black"
                      : "bg-[#05070a]/60 border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-700"
                  }`}
                >
                  <span>🇺🇸 English</span>
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
                {UI_TEXTS[selectedLang].title}
              </h2>
              <div className="text-cyan-400 font-bold text-sm md:text-base mb-4 tracking-wider">
                {finalPlayerName} VS {finalBossName}
              </div>
              <div className="text-slate-300 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-6 space-y-1">
                <p>{UI_TEXTS[selectedLang].explanation1}</p>
                <p>{UI_TEXTS[selectedLang].explanation2}</p>
                <p className="text-rose-400 font-bold">{UI_TEXTS[selectedLang].explanation3}</p>
              </div>

              {/* Targets and Rules Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{UI_TEXTS[selectedLang].rulesHeader1}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                      {UI_TEXTS[selectedLang].rulesBody1}
                    </p>
                  </div>
                </div>

                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{UI_TEXTS[selectedLang].rulesHeader2}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                      {UI_TEXTS[selectedLang].rulesBody2}
                    </p>
                  </div>
                </div>
              </div>

              {/* Player & Boss Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-md mx-auto text-left">
                <div>
                  <label htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center sm:text-left">
                    {UI_TEXTS[selectedLang].playerName}
                  </label>
                  <input
                    id="player-name-input"
                    type="text"
                    value={playerName}
                    onChange={handlePlayerNameChange}
                    maxLength={15}
                    className="w-full bg-[#05070a]/80 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2 text-white text-center font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-600 text-xs"
                    placeholder="Player"
                  />
                </div>
                <div>
                  <label htmlFor="boss-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center sm:text-left">
                    {UI_TEXTS[selectedLang].bossName}
                  </label>
                  <input
                    id="boss-name-input"
                    type="text"
                    value={bossName}
                    onChange={handleBossNameChange}
                    maxLength={15}
                    className="w-full bg-[#05070a]/80 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2 text-white text-center font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-slate-600 text-xs"
                    placeholder="BOSS"
                  />
                </div>
              </div>

              {/* Start Trigger Button */}
              <div className="flex flex-col items-center gap-4">
                <motion.button
                  id="btn-start-game"
                  onClick={startGame}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-lg tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="fill-white w-5 h-5" />
                  <span>{UI_TEXTS[selectedLang].subPlay}</span>
                </motion.button>
                <div className="flex flex-col items-center gap-2 mt-1 select-none">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono opacity-85">
                    <Keyboard className="w-4 h-4" />
                    <span>{UI_TEXTS[selectedLang].subRules}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 px-3 py-1 bg-slate-950/40 border border-slate-900 rounded-lg" title="Secret macro command activated">
                    <span>{UI_TEXTS[selectedLang].macroTip}</span>
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
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-mono">{UI_TEXTS[selectedLang].combatSystemLoading}</p>
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
              <p className="text-sm text-slate-400 mt-6 tracking-wide animate-pulse">{UI_TEXTS[selectedLang].prepare}</p>
            </motion.div>
          )}

          {/* STATE 3: ACTIVE PLAYING GAMEPLAY ARENA */}
          {gameState === "playing" && (() => {
            const elapsed = 60 - timeLeft;
            const currentQuestionIndex = Math.min(3, Math.max(0, Math.floor(elapsed / 15)));
            const currentQuestionElapsed = elapsed % 15;
            const currentSlideIndex = Math.min(3, Math.max(0, Math.floor(currentQuestionElapsed / 3.75)));
            
            const currentQuestion = currentQuizzes[currentQuestionIndex] || currentQuizzes[3];
            const currentSlide = currentQuestion.slides[currentSlideIndex] || currentQuestion.slides[3];

            return (
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

              {/* LIVE QUIZ BOARD ELECTRON PANEL */}
              <div id="live-quiz-board-panel" className="w-full bg-[#070b12] rounded-2xl border border-slate-800 p-4 mb-2 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Question Index Badge */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold">Question</div>
                  <div className="text-3xl font-black text-cyan-400 font-mono italic">0{currentQuestionIndex + 1}<span className="text-xs text-slate-500 font-normal">/04</span></div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                    {currentQuestion.category}
                  </div>
                </div>

                {/* Outer Glowing boundary representing slide statement status */}
                <div className="flex-1 w-full p-4 rounded-xl border-2 border-slate-700 bg-slate-900/40 shadow-[inset_0_0_15px_rgba(148,163,184,0.1)] relative overflow-hidden transition-all duration-300">
                  {/* Micro slide status light indicator */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
                      {currentQuestion.theme}
                    </span>
                    <span className="text-[10px] tracking-wider font-mono font-bold text-cyan-400">
                      {UI_TEXTS[selectedLang].sectionProgress} {currentSlideIndex + 1} {UI_TEXTS[selectedLang].questionNum}
                    </span>
                  </div>

                  {/* Statement board display */}
                  <div className="text-center py-2 md:py-3 select-none">
                    <AnimatePresence mode="popLayout">
                      <motion.p
                        key={currentSlide.statement}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="text-lg md:text-2xl font-black text-white tracking-wide"
                      >
                        {currentSlide.statement}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Small slide timebar */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900 overflow-hidden">
                    <motion.div
                      key={currentSlide.statement}
                      className="h-full bg-cyan-500"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 3.75, ease: "linear" }}
                    />
                  </div>
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
                            className={`absolute font-black text-lg md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono select-none ${p.type === "positive" ? "text-cyan-300" : "text-rose-500"}`}
                          >
                            {p.text}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 border border-blue-800 text-blue-400 font-bold tracking-widest leading-none">
                      {finalPlayerName}
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
                      {finalBossName}
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
                    {UI_TEXTS[selectedLang].spaceToHit}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Zap className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
                    <span>TAP DEVICE SCREEN / CLICK TO RE-FOCUS WINDOW</span>
                  </div>
                  
                  {/* High visual speed ticker */}
                  <div className="absolute bottom-1 right-2 text-[9px] text-slate-600 font-mono">
                    TPS: {((historyRef.current[Math.max(0, Math.floor(32 - timeLeft) - 1)] || 0)).toFixed(0)} / s
                  </div>
                </motion.button>
              </div>
            </motion.div>
            );
          })()}

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
                  <span className="text-xs text-slate-400 mt-2 font-semibold">
                    {finalPlayerName} Lvl.{tapsCount}
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
                  <span className="text-xs text-slate-400 mt-2 font-semibold">
                    {finalBossName}
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
                      <h3 className="text-xl md:text-2xl font-black tracking-wider text-yellow-500 animate-pulse">
                        {tapsCount >= 100 ? UI_TEXTS[selectedLang].maxCharge : UI_TEXTS[selectedLang].insufficientCharge}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 tracking-widest">
                        {tapsCount >= 100 ? `「${finalPlayerName}」${UI_TEXTS[selectedLang].beamAttack}` : UI_TEXTS[selectedLang].collapseCircuit}
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
                        {tapsCount >= 100 ? UI_TEXTS[selectedLang].criticalHit : `「${finalBossName}」${UI_TEXTS[selectedLang].retaliation}`}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {tapsCount >= 100 ? `「${finalBossName}」${UI_TEXTS[selectedLang].armorDestroyed}` : `「${finalPlayerName}」${UI_TEXTS[selectedLang].shipWrecked}`}
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
                      <p className="text-xs text-slate-400 mt-1 tracking-widest">
                        {tapsCount >= 100 ? `「${finalBossName}」${UI_TEXTS[selectedLang].completeVictory}` : `「${finalPlayerName}」${UI_TEXTS[selectedLang].fallen}`}
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
                      <p className="text-sm font-semibold text-indigo-300">{UI_TEXTS[selectedLang].simulationComplete}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{UI_TEXTS[selectedLang].telemetryReady}</p>
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
                    <span>{UI_TEXTS[selectedLang].revealStats}</span>
                    <ChevronRight className="w-5 h-5 shrink-0" />
                  </motion.button>
                ) : (
                  <div className="text-xs text-slate-500 font-mono italic animate-pulse">
                    {UI_TEXTS[selectedLang].cinematicPlaying}
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
                lang={selectedLang}
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
