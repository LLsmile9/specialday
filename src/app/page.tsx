"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

interface StoryOption {
  zh: string;
  en: string;
  value: string;
}

interface StoryStep {
  key: string;
  type: "input" | "options";
  question: (lang: Lang, answers: Answers) => string;
  options?: StoryOption[];
  placeholder?: { zh: string; en: string };
}

const TOTAL_STEPS = 8;

// ─── Story steps (fixed sequence) ───────────────────────────────────────────
const storySteps: StoryStep[] = [
  {
    key: "name",
    type: "input",
    question: () => "",
    placeholder: { zh: "你的名字", en: "Your name" },
  },
  {
    key: "river",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "木船漂到了哪里？"
        : "Where does the boat drift to?",
    options: [
      { zh: "山间的溪流", en: "Mountain stream", value: "山间的溪流" },
      { zh: "湍急的大河", en: "Rushing river", value: "湍急的大河" },
      { zh: "冰川脚下", en: "Beneath a glacier", value: "冰川脚下" },
      { zh: "森林里的河流", en: "Forest river", value: "森林里的河流" },
    ],
  },
  {
    key: "boatState",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "小船的状态是——"
        : "The boat's pace is —",
    options: [
      { zh: "飞驰起来", en: "Racing forward", value: "飞驰起来" },
      { zh: "顺流而下", en: "Drifting along", value: "顺流而下" },
      { zh: "沉重而缓慢", en: "Heavy and slow", value: "沉重而缓慢" },
      { zh: "轻盈而流畅", en: "Light and fluid", value: "轻盈而流畅" },
    ],
  },
  {
    key: "weather",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "你抬头看了看天空，天气怎么样？"
        : "You look up at the sky. How's the weather?",
    options: [
      { zh: "碧蓝一片", en: "Clear blue sky", value: "碧蓝一片" },
      { zh: "乌云密布", en: "Dark clouds", value: "乌云密布" },
      { zh: "起风了", en: "The wind picks up", value: "起风了" },
      { zh: "要下雨了", en: "About to rain", value: "要下雨了" },
    ],
  },
  {
    key: "shore",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "岸边出现了什么景象？"
        : "What appears along the shore?",
    options: [
      { zh: "牛羊遍地的草原", en: "Meadows with grazing sheep", value: "牛羊遍地的草原" },
      { zh: "清澈见底的湖泊", en: "Crystal-clear lake", value: "清澈见底的湖泊" },
      { zh: "高低错落的树林", en: "Scattered woods", value: "高低错落的树林" },
      { zh: "飞流直下的瀑布", en: "Cascading waterfall", value: "飞流直下的瀑布" },
    ],
  },
  {
    key: "smell",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "这时飘来一股味道——"
        : "A scent drifts by —",
    options: [
      { zh: "沁人心脾的花香", en: "Intoxicating floral scent", value: "沁人心脾的花香" },
      { zh: "树木的清新", en: "Freshness of trees", value: "树木的清新" },
      { zh: "不知哪来的野炊香气", en: "A distant campfire aroma", value: "不知哪来的野炊香气" },
      { zh: "雨后泥土的气息", en: "Earthy scent after rain", value: "雨后泥土的气息" },
    ],
  },
  {
    key: "food",
    type: "options",
    question: (lang) =>
      lang === "zh"
        ? "你饿了，船上准备了你喜欢的食物，那是——"
        : "You're hungry. On board is your favorite food —",
    options: [
      { zh: "红酒与奶酪", en: "Wine and cheese", value: "红酒与奶酪" },
      { zh: "桂花糕与清茶", en: "Osmanthus cake and tea", value: "桂花糕与清茶" },
      { zh: "热腾腾的火锅", en: "Steaming hot pot", value: "热腾腾的火锅" },
      { zh: "刚出炉的面包", en: "Freshly baked bread", value: "刚出炉的面包" },
    ],
  },
  {
    key: "person",
    type: "input",
    question: (lang) =>
      lang === "zh"
        ? "远处有人在向你招手，正是你一直想遇见的人，他/她是？"
        : "Someone waves from afar — the one you've always wished to meet. Who is it?",
    placeholder: {
      zh: "作家、诗人、或者任何人……",
      en: "A writer, a poet, or anyone...",
    },
  },
];

