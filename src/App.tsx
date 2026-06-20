import React, { useState, useEffect } from "react";
import AppHeader from "./components/AppHeader";
import VideoStage from "./components/VideoStage";
import SandboxSimulator from "./components/SandboxSimulator";
import TutorChat from "./components/TutorChat";
import QuizPanel from "./components/QuizPanel";
import { Chapter, LessonPlan } from "./types";
import { Sparkles, Terminal, PlayCircle, BookOpen, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

// Robust default lessons mirroring the backend's fallbacks as immediate options
const INITIAL_CURRICULUM: LessonPlan[] = [
  {
    id: "intro",
    title: "Intro To Forex & Pips",
    description: "Learn how the Foreign Exchange market functions and master base/quote pricing schemas.",
    pair: "EUR/USD",
    chapters: [
      {
        id: "intro-ch1",
        title: "Forex Mechanics & Currency Pairs",
        description: "Deconstructing base vs quote currency pricing and how spreads represent broker cost.",
        dialogue: [
          {
            speaker: "Ahmad",
            text: "Welcome to Dangata FX Academy! I am Ahmad, your trading mentor. Today we are joined by Sarah. Sarah, what do you think Forex actually represents?",
            action: "reset",
            duration: 8
          },
          {
            speaker: "Sarah",
            text: "Hi Ahmad! I know it stands for Foreign Exchange, so it's about trading international currencies against each other, right?",
            action: "trend_up",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "Spot on! Currencies always trade in pairs. For example, in the EUR/USD pair, the Euro is the 'Base' currency and the US Dollar is the 'Quote' currency.",
            action: "highlight_bullish",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "Ah, so if EUR/USD is listed at 1.1250, that means 1 Euro is worth exactly 1.1250 US Dollars?",
            action: "none",
            duration: 6
          },
          {
            speaker: "Ahmad",
            text: "Precisely! And when we buy this pair, we are projecting that the Euro will strengthen against the US dollar. If it rises, you make a profit!",
            action: "trend_up",
            duration: 8
          },
          {
            speaker: "Sarah",
            text: "Interesting! But what's the tiny difference in the price between buying and selling?",
            action: "none",
            duration: 5
          },
          {
            speaker: "Ahmad",
            text: "That difference is the 'Spread'. It is the transaction cost charged by the broker. Now, let's test your understanding of currency pairs!",
            action: "reset",
            duration: 7
          }
        ],
        quiz: [
          {
            question: "In the currency pair GBP/USD, which is the Base Currency?",
            options: ["US Dollar (USD)", "British Pound (GBP)", "The Broker's Fee", "Both share Base status"],
            correctIndex: 1,
            explanation: "In any currency quotes pair, the first currency listed (GBP) is the Base currency, and the second currency (USD) is the Quote currency."
          },
          {
            question: "If EUR/USD moves from 1.0500 to 1.0505, how big was this move?",
            options: ["5 Pips", "50 Pips", "0.5 Pips", "500 Pips"],
            correctIndex: 0,
            explanation: "For most currency pairs, a Pip is the 4th decimal place. Moving from 1.0500 to 1.0505 is a 5-pip shift upward."
          }
        ]
      }
    ]
  },
  {
    id: "candles",
    title: "Mastering Candlestick Patterns",
    description: "Recognize key bullish/bearish candle triggers and spot momentum shifts.",
    pair: "GBP/USD",
    chapters: [
      {
        id: "candles-ch1",
        title: "Anatomy of a Candlestick",
        description: "Understanding open, close, high, and low levels and spotting Hammer and Shooting Star structures.",
        dialogue: [
          {
            speaker: "Ahmad",
            text: "Now, let's look at the main screens. We use Japanese Candlesticks to plot market history. Each candle shows four price points over a specific timeframe.",
            action: "reset",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "I see green and red candles! The green ones are going high and fast, and the red ones are falling, correct?",
            action: "trend_up",
            duration: 6
          },
          {
            speaker: "Ahmad",
            text: "Yes, exactly! A green candle is 'Bullish' which means it closed higher than its open. A red candle is 'Bearish', closing lower than its open price.",
            action: "highlight_bullish",
            duration: 10
          },
          {
            speaker: "Sarah",
            text: "What about those thin lines extending from the top and bottom of the candle's blocks?",
            action: "none",
            duration: 5
          },
          {
            speaker: "Ahmad",
            text: "Splendid question. Those are 'Wicks' or 'Shadows'. They depict the highest and lowest prices reached during that session, showing intense rejection.",
            action: "highlight_bearish",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "Oh! So if a candle has a long wick at the bottom, it means sellers pushed hard but buyers forced prices back up before closure?",
            action: "trend_up",
            duration: 8
          },
          {
            speaker: "Ahmad",
            text: "Perfect! We call that pattern a 'Hammer'. It is a powerful bullish reversal signal. Let's do a quick quiz to see if you can trade it!",
            action: "add_buy_marker",
            duration: 8
          }
        ],
        quiz: [
          {
            question: "What does a long wick at the bottom of a Hammer candlestick suggest?",
            options: ["The bear trend will push stronger", "Rejection of lower prices and potential bullish reversal", "A broker price error", "Market is closing down immediately"],
            correctIndex: 1,
            explanation: "The long bottom wick represents a period where sellers dominated, but buyers aggressively drove price back up before the close, suggesting bullish reversal."
          },
          {
            question: "If a candlestick's close price is lower than its open price, what color is it usually?",
            options: ["Green (Bullish)", "Blue (Neutral)", "Red (Bearish)", "Orange (Alert)"],
            correctIndex: 2,
            explanation: "When close is below open, the body is filled with red (or black), indicating of a bearish period."
          }
        ]
      }
    ]
  },
  {
    id: "support",
    title: "Support & Resistance Breakouts",
    description: "Identify key supply and demand areas and learn to trade breakouts with precise rules.",
    pair: "USD/JPY",
    chapters: [
      {
        id: "support-ch1",
        title: "Lines in the Sand",
        description: "How to locate buying zones (Support) and selling ceilings (Resistance).",
        dialogue: [
          {
            speaker: "Ahmad",
            text: "Sarah, imagine price is like a bouncing ball. It doesn't move in a straight line. It has ceilings and floors.",
            action: "reset",
            duration: 7
          },
          {
            speaker: "Sarah",
            text: "I guess floors are where price stops falling and bounces back up, because of buyers accumulating cheap contracts?",
            action: "trend_up",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "Exactly, that is 'Support'. Conversely, 'Resistance' acts as a ceiling where sellers saturate the market, stopping high climbs.",
            action: "draw_resistance",
            duration: 8
          },
          {
            speaker: "Sarah",
            text: "So if price hits resistance three times and drops, that resistance must be a great place to trade short positions, right?",
            action: "draw_support",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "Very wise. But when price breaks ABOVE a strong resistance, that ceiling often becomes the new floor (Support) as high breakout buying starts!",
            action: "trend_up",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "Fascinating! Then I should wait for the retest of that break before jumping into a buy order.",
            action: "add_buy_marker",
            duration: 6
          },
          {
            speaker: "Ahmad",
            text: "That is the mark of a seasoned professional trader. Practice patience. Let's lock this down with our chapter quiz!",
            action: "reset",
            duration: 7
          }
        ],
        quiz: [
          {
            question: "What is the key dynamic when resistance is broken upward?",
            options: ["It becomes a stronger ceiling", "It becomes a new support level", "The broker resets spreads", "Price is locked forever"],
            correctIndex: 1,
            explanation: "Once resistance is broken, it typically flips roles to become support, offering a reliable entry point on structural retests."
          },
          {
            question: "Why does support hold price from dropping?",
            options: ["Buying interest dominates selling pressure", "Selling forces take full control", "Broker pauses transactions", "All of the above"],
            correctIndex: 0,
            explanation: "Support zones maintain price because buying interest is strong enough to absorb selling pressure, causing demand to lift the market."
          }
        ]
      }
    ]
  }
];

export default function App() {
  const [curriculum, setCurriculum] = useState<LessonPlan[]>(INITIAL_CURRICULUM);
  const [activeLesson, setActiveLesson] = useState<LessonPlan>(INITIAL_CURRICULUM[0]);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [demoBalance, setDemoBalance] = useState(10000);
  const [badges, setBadges] = useState<string[]>(["Welcome Trader"]);
  const [activeTab, setActiveTab] = useState<"quiz" | "sandbox" | "chat">("sandbox");
  const [whiteboardAction, setWhiteboardAction] = useState("none");

  // Chapter completeness callbacks
  const activeChapter: Chapter = activeLesson.chapters[activeChapterIdx] || activeLesson.chapters[0];

  const handleLessonChange = (lesson: LessonPlan) => {
    setActiveLesson(lesson);
    setActiveChapterIdx(0);
    setWhiteboardAction("none");
  };

  const handleUnlockBadge = (badgeName: string) => {
    if (!badges.includes(badgeName)) {
      setBadges((prev) => [...prev, badgeName]);
    }
  };

  // Trigger generator flow
  const handleGenerateCustomLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationStep(1);

    // Dynamic messaging simulation to make AI generation enjoyable
    const interval = setInterval(() => {
      setGenerationStep((step) => {
        if (step < 4) return step + 1;
        return step;
      });
    }, 2000);

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: customPrompt }),
      });

      const data = await response.json();
      if (response.ok) {
        const generated: LessonPlan = {
          id: data.id || `lesson-${Date.now()}`,
          title: data.title || `Custom Masterclass: ${customPrompt}`,
          description: data.description || `Generated lesson matching request: ${customPrompt}`,
          pair: data.pair || "EUR/USD",
          chapters: data.chapters || [],
        };

        setCurriculum((prev) => [generated, ...prev]);
        setActiveLesson(generated);
        setActiveChapterIdx(0);
        setCustomPrompt("");
        setActiveTab("quiz"); // switch to quiz after watch
      } else {
        throw new Error(data.error || "Generation endpoint faulted");
      }
    } catch (err) {
      console.error(err);
      // Construct immediate smart local lesson as failsafe
      const simulated: LessonPlan = {
        id: `sim-${Date.now()}`,
        title: `AI Session: ${customPrompt}`,
        description: `Highly customized Forex educational package focused on: ${customPrompt}`,
        pair: "AUD/USD",
        chapters: [
          {
            id: `sim-ch1`,
            title: `Introduction to ${customPrompt}`,
            description: `Core parameters, patterns, and calculations of ${customPrompt}`,
            dialogue: [
              {
                speaker: "Ahmad",
                text: `Welcome, Sarah. Today we are using our board computers to map: ${customPrompt}. Ready to look at currency reactions?`,
                action: "reset",
                duration: 9
              },
              {
                speaker: "Sarah",
                text: `Absolutely, Ahmad! This is exactly what I've been struggling to plan into my risk systems!`,
                action: "trend_up",
                duration: 7
              },
              {
                speaker: "Ahmad",
                text: "No problem. Let's start with identifying the zone where sellers begin putting selling limits. That is our ceiling resistance.",
                action: "draw_resistance",
                duration: 9
              },
              {
                speaker: "Sarah",
                text: "So if price bounces down, we know supply exceeds demand, right?",
                action: "none",
                duration: 6
              },
              {
                speaker: "Ahmad",
                text: "Perfect! Once verified, we place our stop loss above the ceiling and follow the general trend downwards.",
                action: "add_sell_marker",
                duration: 8
              }
            ],
            quiz: [
              {
                question: `What represents the safest risk practice when trading based on ${customPrompt}?`,
                options: [
                  "Trade maximum available margins immediately",
                  "Secure protective Stop Loss tags right above structural zones",
                  "Ignore broker spread differences",
                  "Trading only during high volatility closures only"
                ],
                correctIndex: 1,
                explanation: `Setting Stop Loss measures strictly above structural resistance guarantees that invalidations trigger minor demo capital losses only.`
              }
            ]
          }
        ]
      };

      setCurriculum((prev) => [simulated, ...prev]);
      setActiveLesson(simulated);
      setActiveChapterIdx(0);
      setCustomPrompt("");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const GENERATION_STEPS_TEXT = [
    "Establishing connection with Dangata FX Database...",
    "Drafting interactive lesson dialogue between Ahmad and Sarah...",
    "Plotting precise whiteboard chart visual triggers...",
    "Injecting multiple-choice exams & answers...",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="forex-academy-app">
      {/* App Header Bar */}
      <AppHeader 
        demoBalance={demoBalance} 
        badges={badges} 
        currentPairPrice={1.1245} 
        pair={activeLesson.pair} 
      />

      {/* Main Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 overflow-x-hidden">
        {/* Dynamic AI Custom Lesson Generator Row */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md shrink-0">
          <div className="max-w-md">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase font-mono tracking-wide">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" /> Ask Gemini To Create A Custom Video Class
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Specify any niche strategy or indicator (e.g. "Fibonacci Retracements" or "Risk Management").
            </p>
          </div>

          <form onSubmit={handleGenerateCustomLesson} className="flex-1 max-w-xl w-full flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. MACD Crossover, News Trading, Order Blocks..."
              disabled={isGenerating}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
            />
            <button
              type="submit"
              disabled={isGenerating || !customPrompt.trim()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow shadow-emerald-950"
            >
              <Sparkles className="h-4 w-4" /> GENERATE
            </button>
          </form>
        </section>

        {/* Loading Spinner overlay state */}
        {isGenerating && (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl animate-fade-in shrink-0">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
            <h3 className="text-base font-bold text-slate-100">Generating Your Interactive Masterclass</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5">
              {GENERATION_STEPS_TEXT[generationStep - 1] || "Compiling educational video details..."}
            </p>
          </div>
        )}

        {/* Core Lesson + Practising Arena Container */}
        {!isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT AREA: Chapters Navigation & Video Stage */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
              {/* Curriculum Selector Cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-md shrink-0">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500">Curriculum Units</span>
                <div className="flex gap-2.5 overflow-x-auto pb-1 select-none">
                  {curriculum.map((item) => {
                    const isSelected = item.id === activeLesson.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleLessonChange(item)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans border transition-all text-left whitespace-nowrap shrink-0 ${
                          isSelected 
                            ? "bg-slate-950 border-emerald-500/50 text-emerald-400 font-bold shadow-md shadow-emerald-950/20" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                        <div>
                          <div className="font-sans leading-tight">{item.title}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{item.pair} Classroom</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* The Video Stage component */}
              <VideoStage 
                chapter={activeChapter} 
                activeWordIndex={0} 
                pair={activeLesson.pair} 
                onChapterComplete={() => {
                  console.log("Chapter watching complete!");
                  // When complete, prompt to do quiz
                  setActiveTab("quiz");
                }}
                onActionTriggered={(act) => setWhiteboardAction(act)}
              />
            </div>

            {/* RIGHT AREA: Evaluation & Working Desk Tabs */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-4">
              {/* Desktop Workspace Side-Tabs Navigation */}
              <div className="flex bg-slate-900/80 p-1 border border-slate-800 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab("sandbox")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "sandbox" 
                      ? "bg-slate-950 text-emerald-400 shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="h-4 w-4" /> Live Sandbox
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "quiz" 
                      ? "bg-slate-950 text-emerald-400 shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" /> Class Test
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "chat" 
                      ? "bg-slate-950 text-emerald-400 shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="h-4 w-4" /> Mentor Chat
                </button>
              </div>

              {/* Display selected active component container */}
              <div className="transition-all duration-300">
                {activeTab === "sandbox" && (
                  <SandboxSimulator 
                    demoBalance={demoBalance} 
                    onBalanceUpdate={(bal) => setDemoBalance(bal)} 
                    activePair={activeLesson.pair} 
                  />
                )}

                {activeTab === "quiz" && (
                  <QuizPanel 
                    quizList={activeChapter.quiz} 
                    chapterTitle={activeChapter.title}
                    onUnlockBadge={handleUnlockBadge}
                    unlockedBadges={badges}
                  />
                )}

                {activeTab === "chat" && (
                  <TutorChat 
                    pair={activeLesson.pair} 
                    onTutorRequest={(msg) => console.log(msg)} 
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
