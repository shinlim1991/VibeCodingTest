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

const QUIZ_DATA: QuizQuestion[] = [
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
      { statement: "植物の光合成は、酸素を発生させる", isCorrect: true },
      { statement: "水は氷になると体積が小さく（収縮）なる", isCorrect: false },
      { statement: "光の進むスピードは、音よりも遅い", isCorrect: false },
      { statement: "地球は太陽の周りを１年かけて公転している", isCorrect: true },
      { statement: "金属は一般的に、熱や電気を通しやすい", isCorrect: true },
      { statement: "昆虫の体は「頭部・胸部・腹部」の3つに分かれている", isCorrect: true },
      { statement: "太陽系の惑星の中で、最も大きいのは「火星」である", isCorrect: false },
      { statement: "水を加熱して沸騰させると、水蒸気という「気体」に変わる", isCorrect: true },
      { statement: "アルカリ性の液体に赤色リトマス紙をつけると、青色に変わる", isCorrect: true },
      { statement: "月は自ら光を放って輝いている", isCorrect: false }
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
    category: "国語・英語・文学 [Language Arts]",
    theme: "ことわざと言葉の法則をジャッジせよ！",
    slides: [
      { statement: "英語：『Apple』の日本語訳は「りんご」", isCorrect: true },
      { statement: "ことわざ：棚から「たい焼き」が落ちてくる", isCorrect: false },
      { statement: "「二兎を追う者は一兎をも得ず」は、欲張ると失敗するという意味", isCorrect: true },
      { statement: "「こんにちは」を漢字にすると「今日輪」である", isCorrect: false },
      { statement: "夏目漱石の代表作には『吾輩は猫である』がある", isCorrect: true },
      { statement: "英語のアルファベットは全部で26文字である", isCorrect: true },
      { statement: "「情けは人のためならず」は、人に親切にすると自分に良いことが返ってくるという意味である", isCorrect: true },
      { statement: "漢字の「右」と「左」は、書き順の1画目が同じである", isCorrect: false },
      { statement: "「 optical 」は「光学の、視覚の」という意味である", isCorrect: true },
      { statement: "太宰治の『走れメロス』で、メロスが身代わりとして残した友人の名は「セリヌンティウス」である", isCorrect: true }
    ]
  },
  {
    category: "雑学・生活 [General Trivia]",
    theme: "日常生活と身の回りの知恵をジャッジせよ！",
    slides: [
      { statement: "信号機の「緑色」は、法律上「青信号」と呼ぶ", isCorrect: true },
      { statement: "かき氷のシロップは、実はすべて同じ味（香料だけ違う）である", isCorrect: true },
      { statement: "救急車の電話番号は「110」番である", isCorrect: false },
      { statement: "富士山は山梨県と静岡県の境界にまたがっている", isCorrect: true },
      { statement: "千円札の肖像に描かれた野口英世は、細菌学者である", isCorrect: true },
      { statement: "非常口の緑色のマークは、暗闇でも一番目立つ色として法律で決められている", isCorrect: true },
      { statement: "日本の郵便番号はすべて「5桁」で構成されている", isCorrect: false },
      { statement: "炭酸水に割り箸を入れると、泡が激しく発生する", isCorrect: true },
      { statement: "オセロゲームの黒石と白石は、必ず黒が先手（先攻）である", isCorrect: true },
      { statement: "シャンプーボトルの側面にギザギザがあるのは、リンスと区別するためである", isCorrect: true }
    ]
  },
  {
    category: "テクノロジー [Technology & IT]",
    theme: "最新デジタル技術とPC知識をジャッジせよ！",
    slides: [
      { statement: "Wi-Fi of「Wi」は「Wireless」の略語である", isCorrect: false },
      { statement: "1キロバイト (KB) は、正確には 1000バイトである", isCorrect: false },
      { statement: "PDFは、Adobe社が開発したファイル形式である", isCorrect: true },
      { statement: "AI（人工知能）の『GPT』の「P」は Pre-trained の略である", isCorrect: true },
      { statement: "キーボードの「F」と「J」キーには、ホームポジション用の突起がある", isCorrect: true },
      { statement: "インターネットのアドレス「URL」の「L」は「Link」の略である", isCorrect: false },
      { statement: "コンピュータのCPUは「中央演算処理装置」と呼ばれる", isCorrect: true },
      { statement: "Bluetoothの「Blue」は、実在した青歯王（ハラルド・ブロタン）の名前に由来する", isCorrect: true },
      { statement: "スマートフォンの「アプリ」は、「アプリケーション」の略称である", isCorrect: true },
      { statement: "QRコードの「QR」は「Quick Response」の略である", isCorrect: true }
    ]
  },
  {
    category: "スポーツ・健康 [Sports & Health]",
    theme: "競技ルールと人体サイエンスをジャッジせよ！",
    slides: [
      { statement: "サッカーの1チームのピッチ上人数は11人である", isCorrect: true },
      { statement: "大人の骨の数は、赤ちゃんの骨の数よりも多い", isCorrect: false },
      { statement: "マラソンの正式な距離は 42.195 キロメートルである", isCorrect: true },
      { statement: "人の体温は、通常、朝起きたときが最も高い", isCorrect: false },
      { statement: "卓球（ピンポン）のサーブは、自分のコートに1回バウンドさせてから相手コートに入れる", isCorrect: true },
      { statement: "血液の赤い色は、赤血球に含まれる「ヘモグロビン」によるものである", isCorrect: true },
      { statement: "野球で「DH」とは、守備専門の選手（守備固め）のことである", isCorrect: false },
      { statement: "人間の五感の中で、最も早く疲労を感じるのは「嗅覚（きゅうかく）」である", isCorrect: true },
      { statement: "筋肉痛は、運動後すぐに発生するものしか存在しない", isCorrect: false },
      { statement: "バスケットボールで3ポイントシュートが決まると、チームに3点が入る", isCorrect: true }
    ]
  },
  {
    category: "世界のグルメ [Food & Gastronomy]",
    theme: "美味しい料理と食文化のルーツをジャッジせよ！",
    slides: [
      { statement: "「カルボナーラ」はイタリア語で「炭焼き職人風」という意味である", isCorrect: true },
      { statement: "ジャガイモは、根ではなく「地下の茎（塊茎）」が肥大化したものである", isCorrect: true },
      { statement: "「ナポリタン」スパゲッティは、イタリア・ナポリが発祥である", isCorrect: false },
      { statement: "クロワッサンはフランス発祥ではなく、オーストリア発祥と言われている", isCorrect: true },
      { statement: "トマトはもともと、南アメリカのアンデス山脈が原産である", isCorrect: true },
      { statement: "コーヒー豆は、果実の「種（たね）」の部分である", isCorrect: true },
      { statement: "中華料理の「麻婆豆腐」を考案したとされる人物は、顔にあばた（麻子）があったお婆さんである", isCorrect: true },
      { statement: "マヨネーズの主原料は、卵白（白身）と酢と油である", isCorrect: false },
      { statement: "お寿司の「ガリ」は、大根を甘酢に漬けたものである", isCorrect: false },
      { statement: "世界三大珍味といえば「キャビア」「フォアグラ」「トリュフ」である", isCorrect: true }
    ]
  },
  {
    category: "地球・気象 [Earth & Weather]",
    theme: "大気と異常気象 of 不思議をジャッジせよ！",
    slides: [
      { statement: "台風、ハリケーン、サイクロンは、どれも同じ熱帯低気圧の仲間である", isCorrect: true },
      { statement: "雷が鳴っている時、高い木の下に避難するのは安全である", isCorrect: false },
      { statement: "日本で観測される「黄色い砂（黄砂）」は、アメリカから飛来する", isCorrect: false },
      { statement: "空気中で最も多い気体は、酸素ではなく窒素である", isCorrect: true },
      { statement: "地球上で最も深い海溝は、太平洋にある「マリアナ海溝」である", isCorrect: true },
      { statement: "砂漠とは、年間を通じて雨が全く降らない場所のことだけを指す", isCorrect: false },
      { statement: "虹の色の並び順は、一番外側が「赤」で、一番内側が「紫」である", isCorrect: true },
      { statement: "冬に雪が降るのは、雲の中の温度が氷点下（0度以下）だからである", isCorrect: true },
      { statement: "雲は、水蒸気がそのまま目に見えるようになったものである", isCorrect: false },
      { statement: "日本の「春分の日」と「秋分の日」は、昼と夜の長さがほぼ同じになる", isCorrect: true }
    ]
  },
  {
    category: "音楽・アート [Music & Art]",
    theme: "芸術家と名作メロディにまつわる謎をジャッジせよ！",
    slides: [
      { statement: "ベートーヴェンの有名な交響曲第5番の副題は「運命」である", isCorrect: true },
      { statement: "ピアノの鍵盤は、白鍵と黒鍵を合わせて全部で100鍵ある", isCorrect: false },
      { statement: "レオナルド・ダ・ヴィンチの代表作「モナ・リザ」には眉毛が描かれていない", isCorrect: true },
      { statement: "ヴァイオリンの弦は、全部で5本ある", isCorrect: false },
      { statement: "世界三大リスニング（クラシック三大B）とは、バッハ、ベートーヴェン、ブラームスである", isCorrect: true },
      { statement: "モーツァルトはオーストリア出身の作曲家である", isCorrect: true },
      { statement: "ゴッホの有名な絵画『ひまわり』は、生涯で1枚しか描かれなかった", isCorrect: false },
      { statement: "ピカソのフルネームは、非常に長い（10語以上ある）", isCorrect: true },
      { statement: "「ド・レ・ミ」の音名は、イタリア語が発祥である", isCorrect: true },
      { statement: "彫刻『考える人』で有名なフランスの彫刻家は「ロダン」である", isCorrect: true }
    ]
  },
  {
    category: "動物・生き物 [Animals & Nature]",
    theme: "地球に生きる奇妙な生物たちをジャッジせよ！",
    slides: [
      { statement: "カタツムリには歯が約1万本以上生えている", isCorrect: true },
      { statement: "ダチョウの脳みそは、彼らの目玉よりも大きい", isCorrect: false },
      { statement: "クジラは哺乳類ではなく、魚類の仲間である", isCorrect: false },
      { statement: "コアラの主食であるユーカリの葉には、毒素が含まれている", isCorrect: true },
      { statement: "ペンギンは南半球だけでなく、北極（北半球の極地）にも野生の個体が生息している", isCorrect: false },
      { statement: "カメレオンの皮膚の色が変わるのは、主に周囲の景色に擬態するためだけである", isCorrect: false },
      { statement: "チーターの走るスピードは、時速100キロメートルを超えることがある", isCorrect: true },
      { statement: "タコには心臓が3つ、脳が9つある", isCorrect: true },
      { statement: "キリンの首の骨（頚椎）の数は、人間（7個）よりも多い", isCorrect: false },
      { statement: "クラゲの体の約95％以上は、水分でできている", isCorrect: true }
    ]
  },
  {
    category: "日本史・世界史 [History]",
    theme: "激動の歴史と英雄たちの足跡をジャッジせよ！",
    slides: [
      { statement: "江戸幕府をひらいた初代将軍は徳川家康である", isCorrect: true },
      { statement: "大化の改新（645年）の中心人物は中大兄皇子と中臣鎌足である", isCorrect: true },
      { statement: "ナポレオンが生まれた島は、イギリス領のエルバ島である", isCorrect: false },
      { statement: "日本の昭和時代は、全部で70年間続いた", isCorrect: false },
      { statement: "邪馬台国の女王「卑弥呼」が中国の魏に使いを送った歴史がある", isCorrect: true },
      { statement: "ピラミッドを建設した古代エジプトの人々は、労働者であり奴隷ではなかったという説が有力である", isCorrect: true },
      { statement: "コロンブスがアメリカ大陸に到達した年は「1492年」である", isCorrect: true },
      { statement: "フランス革命で処刑されたフランス国王は「ルイ14世」である", isCorrect: false },
      { statement: "日本の初代内閣総理大臣は「伊藤博文」である", isCorrect: true },
      { statement: "ベルリンの壁が崩壊したのは「1989年」である", isCorrect: true }
    ]
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const getRandomQuizzes = (): QuizQuestion[] => {
  const shuffledCategories = shuffleArray(QUIZ_DATA);
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
  const [currentQuizzes, setCurrentQuizzes] = useState<QuizQuestion[]>(() => {
    return getRandomQuizzes();
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
    setCurrentQuizzes(getRandomQuizzes());

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
              
              <div className="mb-6 inline-flex p-3 bg-[#05070a]/90 rounded-full border border-slate-800 ring-4 ring-blue-500/10 animate-[pulse_2.5s_infinite]">
                <Swords className="w-10 h-10 text-blue-500" />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1">
                学力判定！60秒連打クイズバトル
              </h2>
              <div className="text-cyan-400 font-bold text-sm md:text-base mb-4 tracking-wider">
                {finalPlayerName} VS {finalBossName}
              </div>
              <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-6">
                日常や学校で習うクイズが <span className="text-cyan-400 font-bold">計４問</span> (各15秒) 出題される！
                <br />
                提示される文章が<span className="text-emerald-400 font-bold">「正しい」時だけスペースキーを猛連打</span>せよ！
                <br />
                <span className="text-rose-400 font-bold">間違っている時に叩くと減点（マイナス）</span>されるぞ！
              </p>

              {/* Targets and Rules Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">成功条件: 【勝者】</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      合計50回以上の正解連打。
                      <br />
                      正解中のみ連打を繋いでブースト！
                    </p>
                  </div>
                </div>

                <div className="bg-[#05070a]/80 rounded-xl border border-slate-850 p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">失敗の罠: 【敗北】</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      誤答ステートメントを連打すると
                      <br />
                      凄まじいペナルティ減点が発生！
                    </p>
                  </div>
                </div>
              </div>

              {/* Player & Boss Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-md mx-auto text-left">
                <div>
                  <label htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center sm:text-left">
                    プレイヤーの名前
                  </label>
                  <input
                    id="player-name-input"
                    type="text"
                    value={playerName}
                    onChange={handlePlayerNameChange}
                    maxLength={15}
                    className="w-full bg-[#05070a]/80 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-white text-center font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-600"
                    placeholder="Player"
                  />
                </div>
                <div>
                  <label htmlFor="boss-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center sm:text-left">
                    BOSSの名前
                  </label>
                  <input
                    id="boss-name-input"
                    type="text"
                    value={bossName}
                    onChange={handleBossNameChange}
                    maxLength={15}
                    className="w-full bg-[#05070a]/80 border border-slate-700 focus:border-rose-500 rounded-xl px-4 py-2.5 text-white text-center font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-slate-600"
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
                      セクション内 {currentSlideIndex + 1}問目 / 4
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
                    スペースキー または ここを猛連打！
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
                        {tapsCount >= 100 ? "最大出力チャージ完了！" : "チャージエネルギー不足！"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 tracking-widest">
                        {tapsCount >= 100 ? `「${finalPlayerName}」が極大ビームを放つ！` : "エネルギー回路が崩壊していく..."}
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
                        {tapsCount >= 100 ? "会心の一撃 !!!" : `「${finalBossName}」の猛反撃 !!!`}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {tapsCount >= 100 ? `「${finalBossName}」の装甲が砕け散る！` : `「${finalPlayerName}」の機体が大破！`}
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
                        {tapsCount >= 100 ? `「${finalBossName}」を完全に撃破した！` : `「${finalPlayerName}」は倒れた...`}
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