// ─── Narrative sentence for each option value ───────────────────────────────
const narrativeMap: Record<string, Record<string, { zh: string; en: string }>> = {
  river: {
    "山间的溪流": { zh: "漂入了一条山间溪流", en: "It drifts into a mountain stream" },
    "湍急的大河": { zh: "漂入了湍急的大河", en: "It drifts into a rushing river" },
    "冰川脚下": { zh: "漂到了冰川脚下", en: "It drifts beneath a glacier" },
    "森林里的河流": { zh: "漂入了森林中的河流", en: "It drifts into a river through the forest" },
  },
  boatState: {
    "飞驰起来": { zh: "小船飞驰起来，水花飞溅", en: "The boat races forward, spray flying" },
    "顺流而下": { zh: "小船顺流而下，悠然前行", en: "The boat drifts with the current, gliding gently" },
    "沉重而缓慢": { zh: "小船缓缓而行，沉稳笃定", en: "The boat moves slowly, steady and sure" },
    "轻盈而流畅": { zh: "小船轻盈地滑过水面", en: "The boat glides lightly across the water" },
  },
  weather: {
    "碧蓝一片": { zh: "天空碧蓝如洗", en: "The sky is a clear, endless blue" },
    "乌云密布": { zh: "天空乌云密布", en: "Dark clouds gather overhead" },
    "起风了": { zh: "忽然起风了", en: "The wind begins to rise" },
    "要下雨了": { zh: "天色渐暗，似乎要下雨了", en: "The sky darkens, rain seems near" },
  },
  shore: {
    "牛羊遍地的草原": { zh: "两岸是牛羊遍地的草原", en: "Grasslands stretch along the banks, dotted with grazing sheep" },
    "清澈见底的湖泊": { zh: "岸边出现了清澈见底的湖泊", en: "A crystal-clear lake appears along the shore" },
    "高低错落的树林": { zh: "两岸是高低错落的树林", en: "Woods of varying heights line the banks" },
    "飞流直下的瀑布": { zh: "远处传来瀑布的轰鸣", en: "The roar of a waterfall echoes from afar" },
  },
  smell: {
    "沁人心脾的花香": { zh: "空气中飘来沁人心脾的花香", en: "An intoxicating floral scent drifts through the air" },
    "树木的清新": { zh: "空气中飘来树木的清新气息", en: "The fresh scent of trees fills the air" },
    "不知哪来的野炊香气": { zh: "不知从哪里飘来野炊的香气", en: "The aroma of a campfire wafts from somewhere" },
    "雨后泥土的气息": { zh: "闻到了雨后泥土的芬芳", en: "The earthy scent of rain-soaked soil rises" },
  },
  food: {
    "红酒与奶酪": { zh: "船上摆着红酒与奶酪", en: "On board, there is wine and cheese" },
    "桂花糕与清茶": { zh: "船上摆着桂花糕和一壶清茶", en: "On board, there is osmanthus cake and a pot of tea" },
    "热腾腾的火锅": { zh: "船上竟然有一锅热腾腾的火锅", en: "On board, there is a steaming hot pot" },
    "刚出炉的面包": { zh: "船上放着刚出炉的面包", en: "On board, there is freshly baked bread" },
  },
};

