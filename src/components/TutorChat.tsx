import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

interface TutorChatProps {
  pair: string;
  onTutorRequest: (msg: string) => void;
}

export default function TutorChat({ pair, onTutorRequest }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am Ahmad, your Senior Forex Mentor. I'm here to help you dissect technical indicators, master risk control limits, or clarify segments from our video classes. What trading concepts are we exploring today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.slice(-8), // send last 8 messages for context
          message: textToSend,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || "Communication failure");
      }
    } catch (err: any) {
      // Fallback response with beautiful markdown tips
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I am currently operating in high-consequence offline mode. Let's make sure you hold these strict rules close to your chest:
1. **Never trade without a Stop Loss**: Protecting your account balance matches the value of winning trades.
2. **Pip Calculus**: On pairs like EUR/USD, the 4th decimal place is 1 Pip. Shift of 1.1240 ➔ 1.1241.
3. **Margins & Leverage**: Leverage amplifies purchasing power. High leverage (e.g. 1:500) allows you to control larger contract units but multiplies floating exposures.
Would you like to load an interactive class session using the custom topics bar above?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    "Explain what is a Pip Spread?",
    "Show me a Leverage calculation.",
    "What does a Bullish Hammer wick represent?",
    `Best strategy to trade ${pair}?`,
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-xl" id="tutor-chat">
      {/* Header Info */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1">
              Mentor Ahmad <span className="text-[10px] text-slate-500 font-mono font-normal">Class Assistant</span>
            </h3>
            <p className="text-[11px] text-slate-400">Ask any technical details or math patterns</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setMessages([
              {
                role: "assistant",
                content: "Hello! I am Ahmad, your Senior Forex Mentor. I'm here to help you dissect technical indicators, master risk control limits, or clarify segments from our video classes. What trading concepts are we exploring today?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="p-1 px-2 text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 rounded bg-slate-900 hover:bg-slate-800"
        >
          <RefreshCw className="h-3 w-3" /> Reset Chat
        </button>
      </div>

      {/* Messages Scrolling Arena */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 scrollbar-none bg-slate-900/60 shadow-inner">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start animate-fade-in"}`}>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                isUser 
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-600 text-slate-950 font-medium rounded-tr-none shadow" 
                  : "bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800/85 shadow-md"
              }`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                {isUser ? "You" : "Ahmad"} at {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="mr-auto items-start max-w-[85%] flex flex-col">
            <div className="bg-slate-950 text-slate-400 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce delay-100"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce delay-200"></span>
            </div>
            <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">Ahmad is analyzing...</span>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Quick click chips */}
      <div className="px-4 py-2 border-t border-slate-800/50 flex flex-wrap gap-1.5 shrink-0 bg-slate-900/40">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Ahmad (e.g. 'explain leverage formulas')..."
          className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
        />
        <button
          type="submit"
          className="p-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold flex items-center justify-center transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
