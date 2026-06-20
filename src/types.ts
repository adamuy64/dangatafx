export interface DialogueEntry {
  speaker: 'Ahmad' | 'Sarah';
  text: string;
  action?: 'draw_resistance' | 'draw_support' | 'highlight_bullish' | 'highlight_bearish' | 'trend_up' | 'trend_down' | 'reset' | 'add_buy_marker' | 'add_sell_marker' | 'none';
  duration: number; // in seconds
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  dialogue: DialogueEntry[];
  quiz: QuizQuestion[];
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  pair: string;
  chapters: Chapter[];
}

export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  size: number; // lots
  leverage: number;
  pnl: number;
  marginUsed: number;
  openTime: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