// ─── Build narrative from answers ───────────────────────────────────────────
function buildNarrative(answers: Answers, lang: Lang, currentStep: number): string {
  const parts: { zh: string; en: string }[] = [];

  for (let i = 0; i < currentStep - 1 && i < storySteps.length; i++) {
    const step = storySteps[i];
    const answer = answers[step.key];
    if (!answer) continue;

    if (step.key === "name") {
      parts.push({
        zh: `一条小木船载着${answer}出发了`,
        en: `A little wooden boat carries ${answer} away`,
      });
    } else if (step.key === "person") {
      parts.push({
        zh: `远处有人向你招手——正是${answer}。小船缓缓靠岸`,
        en: `Someone waves from afar — it's ${answer}. The boat slowly reaches the shore`,
      });
    } else {
      const map = narrativeMap[step.key];
      if (map && map[answer]) {
        parts.push(map[answer]);
      }
    }
  }

  const text = parts.map((p) => p[lang]).join("。");
  return text ? text + "。" : "";
}

// ─── UI text ────────────────────────────────────────────────────────────────
const text: Record<string, Record<Lang, string>> = {
  welcomeTitle: { zh: "今天，是特别的", en: "Today is special" },
  welcomeSub: { zh: "一条小木船正在等你", en: "A little wooden boat is waiting for you" },
  startBtn: { zh: "出发", en: "Set off" },
  nextBtn: { zh: "继续", en: "Continue" },
  prevBtn: { zh: "上一步", en: "Back" },
  loadingPrefix: { zh: "小船缓缓靠岸，", en: "The boat reaches the shore. " },
  loadingTitle: { zh: "想对你说……", en: "wants to say to you..." },
  retryBtn: { zh: "再试一次", en: "Try again" },
  errorMsg: {
    zh: "生成祝福时出了点小问题，再试一次吧",
    en: "Something went wrong. Let's try again.",
  },
  startOver: { zh: "重新来过", en: "Start over" },
  download: { zh: "保存这张祝福卡", en: "Save this blessing card" },
  downloading: { zh: "正在保存...", en: "Saving..." },
  nameQuestion: { zh: "告诉我，该怎么称呼你？", en: "Tell me, what should I call you?" },
};

// ─── Animation & fonts ──────────────────────────────────────────────────────
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

const FONT = 'var(--font-lxgw-wenkai), "LXGW WenKai", serif';
const FONT_ARTISTIC = 'var(--font-long-cang), "Long Cang", var(--font-lxgw-wenkai), serif';

// ─── Sub-components ─────────────────────────────────────────────────────────
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

