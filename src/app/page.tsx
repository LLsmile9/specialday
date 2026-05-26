"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";

type Lang = "zh" | "en";

interface Answers {
  [key: string]: string;
}

interface BlessingData {
  poeticSentence: { zh: string; en: string };
  birthdayBlessing: { zh: string; en: string };
}

interface OptionItem {
  zh: string;
  en: string;
  value: string;
}

interface QuestionConfig {
  key: string;
  zh: string;
  en: string;
  placeholder?: { zh: string; en: string };
  options?: OptionItem[];
  allowCustom?: boolean;
}

// Full pool of questions - we'll pick 6 randomly each session
// The first question (name) is always included
const allQuestions: QuestionConfig[] = [
  {
    key: "name",
    zh: "告诉我，该怎么称呼你？",
    en: "Tell me, what should I call you?",
    placeholder: { zh: "你的名字", en: "Your name" },
  },
  {
    key: "season",
    zh: "如果时间可以停下，你想停留在...",
    en: "If time could pause, which season would you linger in?",
    options: [
      { zh: "生机勃勃的春", en: "Vibrant Spring", value: "生机勃勃的春" },
      { zh: "热情灿烂的夏", en: "Radiant Summer", value: "热情灿烂的夏" },
      { zh: "温柔沉静的秋", en: "Gentle Autumn", value: "温柔沉静的秋" },
      { zh: "安静纯粹的冬", en: "Pure Winter", value: "安静纯粹的冬" },
    ],
    allowCustom: true,
  },
  {
    key: "person",
    zh: "想象此刻有一个人坐在你对面，和你聊天。那是...",
    en: "Imagine someone sitting across from you, chatting. That would be...",
    placeholder: {
      zh: "作家、哲学家、诗人、或者任何人都可以",
      en: "Writer, philosopher, poet... anyone at all",
    },
  },
  {
    key: "environment",
    zh: "想象你现在完全放松地躺下来，告诉我，你在哪里？",
    en: "Imagine you're lying down, completely relaxed. Where are you?",
    options: [
      { zh: "海边的小屋", en: "A cottage by the sea", value: "海边的小屋" },
      { zh: "山间的木屋", en: "A cabin in the mountains", value: "山间的木屋" },
      { zh: "城市的露台", en: "A city terrace", value: "城市的露台" },
      { zh: "森林的树屋", en: "A treehouse in the forest", value: "森林的树屋" },
    ],
    allowCustom: true,
  },
  {
    key: "food",
    zh: "此刻最想尝到的味道是...",
    en: "The flavor you're craving right now...",
    options: [
      { zh: "热巧克力与面包", en: "Hot chocolate & bread", value: "热巧克力和刚出炉的面包" },
      { zh: "桂花糕与热茶", en: "Osmanthus cake & tea", value: "桂花糕和一壶热茶" },
      { zh: "冰柠檬水", en: "Iced lemonade", value: "一杯冰柠檬水" },
      { zh: "红酒与奶酪", en: "Wine & cheese", value: "红酒和奶酪" },
    ],
    allowCustom: true,
  },
  {
    key: "moodColor",
    zh: "如果今天的心情有一种颜色...",
    en: "If today's mood had a color...",
    options: [
      { zh: "暖阳金", en: "Warm Gold", value: "暖阳金" },
      { zh: "薄荷绿", en: "Mint Green", value: "薄荷绿" },
      { zh: "薰衣草紫", en: "Lavender", value: "薰衣草紫" },
      { zh: "珊瑚粉", en: "Coral Pink", value: "珊瑚粉" },
      { zh: "静谧蓝", en: "Serene Blue", value: "静谧蓝" },
    ],
    allowCustom: true,
  },
  {
    key: "timeOfDay",
    zh: "此刻，你更想待在一天中的哪段时光？",
    en: "Which part of the day do you want to linger in?",
    options: [
      { zh: "清晨的第一缕光", en: "First light of dawn", value: "清晨的第一缕光" },
      { zh: "午后的慵懒时光", en: "Lazy afternoon", value: "午后的慵懒时光" },
      { zh: "黄昏的温柔", en: "Tender dusk", value: "黄昏的温柔" },
      { zh: "深夜的宁静", en: "Midnight stillness", value: "深夜的宁静" },
    ],
    allowCustom: true,
  },
  {
    key: "music",
    zh: "如果此刻有一段旋律飘来，你希望是...",
    en: "If a melody drifted by, you'd want it to be...",
    options: [
      { zh: "钢琴的轻吟", en: "Soft piano", value: "钢琴的轻吟" },
      { zh: "吉他的低语", en: "Whispering guitar", value: "吉他的低语" },
      { zh: "风铃的叮咛", en: "Tinkling wind chimes", value: "风铃的叮咛" },
      { zh: "雨声的白噪音", en: "White noise of rain", value: "雨声的白噪音" },
    ],
    allowCustom: true,
  },
  {
    key: "wish",
    zh: "闭上眼睛，许一个只有自己知道的小心愿...",
    en: "Close your eyes, make a little wish only you know...",
    placeholder: {
      zh: "可以说出来，也可以藏在心里",
      en: "You can say it, or keep it in your heart",
    },
  },
];

