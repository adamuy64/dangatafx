import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, SkipForward, ArrowRightLeft, BookOpen, Presentation, Sparkles } from "lucide-react";
import { DialogueEntry, Chapter } from "../types";

interface VideoStageProps {
  chapter: Chapter;
  activeWordIndex: number;
  pair: string;
  onChapterComplete: () => void;
  onActionTriggered?: (action: string) => void;
}

export default function VideoStage({
  chapter,
  activeWordIndex,
  pair,
  onChapterComplete,
  onActionTriggered,
}: VideoStageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [elapsedInEntry, setElapsedInEntry] = useState(0);
  const [cumulativeTime, setCumulativeTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chartElements, setChartElements] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dialogue = chapter.dialogue;
  
  // Total lesson duration calculation
  const totalDuration = dialogue.reduce((sum, item) => sum + item.duration, 0);

  // Derive current cumulative playback time
  const currentElapsedSeconds = dialogue
    .slice(0, currentEntryIndex)
    .reduce((sum, item) => sum + item.duration, 0) + elapsedInEntry;

  useEffect(() => {
    // Reset status when chapter changes
    setIsPlaying(false);
    setCurrentEntryIndex(0);
    setElapsedInEntry(0);
    setCumulativeTime(0);
    setChartElements([]);
  }, [chapter]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedInEntry((prev) => {
          const entry = dialogue[currentEntryIndex];
          if (!entry) return prev;

          if (prev >= entry.duration - 1) {
            // Move to next entry!
            if (currentEntryIndex < dialogue.length - 1) {
              const nextIdx = currentEntryIndex + 1;
              setCurrentEntryIndex(nextIdx);
              // Trigger action if available
              const nextEntry = dialogue[nextIdx];
              if (nextEntry.action && onActionTriggered) {
                onActionTriggered(nextEntry.action);
              }
              return 0;
            } else {
              // Dialogue finished!
              setIsPlaying(false);
              onChapterComplete();
              return prev;
            }
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentEntryIndex, dialogue, playbackSpeed, onChapterComplete, onActionTriggered]);

  const currentEntry: DialogueEntry | undefined = dialogue[currentEntryIndex];

  // Map active action inside dialogue entries to visual chart decorations
  const activeAction = currentEntry?.action || "none";

  // Replay
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentEntryIndex(0);
    setElapsedInEntry(0);
  };

  const skipEntry = () => {
    if (currentEntryIndex < dialogue.length - 1) {
      setCurrentEntryIndex((prev) => prev + 1);
      setElapsedInEntry(0);
    } else {
      setIsPlaying(false);
      onChapterComplete();
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6" id="video-stage">
      {/* Visual Workspace & Class Mockup */}
      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
        {/* Top Header Watermark */}
        <div className="flex justify-between items-center text-xs font-mono text-slate-500 z-10">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Presentation className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">Session: {chapter.title}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-full text-[10px] text-teal-400">
            <span className="animate-pulse bg-teal-500 h-1.5 w-1.5 rounded-full"></span>
            BOARD MONITOR: {pair}
          </div>
        </div>

        {/* The Whiteboard Canvas overlay representing visual teachings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 mt-10 mb-20">
          <div className="w-full h-full relative overflow-hidden bg-slate-950/40 rounded-lg flex items-center justify-center">
            {/* Grid Pattern Background to match Trading Terminal look */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>

            {/* Custom SVG / Animated Candlesticks and indicators drawn dynamically */}
            <svg className="w-full h-full absolute inset-0 text-slate-700" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bullishGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="bearishGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Standard Candles Background mimicking currency pattern */}
              <g opacity="0.35">
                <line x1="50" y1="40" x2="50" y2="150" stroke="#475569" strokeWidth="1" />
                <rect x="42" y="60" width="16" height="60" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="1" />

                <line x1="100" y1="30" x2="100" y2="120" stroke="#10b981" strokeWidth="1.2" />
                <rect x="92" y="50" width="16" height="50" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="1" />

                <line x1="150" y1="80" x2="150" y2="170" stroke="#ef4444" strokeWidth="1.2" />
                <rect x="142" y="90" width="16" height="60" fill="#991b1b" stroke="#ef4444" strokeWidth="1.5" rx="1" />

                <line x1="200" y1="60" x2="200" y2="140" stroke="#475569" strokeWidth="1" />
                <rect x="192" y="80" width="16" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="1" />

                <line x1="250" y1="40" x2="250" y2="110" stroke="#10b981" strokeWidth="1.2" />
                <rect x="242" y="60" width="16" height="40" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="1" />

                <line x1="300" y1="20" x2="300" y2="90" stroke="#10b981" strokeWidth="1.2" />
                <rect x="292" y="30" width="16" height="50" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="1" />
              </g>

              {/* DYNAMIC Whiteboard Visual Draw-overs matching Dialogue Actions */}
              
              {/* SUPPORT ZONE */}
              {(activeAction === "draw_support" || activeAction === "add_buy_marker") && (
                <g className="animate-fade-in">
                  <line x1="20" y1="140" x2="380" y2="140" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
                  <rect x="30" y="145" width="140" height="18" fill="#0c4a6e" rx="4" opacity="0.9" />
                  <text x="35" y="157" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">SUPPORT ZONE (FLOOR-DEMAND)</text>
                  <circle cx="150" cy="140" r="8" fill="#0284c7" className="animate-ping" opacity="0.5" />
                  <circle cx="150" cy="140" r="4" fill="#38bdf8" />
                </g>
              )}

              {/* RESISTANCE ZONE */}
              {(activeAction === "draw_resistance" || activeAction === "add_sell_marker") && (
                <g className="animate-fade-in">
                  <line x1="20" y1="50" x2="380" y2="50" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
                  <rect x="240" y="25" width="140" height="18" fill="#881337" rx="4" opacity="0.9" />
                  <text x="245" y="37" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">RESISTANCE ZONE (CEILING-SUPPLY)</text>
                  <circle cx="300" cy="50" r="8" fill="#be123c" className="animate-ping" opacity="0.5" />
                  <circle cx="300" cy="50" r="4" fill="#f43f5e" />
                </g>
              )}

              {/* BULLISH CANDLE FLASH */}
              {activeAction === "highlight_bullish" && (
                <g className="animate-bounce">
                  <rect x="88" y="44" width="24" height="62" fill="url(#bullishGrad)" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
                  <text x="120" y="70" fill="#10b981" fontSize="11" fontFamily="sans-serif" fontWeight="bold">BULLISH CANDLE (BUYERS RUSH)</text>
                  <path d="M 100,120 L 100,140" stroke="#10b981" strokeWidth="2" />
                  {/* Upward Arrow */}
                  <path d="M 100,45 L 94,52 L 106,52 Z" fill="#10b981" />
                </g>
              )}

              {/* BEARISH CANDLE FLASH */}
              {activeAction === "highlight_bearish" && (
                <g className="animate-pulse">
                  <rect x="138" y="84" width="24" height="72" fill="url(#bearishGrad)" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                  <text x="170" y="125" fill="#ef4444" fontSize="10" fontFamily="sans-serif" fontWeight="bold">BEARISH DROP (SELLERS IN CONTROL)</text>
                  {/* Downward Arrow */}
                  <path d="M 150,165 L 144,158 L 156,158 Z" fill="#ef4444" />
                </g>
              )}

              {/* TREND LINE UP */}
              {activeAction === "trend_up" && (
                <g className="animate-fade-in">
                  <path d="M 30,160 Q 150,130 350,45" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                  <text x="140" y="90" fill="#10b981" fontSize="11" fontFamily="sans-serif" fontWeight="bold" transform="rotate(-15, 120, 100)">UPWARD TREND (Higher Highs)</text>
                  <circle cx="350" cy="45" r="5" fill="#10b981" />
                </g>
              )}

              {/* TREND LINE DOWN */}
              {activeAction === "trend_down" && (
                <g className="animate-fade-in">
                  <path d="M 30,40 Q 180,60 360,170" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                  <text x="140" y="110" fill="#ef4444" fontSize="11" fontFamily="sans-serif" fontWeight="bold" transform="rotate(20, 160, 110)">DOWNWARD TREND (Lower Lows)</text>
                  <circle cx="360" cy="170" r="5" fill="#ef4444" />
                </g>
              )}

              {/* BUY TRIGGER FLAG */}
              {activeAction === "add_buy_marker" && (
                <g className="animate-bounce">
                  <rect x="80" y="115" width="100" height="20" fill="#065f46" stroke="#10b981" strokeWidth="1.5" rx="4" />
                  <text x="85" y="129" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold">BUY ACTIVE @ {currentEntryIndex === 6 ? "1.1240" : "1.0500"}</text>
                  <polyline points="75,125 65,125 70,121" fill="none" stroke="#10b981" strokeWidth="2" />
                  {/* Stop Loss Target line */}
                  <line x1="40" y1="150" x2="220" y2="150" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="42" y="160" fill="#ef4444" fontSize="8" fontFamily="monospace">STOP LOSS FLOOR (SL)</text>
                </g>
              )}

              {/* SELL TRIGGER FLAG */}
              {activeAction === "add_sell_marker" && (
                <g className="animate-pulse">
                  <rect x="230" y="65" width="110" height="20" fill="#991b1b" stroke="#f43f5e" strokeWidth="1.5" rx="4" />
                  <text x="235" y="79" fill="#fca5a5" fontSize="9" fontFamily="monospace" fontWeight="bold">SELL ACTIVE @ 154.50</text>
                  {/* Limit levels */}
                  <line x1="200" y1="40" x2="380" y2="40" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="202" y="36" fill="#38bdf8" fontSize="8" fontFamily="monospace">TARGET LIMIT (TP)</text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Floating Instructor Dialogue Box (Overlay bottom of Screen) */}
        <div className="mt-auto relative bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-800/80 shadow-2xl flex items-center gap-3 z-10 transition-all">
          {/* Avatar graphic */}
          <div className="relative shrink-0">
            <div className={`h-11 w-11 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${
              currentEntry?.speaker === "Ahmad" 
                ? "border-emerald-500 bg-emerald-950/80 shadow-md shadow-emerald-500/20 scale-105" 
                : "border-teal-400 bg-teal-950/80"
            }`}>
              {/* Custom SVG Avatar representation */}
              {currentEntry?.speaker === "Ahmad" ? (
                <span className="text-sm font-bold text-emerald-400 font-sans">A</span>
              ) : (
                <span className="text-sm font-bold text-teal-400 font-sans">S</span>
              )}
            </div>
            {/* Active speaker speech bubble pulse */}
            {isPlaying && (
              <span className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border border-slate-950 ${
                currentEntry?.speaker === "Ahmad" ? "bg-emerald-500 animate-ping" : "bg-teal-400 animate-ping"
              }`}></span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className={`text-xs font-bold font-sans tracking-wide uppercase ${
                currentEntry?.speaker === "Ahmad" ? "text-emerald-400" : "text-teal-300"
              }`}>
                {currentEntry?.speaker || "System"} <span className="text-[9px] text-slate-500 lowercase font-normal italic">(speaking...)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 uppercase font-mono font-bold tracking-wider">
                  {currentEntry?.action && currentEntry.action !== "none" ? currentEntry.action.replace("_", " ") : "Normal"}
                </span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-200 font-sans leading-relaxed tracking-normal font-medium max-h-16 overflow-y-auto">
              {currentEntry?.text || "Initializing classroom boards. Press play..."}
            </p>
          </div>
        </div>
      </div>

      {/* Playback Controls & Progress Timeline */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-3">
        {/* Progress Bar scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
            {Math.floor(currentElapsedSeconds / 60)}:{(currentElapsedSeconds % 60).toString().padStart(2, "0")}
          </span>
          <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 to-teal-400 transition-all ease-linear" 
              style={{ width: `${(currentElapsedSeconds / (totalDuration || 1)) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] font-mono text-slate-500 w-10 text-left">
            {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Control Button Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2.5 rounded-lg font-bold flex items-center justify-center transition-all ${
                isPlaying 
                  ? "bg-amber-600 hover:bg-amber-500 text-slate-950" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/15"
              }`}
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current ml-0.5" />}
            </button>

            {/* Restart */}
            <button
              onClick={handleReset}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Restart Segment"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Next statement */}
            <button
              onClick={skipEntry}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              title="Skip Statement"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Transcript caption status & Speed modifier */}
          <div className="flex items-center gap-3">
            {/* Speed toggler */}
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-[10px] font-mono font-bold text-slate-400">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded transition-all ${
                    playbackSpeed === speed 
                      ? "bg-slate-800 text-teal-400 shadow-inner" 
                      : "hover:text-slate-200"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
              <Volume2 className="h-4 w-4 text-emerald-400/80" />
              <span>Dolby FX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full dialogue timeline transcript (Synchronized Scrolling Container) */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 max-h-36 overflow-y-auto flex flex-col gap-2 shadow-inner">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1 flex items-center gap-1 border-b border-slate-800/60 pb-1 shrink-0">
          <BookOpen className="h-3 w-3 text-teal-400" /> Lesson Transcript
        </div>
        {dialogue.map((entry, idx) => {
          const isActive = idx === currentEntryIndex;
          return (
            <div 
              key={idx}
              onClick={() => {
                setCurrentEntryIndex(idx);
                setElapsedInEntry(0);
              }}
              className={`p-2 rounded-lg cursor-pointer transition-all border flex gap-2 text-xs leading-relaxed ${
                isActive 
                  ? "bg-slate-900/90 border-emerald-500/40 text-slate-100 shadow-sm" 
                  : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900/35 hover:text-slate-300"
              }`}
            >
              <span className={`font-bold uppercase tracking-wider shrink-0 w-16 ${
                entry.speaker === "Ahmad" ? "text-emerald-400" : "text-teal-400"
              }`}>
                {entry.speaker}:
              </span>
              <p className="flex-1">{entry.text}</p>
              <span className="text-[10px] text-slate-600 font-mono italic shrink-0">{entry.duration}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
