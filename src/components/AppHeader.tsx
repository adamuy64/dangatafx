import React, { useEffect, useState } from "react";
import { TrendingUp, Award, DollarSign, BookOpen, GraduationCap } from "lucide-react";

interface AppHeaderProps {
  demoBalance: number;
  badges: string[];
  currentPairPrice: number;
  pair: string;
}

export default function AppHeader({ demoBalance, badges, currentPairPrice, pair }: AppHeaderProps) {
  const [rates, setRates] = useState<Record<string, number>>({
    "EUR/USD": 1.1245,
    "GBP/USD": 1.2832,
    "USD/JPY": 154.22,
    "AUD/USD": 0.6612,
  });

  // Tipping and ticking simulation for forex rates
  useEffect(() => {
    const timer = setInterval(() => {
      setRates((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          const delta = (Math.random() - 0.5) * (k.includes("JPY") ? 0.08 : 0.0003);
          next[k] = parseFloat((next[k] + delta).toFixed(k.includes("JPY") ? 2 : 4));
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-3 shrink-0" id="app-header">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-widest text-emerald-400 uppercase">Interactive Studio</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-slate-100">
              DANGATA FX <span className="font-light text-slate-400">Academy</span>
            </h1>
          </div>
        </div>

        {/* Real-time Tickers */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          {Object.entries(rates).map(([p, rate]) => (
            <div key={p} className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 font-medium">{p}</span>
              <span className={`font-semibold ${p === pair ? "text-emerald-400" : "text-amber-400"}`}>
                {rate}
              </span>
              <TrendingUp className="h-3 w-3 text-slate-500" />
            </div>
          ))}
        </div>

        {/* User Stats */}
        <div className="flex items-center gap-4">
          {/* Demo Balance */}
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-inner">
            <div className="h-2 w-2 rounded-full bg-teal-400"></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Trading Capital</div>
              <div className="text-sm font-bold text-slate-100 flex items-center">
                <DollarSign className="h-3.5 w-3.5 text-teal-400 mr-0.5" />
                {demoBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Achievements badge count */}
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-800">
            <Award className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Academy Badges</div>
              <div className="text-sm font-bold text-slate-200">
                {badges.length ? `${badges.length} Unlocked` : "0 Academics"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