const MAX_QUESTIONS = 6;

const text: Record<string, Record<Lang, string>> = {
  welcomeTitle: { zh: "今天，是特别的", en: "Today is special" },
  welcomeSub: { zh: "此刻的你感觉怎么样", en: "How are you feeling right now?" },
  startBtn: { zh: "挺好的", en: "Sure" },
  nextBtn: { zh: "继续", en: "Continue" },
  prevBtn: { zh: "上一步", en: "Back" },
  orCustom: { zh: "或者，你来描述...", en: "Or, describe your own..." },
  loadingTitle: { zh: "想要对你说……", en: "wants to say to you..." },
  retryBtn: { zh: "再试一次", en: "Try again" },
  errorMsg: { zh: "生成祝福时出了点小问题，再试一次吧", en: "Something went wrong. Let's try again." },
  startOver: { zh: "重新来过", en: "Start over" },
  download: { zh: "保存这张祝福卡", en: "Save this blessing card" },
  downloading: { zh: "正在保存...", en: "Saving..." },
};

const pageVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};

// Interface font - gentle handwritten kai style
const FONT = 'var(--font-lxgw-wenkai), "LXGW WenKai", serif';
// Blessing font - more artistic, flowing cursive style
const FONT_ARTISTIC = 'var(--font-long-cang), "Long Cang", var(--font-lxgw-wenkai), serif';

function FloatingDots() {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#5a7a72]/40"
          animate={{ y: [-4, 4, -4], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        />
      ))}
    </div>
  );
}

