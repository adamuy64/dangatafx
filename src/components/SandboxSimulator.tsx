import React, { useState, useEffect, useRef } from "react";
import { Plus, Minus, TrendingUp, TrendingDown, Clock, ShieldAlert, BadgeCheck, CheckCircle2 } from "lucide-react";
import { Trade } from "../types";

interface SandboxProps {
  demoBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
  activePair: string;
}

interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  isBullish: boolean;
}

export default function SandboxSimulator({ demoBalance, onBalanceUpdate, activePair }: SandboxProps) {
  const [selectedPair, setSelectedPair] = useState(activePair);
  const [lotSize, setLotSize] = useState(0.1);
  const [leverage, setLeverage] = useState(100);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.1240);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync state if category pair shifts in video lesson
  useEffect(() => {
    setSelectedPair(activePair);
  }, [activePair]);

  // Set initial prices and candle bars
  useEffect(() => {
    let basePrice = 1.1240;
    if (selectedPair === "GBP/USD") basePrice = 1.2830;
    if (selectedPair === "USD/JPY") basePrice = 154.20;
    if (selectedPair === "AUD/USD") basePrice = 0.6610;

    setCurrentPrice(basePrice);

    const initialCandles: CandleData[] = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const offsetMinutes = i * 2;
      const cTime = new Date(now.getTime() - offsetMinutes * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const change = (Math.random() - 0.5) * (selectedPair.includes("JPY") ? 0.4 : 0.0015);
      const openPrice = basePrice - change;
      const closePrice = basePrice + (Math.random() - 0.5) * (selectedPair.includes("JPY") ? 0.1 : 0.0005);
      const isBull = closePrice >= openPrice;
      const highPrice = Math.max(openPrice, closePrice) + Math.random() * (selectedPair.includes("JPY") ? 0.1 : 0.0003);
      const lowPrice = Math.min(openPrice, closePrice) - Math.random() * (selectedPair.includes("JPY") ? 0.1 : 0.0003);

      initialCandles.push({
        time: cTime,
        open: parseFloat(openPrice.toFixed(selectedPair.includes("JPY") ? 2 : 4)),
        close: parseFloat(closePrice.toFixed(selectedPair.includes("JPY") ? 2 : 4)),
        high: parseFloat(highPrice.toFixed(selectedPair.includes("JPY") ? 2 : 4)),
        low: parseFloat(lowPrice.toFixed(selectedPair.includes("JPY") ? 2 : 4)),
        isBullish: isBull,
      });

      basePrice = openPrice;
    }
    setCandles(initialCandles.reverse());
  }, [selectedPair]);

  // Handle ticking prices & update floating P&L on active positions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPrice((prev) => {
        const isJpy = selectedPair.includes("JPY");
        const variance = isJpy ? 0.05 : 0.0002;
        const drift = (Math.random() - 0.5) * variance;
        const nextPrice = parseFloat((prev + drift).toFixed(isJpy ? 2 : 4));

        // Update active positions floating profits immediately
        setActiveTrades((trades) =>
          trades.map((t) => {
            if (t.pair !== selectedPair) return t;
            let pipsDiff = 0;
            if (t.type === "BUY") {
              pipsDiff = (nextPrice - t.entryPrice) / (isJpy ? 0.01 : 0.0001);
            } else {
              pipsDiff = (t.entryPrice - nextPrice) / (isJpy ? 0.01 : 0.0001);
            }

            // Margin used and simple pip monetization: $10 per pip for a standard lot size (1.0)
            const pipValue = 10; 
            const calcPnl = pipsDiff * t.size * pipValue;

            return {
              ...t,
              currentPrice: nextPrice,
              pnl: parseFloat(calcPnl.toFixed(2)),
            };
          })
        );

        // Build a new cande or update the last one
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const next = [...prevCandles];
          const last = next[next.length - 1];

          // Every few cycles, add a new candle, otherwise update current candle's bounds
          const shouldCreateNew = Math.random() > 0.8;
          if (shouldCreateNew) {
            const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            const openVal = last.close;
            const closeVal = nextPrice;
            const highVal = Math.max(openVal, closeVal) + (isJpy ? 0.03 : 0.0001);
            const lowVal = Math.min(openVal, closeVal) - (isJpy ? 0.03 : 0.0001);

            next.push({
              time: nowStr,
              open: openVal,
              close: closeVal,
              high: parseFloat(highVal.toFixed(isJpy ? 2 : 4)),
              low: parseFloat(lowVal.toFixed(isJpy ? 2 : 4)),
              isBullish: closeVal >= openVal,
            });

            if (next.length > 18) next.shift(); // keep size constrained
          } else {
            // Update last candle
            const high = Math.max(last.high, nextPrice);
            const low = Math.min(last.low, nextPrice);
            next[next.length - 1] = {
              ...last,
              close: nextPrice,
              high,
              low,
              isBullish: nextPrice >= last.open,
            };
          }
          return next;
        });

        return nextPrice;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [selectedPair]);

  // Execute Trade Position
  const handlePlaceOrder = (type: "BUY" | "SELL") => {
    const isJpy = selectedPair.includes("JPY");
    const contractValue = 100000; // 1 Lot = 100k
    const entryNotional = currentPrice * lotSize * contractValue;
    const requiredMargin = entryNotional / leverage;

    if (requiredMargin > demoBalance) {
      triggerNotification("Danger: Insufficient margin available to open position!");
      return;
    }

    const newTrade: Trade = {
      id: "tr-" + Math.random().toString(36).substr(2, 6),
      pair: selectedPair,
      type,
      entryPrice: currentPrice,
      currentPrice,
      size: lotSize,
      leverage,
      pnl: 0,
      marginUsed: parseFloat(requiredMargin.toFixed(2)),
      openTime: new Date().toLocaleTimeString(),
    };

    setActiveTrades((prev) => [newTrade, ...prev]);
    onBalanceUpdate(demoBalance - requiredMargin); // deduct margin
    triggerNotification(`Success: ${type} trade of ${lotSize} Lots opened on ${selectedPair}!`);
  };

  // Close trade and pocket the P&L plus return margin
  const handleCloseTrade = (id: string) => {
    const trade = activeTrades.find((t) => t.id === id);
    if (!trade) return;

    const returnCapital = trade.marginUsed + trade.pnl;
    const nextBalance = demoBalance + returnCapital;

    setActiveTrades((prev) => prev.filter((t) => t.id !== id));
    onBalanceUpdate(nextBalance);
    setHistoryCount((prev) => prev + 1);

    const statusMsg = trade.pnl >= 0 
      ? `Profit secured! +$${trade.pnl} returned to demo vault!` 
      : `Loss processed. $${trade.pnl} deducted from assets.`;
    
    triggerNotification(statusMsg);
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl" id="sandbox-simulator">
      {/* Simulation Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-emerald-400" /> Sandboxed Practice Terminal
          </h2>
          <p className="text-[11px] text-slate-400">Apply visual rules instantly on ticking real-time candles.</p>
        </div>
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs text-slate-400">
          {["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPair(p)}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                selectedPair === p 
                  ? "bg-slate-800 text-emerald-400 font-bold shadow" 
                  : "hover:text-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Ticking Candle Display and Grid */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-56 relative flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Helper Lines watermark */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
        
        {/* Ticker values */}
        <div className="flex justify-between items-center z-10 select-none">
          <div className="bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">{selectedPair} Rate:</span>
            <span className="text-emerald-400 font-bold animate-pulse">{currentPrice}</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider flex items-center gap-1">
            <Clock className="h-3 w-3" /> Live ticks (1500ms)
          </span>
        </div>

        {/* Dynamic Canvas Bars representing candle data */}
        <div className="flex-1 w-full flex items-end justify-between gap-1 pb-2 pt-6 shrink-0 h-32">
          {candles.map((candle, idx) => {
            const maxVal = Math.max(...candles.map((c) => c.high));
            const minVal = Math.min(...candles.map((c) => c.low));
            const diff = maxVal - minVal || 1;

            // Height proportions
            const candleHeightPct = Math.max(8, ((Math.abs(candle.close - candle.open) / diff) * 100));
            const wickHeightPct = ((candle.high - candle.low) / diff) * 100;

            const bottomPct = ((Math.min(candle.open, candle.close) - minVal) / diff) * 100;
            const wickBottomPct = ((candle.low - minVal) / diff) * 100;

            return (
              <div key={idx} className="flex-grow flex flex-col items-center relative h-full group" title={`Time: ${candle.time}\nOpen: ${candle.open}\nClose: ${candle.close}`}>
                {/* Wick shadow */}
                <span 
                  className={`absolute w-[1.5px] transition-all duration-300 ${candle.isBullish ? "bg-emerald-500/50" : "bg-rose-500/50"}`} 
                  style={{ height: `${wickHeightPct}%`, bottom: `${wickBottomPct}%` }}
                ></span>
                {/* Body candle block */}
                <div 
                  className={`absolute w-full rounded-[1px] cursor-pointer transition-all duration-300 opacity-90 border hover:opacity-100 ${
                    candle.isBullish 
                      ? "bg-emerald-600/90 border-emerald-500 hover:scale-110 shadow-lg shadow-emerald-950/20" 
                      : "bg-rose-700/95 border-rose-500 hover:scale-110 shadow-lg shadow-rose-950/20"
                  }`} 
                  style={{ height: `${candleHeightPct}%`, bottom: `${bottomPct}%` }}
                ></div>
                {/* Hover time display */}
                <span className="hidden group-hover:block absolute bottom-full bg-slate-800 text-slate-100 text-[9px] px-1.5 py-0.5 rounded font-mono border border-slate-700 pointer-events-none z-30">
                  {candle.close}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom stats layout */}
        <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 z-10 mt-auto">
          <span className="text-[9px] font-mono text-slate-500 uppercase">Interactive simulation matrix</span>
          <span className="text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-mono">Spread: 1.5 Pips</span>
        </div>
      </div>

      {/* Form Order Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lot size settings */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="mb-2">
            <span className="text-xs text-slate-400 font-medium">Specify Trade Volume (Lots)</span>
            <div className="flex items-center gap-2 mt-1.5">
              <button 
                onClick={() => setLotSize((v) => Math.max(0.01, parseFloat((v - 0.05).toFixed(2))))}
                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input 
                type="number"
                value={lotSize} 
                onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                step="0.05"
                className="w-full bg-slate-900 border border-slate-800 rounded text-center text-slate-100 text-sm font-bold font-mono py-1"
              />
              <button 
                onClick={() => setLotSize((v) => parseFloat((v + 0.05).toFixed(2)))}
                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2.5 mt-1 text-[10px] font-mono">
            {[0.01, 0.1, 0.5, 1.0].map((preset) => (
              <button
                key={preset}
                onClick={() => setLotSize(preset)}
                className={`flex-1 py-1 rounded text-center border transition-all ${
                  lotSize === preset 
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800/80 font-bold" 
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {preset === 0.01 ? "Micro (0.01)" : preset === 0.1 ? "Mini (0.1)" : `${preset} Standard`}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage selections & placing triggers */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Select Leverage Level</span>
            <select 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 mt-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
            >
              <option value="30">1:30 (Moderate Conservative)</option>
              <option value="100">1:100 (Standard Speculator)</option>
              <option value="500">1:500 (Aggressive Retail)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => handlePlaceOrder("BUY")}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-slate-950 font-bold text-xs font-sans tracking-wide flex items-center justify-center gap-1 transition-all shadow-md shadow-emerald-500/10"
            >
              <TrendingUp className="h-4 w-4" /> PLACE BUY
            </button>
            <button
              onClick={() => handlePlaceOrder("SELL")}
              className="py-2 px-3 bg-rose-600 hover:bg-rose-500 rounded-lg text-slate-950 font-bold text-xs font-sans tracking-wide flex items-center justify-center gap-1 transition-all shadow-md shadow-rose-500/10"
            >
              <TrendingDown className="h-4 w-4" /> PLACE SELL
            </button>
          </div>
        </div>
      </div>

      {/* Floating alert status */}
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 animate-fade-in ${
          notification.includes("Danger") 
            ? "bg-rose-950/90 text-rose-300 border-rose-800/80" 
            : "bg-emerald-950/95 text-emerald-300 border-emerald-800/80"
        }`}>
          {notification.includes("Danger") ? <ShieldAlert className="h-4 w-4 text-rose-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          <span>{notification}</span>
        </div>
      )}

      {/* Active Positions Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2 flex justify-between items-center">
          <span>Active Book Positions ({activeTrades.length})</span>
          <span className="text-[10px] text-teal-400 font-normal normal-case">Demo sandbox accounts only</span>
        </h3>
        
        {activeTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950">
            <ShieldAlert className="h-7 w-7 text-slate-600 mb-1" />
            <p className="text-xs">No active exposures. Open a buy/sell trade to practice risk management!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-36 overflow-y-auto pr-1">
            {activeTrades.map((trade) => {
              const isProfit = trade.pnl >= 0;
              return (
                <div key={trade.id} className="bg-slate-900 border border-slate-800/80 px-3 py-2 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      trade.type === "BUY" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"
                    }`}>
                      {trade.type}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200">{trade.pair}</div>
                      <div className="text-[9px] text-slate-500">Size: {trade.size} Lots • Marg: ${trade.marginUsed}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`font-bold ${isProfit ? "text-emerald-400" : "text-rose-500"}`}>
                        {isProfit ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`}
                      </div>
                      <div className="text-[9px] text-slate-500">Entry: {trade.entryPrice}</div>
                    </div>
                    <button
                      onClick={() => handleCloseTrade(trade.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded text-[10px] uppercase border border-slate-700 transition-all hover:text-amber-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