// ─── Main component ─────────────────────────────────────────────────────────
export default function Home() {
  // step: 0=welcome, 1-8=story, 9=loading, 10=result
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>("zh");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentInput, setCurrentInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [blessing, setBlessing] = useState<BlessingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blessingCardRef = useRef<HTMLDivElement>(null);

  const t = useCallback((key: string) => text[key]?.[lang] ?? key, [lang]);

  // Build the story narrative to display at current step
  const narrative = buildNarrative(answers, lang, step);

  // Build the full story text (for API) after person is entered
  const fullStoryZh = buildNarrative(answers, "zh", TOTAL_STEPS + 1);

  const generateBlessing = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/generate-blessing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: answers.name,
          person: answers.person,
          story: fullStoryZh,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setBlessing(data);
      setStep(10);
    } catch {
      setError(t("errorMsg"));
    }
  }, [answers, fullStoryZh, t]);

  // Focus input when step changes
  useEffect(() => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      const s = storySteps[step - 1];
      if (s.type === "input") {
        const saved = answers[s.key];
        setCurrentInput(saved || "");
        setTimeout(() => inputRef.current?.focus(), 150);
      } else {
        setCurrentInput("");
      }
      setSelectedOption("");
    }
  }, [step]);

  useEffect(() => {
    if (step === 9 && !blessing) generateBlessing();
  }, [step, blessing, generateBlessing]);

  const submitAnswer = useCallback(() => {
    if (step < 1 || step > TOTAL_STEPS) return;
    const s = storySteps[step - 1];
    const value = currentInput.trim();
    if (!value) return;
    setAnswers((prev) => ({ ...prev, [s.key]: value }));
    setCurrentInput("");
    if (step === TOTAL_STEPS) {
      setStep(9); // loading
    } else {
      setStep(step + 1);
    }
  }, [step, currentInput]);

  const handleStart = useCallback(() => setStep(1), []);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep(step - 1);
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
      const s = storySteps[step - 1];
      setAnswers((prev) => ({ ...prev, [s.key]: value }));
      setTimeout(() => {
        setSelectedOption("");
        if (step === TOTAL_STEPS) {
          setStep(9);
        } else {
          setStep(step + 1);
        }
      }, 400);
    },
    [step]
  );

  const handleStartOver = useCallback(() => {
    setStep(0);
    setAnswers({});
    setCurrentInput("");
    setSelectedOption("");
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
      ctx.font = "200 14px serif";
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
      ctx.font = "300 20px serif";
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

  const progressPercent =
    step === 0 ? 0 : step >= 9 ? 100 : Math.round((step / TOTAL_STEPS) * 100);

  const currentStep = step >= 1 && step <= TOTAL_STEPS ? storySteps[step - 1] : null;

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #D8F2EC 0%, #C8EBE3 30%, #B8E3DC 60%, #AEDBDA 100%)",
      }}
    >
      <DecorativeStars />

      {/* Language toggle */}
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
      {step >= 1 && step <= TOTAL_STEPS && (
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
        {/* ── Step 0: Welcome ── */}
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

        {/* ── Steps 1-8: Story ── */}
        {step >= 1 && step <= TOTAL_STEPS && currentStep && (
          <motion.div
            key={`story-${step}`}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center justify-center text-center px-5 sm:px-6 py-10 max-w-lg w-full"
          >
            {/* Step indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="text-[#5a7a72]/20 text-[11px] tracking-[0.25em] mb-8"
              style={{ fontFamily: FONT }}
            >
              {step} / {TOTAL_STEPS}
            </motion.div>

            {/* Narrative paragraph (accumulated story) */}
            {narrative && (
              <motion.p
                key={`narrative-${step}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-sm font-extralight text-[#5a7a72]/30 leading-loose tracking-wider mb-4 max-w-sm"
                style={{ fontFamily: FONT_ARTISTIC }}
              >
                {narrative}
              </motion.p>
            )}

            {/* Subtle divider between narrative and question */}
            {narrative && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="w-8 h-px bg-[#5a7a72]/10 mb-4"
              />
            )}

            {/* Question */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl font-extralight text-[#3d5c53]/80 leading-relaxed mb-8 max-w-sm"
              style={{ fontFamily: FONT }}
            >
              {currentStep.key === "name"
                ? t("nameQuestion")
                : currentStep.question(lang, answers)}
            </motion.h2>

            {/* Options grid */}
            {currentStep.type === "options" && currentStep.options && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-2.5 mb-4 w-full max-w-md"
              >
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleOptionClick(opt.value)}
                    className={`px-3 py-2.5 rounded-full text-[13px] font-extralight transition-all min-w-0 overflow-hidden ${
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

            {/* Text input (for name & person steps) */}
            {currentStep.type === "input" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xs"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    currentStep.placeholder
                      ? currentStep.placeholder[lang]
                      : ""
                  }
                  className="w-full px-4 py-3 bg-[#5a7a72]/6 backdrop-blur-sm border border-[#5a7a72]/12 rounded-2xl text-[#3d5c53]/80 placeholder:text-[#5a7a72]/22 text-center text-sm font-extralight outline-none focus:border-[#5a7a72]/25 focus:bg-[#5a7a72]/10 transition-all"
                  style={{ fontFamily: FONT }}
                />
              </motion.div>
            )}

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
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
              {currentStep.type === "input" && (
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

        {/* ── Step 9: Loading ── */}
        {step === 9 && (
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
              {t("loadingPrefix")}
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

        {/* ── Step 10: Final Blessing ── */}
        {step === 10 && blessing && (
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
              {/* Poetic sentence */}
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

              {/* Birthday blessing */}
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

            {/* Action buttons */}
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