function DecorativeStars() {
  const stars = [
    { top: "8%", left: "12%", size: 2, delay: 0 },
    { top: "18%", right: "15%", size: 1.5, delay: 0.5 },
    { top: "30%", left: "6%", size: 1.5, delay: 1 },
    { top: "45%", right: "8%", size: 2, delay: 1.5 },
    { top: "60%", left: "18%", size: 1.5, delay: 0.8 },
    { top: "72%", right: "20%", size: 1.5, delay: 1.2 },
    { top: "82%", left: "10%", size: 1.5, delay: 0.3 },
    { top: "15%", right: "6%", size: 1.5, delay: 1.8 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#5a7a72]/12"
          style={{
            width: star.size,
            height: star.size,
            top: star.top,
            ...(star.left ? { left: star.left } : {}),
            ...(star.right ? { right: star.right } : {}),
          }}
          animate={{ opacity: [0.08, 0.3, 0.08], scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
        />
      ))}
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  let currentY = y;
  const lines = text.split("\n");
  for (const line of lines) {
    let currentLine = "";
    for (const char of line) {
      const testLine = currentLine + char;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        ctx.fillText(currentLine, x, currentY);
        currentLine = char;
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

// Shuffle array helper
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick 6 questions: always include name + person (soul of the blessing), then random 4 from the rest
function pickQuestions(): QuestionConfig[] {
  const nameQ = allQuestions[0]; // always first - the person's name
  const personQ = allQuestions[2]; // always included - sets the tone/soul of the blessing
  const rest = allQuestions.filter((_, i) => i !== 0 && i !== 2);
  const shuffled = shuffleArray(rest);
  return [nameQ, personQ, ...shuffled.slice(0, MAX_QUESTIONS - 2)];
}

export default function Home() {
  const [step, setStep] = useState(0); // 0=welcome, 1-6=questions, 7=loading, 8=result
  const [lang, setLang] = useState<Lang>("zh");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentInput, setCurrentInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [blessing, setBlessing] = useState<BlessingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blessingCardRef = useRef<HTMLDivElement>(null);

  // Pick 6 random questions once per session
  const questions = useMemo(() => pickQuestions(), []);

  const t = useCallback((key: string) => text[key]?.[lang] ?? key, [lang]);

  const generateBlessing = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/generate-blessing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBlessing(data);
      setStep(8);
    } catch {
      setError(t("errorMsg"));
    }
  }, [answers, t]);

  // Focus input when step changes
  useEffect(() => {
    if (step >= 1 && step <= MAX_QUESTIONS) {
      const q = questions[step - 1];
      const saved = answers[q.key];
      if (q.options && saved) {
        const isPredefined = q.options.some((o) => o.value === saved);
        if (isPredefined) {
          setSelectedOption(saved);
          setIsCustom(false);
          setCurrentInput("");
        } else {
          setSelectedOption("");
          setIsCustom(true);
          setCurrentInput(saved);
        }
      } else {
        setCurrentInput(saved || "");
        setSelectedOption("");
        setIsCustom(false);
      }
      setTimeout(() => {
        if (!q.options || isCustom) inputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  useEffect(() => {
    if (step === 7 && !blessing) generateBlessing();
  }, [step, blessing, generateBlessing]);

  const submitAnswer = useCallback(() => {
    if (step < 1 || step > MAX_QUESTIONS) return;
    const q = questions[step - 1];
    let value = "";
    if (q.options && selectedOption) {
      value = selectedOption;
    } else if (currentInput.trim()) {
      value = currentInput.trim();
    }
    if (!value) return;
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
    setCurrentInput("");
    setSelectedOption("");
    setIsCustom(false);
    if (step === MAX_QUESTIONS) {
      setStep(7); // loading
    } else {
      setStep(step + 1);
    }
  }, [step, currentInput, selectedOption, questions]);

  const handleStart = useCallback(() => setStep(1), []);

  const handlePrev = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer();
      }
    },
    [submitAnswer]
  );

  const handleOptionClick = useCallback(
    (value: string) => {
      setSelectedOption(value);
      setIsCustom(false);
      setCurrentInput("");
      const q = questions[step - 1];
      setAnswers((prev) => ({ ...prev, [q.key]: value }));
      setTimeout(() => {
        setSelectedOption("");
        if (step === MAX_QUESTIONS) {
          setStep(7);
        } else {
          setStep(step + 1);
        }
      }, 400);
    },
    [step, questions]
  );

  const handleCustomClick = useCallback(() => {
    setIsCustom(true);
    setSelectedOption("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleStartOver = useCallback(() => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setSelectedOption("");
    setIsCustom(false);
    setBlessing(null);
    setError(null);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!blessingCardRef.current) return;
    setDownloading(true);
    try {
      const el = blessingCardRef.current;
      const rect = el.getBoundingClientRect();
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, rect.width * 0.6, rect.height);
      gradient.addColorStop(0, "#D8F2EC");
      gradient.addColorStop(0.5, "#C6EBE3");
      gradient.addColorStop(1, "#B4E2D9");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const contentW = rect.width - 100;
      ctx.textAlign = "center";

      // Poetic sentence
      const poeticText = blessing?.poeticSentence[lang] || "";
      ctx.fillStyle = "rgba(61,92,83,0.4)";
      ctx.font = '200 14px serif';
      let y = rect.height * 0.32;
      y = wrapText(ctx, poeticText, centerX, y, contentW, 24);

      // Divider
      y += 18;
      ctx.fillStyle = "rgba(61,92,83,0.1)";
      ctx.fillRect(centerX - 20, y, 40, 1);
      y += 22;

      // Birthday blessing
      const blessingText = blessing?.birthdayBlessing[lang] || "";
      ctx.fillStyle = "rgba(45,60,55,0.82)";
      ctx.font = '300 20px serif';
      wrapText(ctx, blessingText, centerX, y, contentW, 34);

      // Download
      const link = document.createElement("a");
      link.download = `blessing-${answers.name || "for-you"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // silently fail
    }
    setDownloading(false);
  }, [answers.name, blessing, lang]);

  const progressPercent = step === 0 ? 0 : step >= 7 ? 100 : Math.round((step / MAX_QUESTIONS) * 100);
  const currentQuestion = step >= 1 && step <= MAX_QUESTIONS ? questions[step - 1] : null;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #D8F2EC 0%, #C8EBE3 30%, #B8E3DC 60%, #AEDBDA 100%)",
      }}
    >
      <DecorativeStars />

      {/* Language toggle - top right, subtle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[#5a7a72]/35 hover:text-[#5a7a72]/65 text-xs tracking-wide transition-colors"
          style={{ fontFamily: FONT }}
        >
          <Languages className="w-3.5 h-3.5" strokeWidth={1.5} />
          {lang === "zh" ? "EN" : "中"}
        </button>
      </div>

      {/* Progress bar */}
      {step >= 1 && step <= MAX_QUESTIONS && (
        <div className="fixed top-0 left-0 right-0 z-40">
          <div className="h-0.5 bg-[#5a7a72]/8">
            <motion.div
              className="h-full bg-[#5a7a72]/25 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center text-center px-6 py-12 max-w-md"
          >
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl font-extralight text-[#3d5c53] tracking-[0.2em] mb-5"
              style={{ fontFamily: FONT }}
            >
              {t("welcomeTitle")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-sm sm:text-base text-[#5a7a72]/55 mb-14 leading-relaxed tracking-wider"
              style={{ fontFamily: FONT }}
            >
              {t("welcomeSub")}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="px-10 py-3 bg-[#5a7a72]/10 backdrop-blur-sm border border-[#5a7a72]/12 text-[#3d5c53]/65 rounded-full text-sm font-extralight tracking-[0.15em] hover:bg-[#5a7a72]/18 hover:text-[#3d5c53] transition-all"
              style={{ fontFamily: FONT }}
            >
              {t("startBtn")}
            </motion.button>
          </motion.div>
        )}

        {/* Steps 1-6: Questions */}
        {step >= 1 && step <= MAX_QUESTIONS && currentQuestion && (
          <motion.div
            key={`question-${step}`}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center text-center px-5 sm:px-6 py-10 max-w-lg w-full"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="text-[#5a7a72]/20 text-[11px] tracking-[0.25em] mb-10"
              style={{ fontFamily: FONT }}
            >
              {step} / {MAX_QUESTIONS}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl font-extralight text-[#3d5c53]/80 leading-relaxed mb-8 max-w-sm"
              style={{ fontFamily: FONT }}
            >
              {currentQuestion[lang]}
            </motion.h2>

            {/* Options - responsive grid */}
            {currentQuestion.options && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={
                  currentQuestion.options.length <= 4
                    ? "grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 w-full max-w-md"
                    : "grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4 w-full max-w-lg"
                }
              >
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionClick(opt.value)}
                    className={`px-2 py-2.5 rounded-full text-[13px] font-extralight transition-all min-w-0 overflow-hidden ${
                      selectedOption === opt.value
                        ? "bg-[#5a7a72]/18 text-[#3d5c53] border border-[#5a7a72]/20"
                        : "bg-[#5a7a72]/6 text-[#5a7a72]/55 border border-[#5a7a72]/8 hover:bg-[#5a7a72]/12 hover:text-[#3d5c53]/75"
                    }`}
                    style={{ fontFamily: FONT }}
                  >
                    <span className="block truncate">{opt[lang]}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Custom input or free text input */}
            {currentQuestion.options ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isCustom ? (
                  <div className="w-full max-w-xs mt-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={currentQuestion.placeholder ? currentQuestion.placeholder[lang] : ""}
                      className="w-full px-4 py-3 bg-[#5a7a72]/6 backdrop-blur-sm border border-[#5a7a72]/12 rounded-2xl text-[#3d5c53]/80 placeholder:text-[#5a7a72]/22 text-center text-sm font-extralight outline-none focus:border-[#5a7a72]/25 focus:bg-[#5a7a72]/10 transition-all"
                      style={{ fontFamily: FONT }}
                    />
                  </div>
                ) : currentQuestion.allowCustom ? (
                  <button
                    onClick={handleCustomClick}
                    className="text-[#5a7a72]/25 text-[11px] hover:text-[#5a7a72]/45 transition-colors mt-1"
                    style={{ fontFamily: FONT }}
                  >
                    {t("orCustom")}
                  </button>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-xs"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentQuestion.placeholder ? currentQuestion.placeholder[lang] : ""}
                  className="w-full px-4 py-3 bg-[#5a7a72]/6 backdrop-blur-sm border border-[#5a7a72]/12 rounded-2xl text-[#3d5c53]/80 placeholder:text-[#5a7a72]/22 text-center text-sm font-extralight outline-none focus:border-[#5a7a72]/25 focus:bg-[#5a7a72]/10 transition-all"
                  style={{ fontFamily: FONT }}
                />
              </motion.div>
            )}

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-4 mt-6"
            >
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-5 py-2 text-[#5a7a72]/30 text-[11px] font-extralight tracking-wider hover:text-[#5a7a72]/50 transition-colors"
                  style={{ fontFamily: FONT }}
                >
                  {t("prevBtn")}
                </button>
              )}
              {(!currentQuestion.options || isCustom) && (
                <button
                  onClick={submitAnswer}
                  disabled={!currentInput.trim()}
                  className="px-7 py-2.5 bg-[#5a7a72]/8 backdrop-blur-sm border border-[#5a7a72]/10 text-[#5a7a72]/45 rounded-full text-[11px] font-extralight tracking-wider hover:bg-[#5a7a72]/15 hover:text-[#3d5c53]/65 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  style={{ fontFamily: FONT }}
                >
                  {t("nextBtn")}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Step 7: Loading */}
        {step === 7 && (
          <motion.div
            key="loading"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center text-center px-6 py-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="animate-gentle-pulse mb-8"
            >
              <div className="w-12 h-12 rounded-full bg-[#5a7a72]/8 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#5a7a72]/25" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl font-extralight text-[#3d5c53]/60 leading-relaxed"
              style={{ fontFamily: FONT }}
            >
              {answers.person || ""}
              {t("loadingTitle")}
            </motion.h2>
            <FloatingDots />
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-[#5a7a72]/45 text-sm"
                style={{ fontFamily: FONT }}
              >
                <p>{error}</p>
                <button
                  onClick={generateBlessing}
                  className="mt-3 px-5 py-2 bg-[#5a7a72]/10 rounded-full text-[#5a7a72]/45 text-xs hover:bg-[#5a7a72]/18 transition-all"
                  style={{ fontFamily: FONT }}
                >
                  {t("retryBtn")}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 8: Final Blessing - ONLY the two sentences */}
        {step === 8 && blessing && (
          <motion.div
            key="blessing"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center text-center px-6 sm:px-8 py-8 max-w-lg w-full"
          >
            <motion.div
              ref={blessingCardRef}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
              className="w-full py-16 px-8"
            >
              {/* Poetic sentence - smaller, lighter, like a whisper */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-light text-[#3d5c53]/40 leading-loose tracking-[0.2em] mb-8"
                style={{ fontFamily: FONT_ARTISTIC }}
              >
                {blessing.poeticSentence[lang]}
              </motion.p>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="w-10 h-px bg-[#5a7a72]/12 mx-auto mb-8"
              />

              {/* Birthday blessing - larger, prominent, medium weight kai */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-xl sm:text-2xl font-normal text-[#2d3c37]/82 leading-[2] tracking-[0.12em]"
                style={{ fontFamily: FONT_ARTISTIC }}
              >
                {blessing.birthdayBlessing[lang]}
              </motion.p>
            </motion.div>

            {/* Action buttons - subtle, below */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-6 mt-4"
            >
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-[#5a7a72]/22 text-[11px] font-extralight tracking-wider hover:text-[#5a7a72]/45 transition-colors disabled:opacity-30"
                style={{ fontFamily: FONT }}
              >
                {downloading ? t("downloading") : t("download")}
              </button>
              <button
                onClick={handleStartOver}
                className="text-[#5a7a72]/18 text-[11px] font-extralight tracking-wider hover:text-[#5a7a72]/35 transition-colors"
                style={{ fontFamily: FONT }}
              >
                {t("startOver")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
