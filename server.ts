import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini client successfully initialized server-side.");
} else {
  console.log("Continuing with prepackaged curriculum (GEMINI_API_KEY is not configured).");
}

// Prepackaged curriculum as robust default fallbacks
const PREPACKAGED_LESSONS: Record<string, any> = {
  "intro": {
    id: "intro",
    title: "Introduction to Forex & Pip Dynamics",
    description: "Learn how the Foreign Exchange market functions and master reading base/quote currency pairs and Calculating Pip spreads.",
    pair: "EUR/USD",
    chapters: [
      {
        id: "intro-ch1",
        title: "Forex Mechanics & Currency Pairs",
        description: "Deconstructing base vs quote currency pricing and how the spread represents broker cost.",
        dialogue: [
          {
            speaker: "Ahmad",
            text: "Welcome to Dangata FX Academy! I am Ahmad, your trading mentor. Today we are joined by Sarah. Sarah, what do you think Forex actually represents?",
            action: "reset",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "Hi Ahmad! I know it stands for Foreign Exchange, so it's about trading international currencies against each other, right?",
            action: "trend_up",
            duration: 8
          },
          {
            speaker: "Ahmad",
            text: "Spot on! Currencies always trade in pairs. For example, in the EUR/USD pair, the Euro is the 'Base' currency and the US Dollar is the 'Quote' currency.",
            action: "highlight_bullish",
            duration: 10
          },
          {
            speaker: "Sarah",
            text: "Ah, so if EUR/USD is listed at 1.1250, that means 1 Euro is worth exactly 1.1250 US Dollars?",
            action: "none",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "Precisely! And when we buy this pair, we are projecting that the Euro will strengthen against the US dollar. If it rises, you make a profit!",
            action: "trend_up",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "Interesting! But what's the tiny difference in the price between buying and selling?",
            action: "none",
            duration: 6
          },
          {
            speaker: "Ahmad",
            text: "That difference is the 'Spread'. It is the transaction cost charged by the broker. Now, let's test your understanding of currency pairs!",
            action: "reset",
            duration: 8
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
  "candles": {
    id: "candles",
    title: "Mastering Candlestick Patterns",
    description: "Learn to read price bars, recognize key bullish/bearish candle triggers, and spot momentum shifts.",
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
            duration: 10
          },
          {
            speaker: "Sarah",
            text: "I see green and red candles! The green ones are going high and fast, and the red ones are falling, correct?",
            action: "trend_up",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "Yes, exactly! A green candle is 'Bullish' which means it closed higher than its open. A red candle is 'Bearish', closing lower than its open price.",
            action: "highlight_bullish",
            duration: 11
          },
          {
            speaker: "Sarah",
            text: "What about those thin lines extending from the top and bottom of the candle's blocks?",
            action: "none",
            duration: 6
          },
          {
            speaker: "Ahmad",
            text: "Splendid question. Those are 'Wicks' or 'Shadows'. They depict the highest and lowest prices reached during that session, showing intense rejection.",
            action: "highlight_bearish",
            duration: 10
          },
          {
            speaker: "Sarah",
            text: "Oh! So if a candle has a long wick at the bottom, it means sellers pushed hard but buyers forced prices back up before closure?",
            action: "trend_up",
            duration: 9
          },
          {
            speaker: "Ahmad",
            text: "Perfect! We call that pattern a 'Hammer'. It is a powerful bullish reversal signal. Let's do a quick quiz to see if you can trade it!",
            action: "add_buy_marker",
            duration: 9
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
  "support": {
    id: "support",
    title: "Support & Resistance Breakouts",
    description: "Identify key supply and demand areas and learn to trade breakouts with precise rules.",
    pair: "USD/JPY",
    chapters: [
      {
        id: "support-ch1",
        title: "Lines in the Sand",
        description: "How to locate buying dynamic zones (Support) and selling ceilings (Resistance).",
        dialogue: [
          {
            speaker: "Ahmad",
            text: "Sarah, imagine price is like a bouncing ball. It doesn't move in a straight line. It has ceilings and floors.",
            action: "reset",
            duration: 8
          },
          {
            speaker: "Sarah",
            text: "I guess floors are where price stops falling and bounces back up, because of buyers accumulating cheap contracts?",
            action: "trend_up",
            duration: 8
          },
          {
            speaker: "Ahmad",
            text: "Exactly, that is 'Support'. Conversely, 'Resistance' acts as a ceiling where sellers saturate the market, stopping high climbs.",
            action: "draw_resistance",
            duration: 9
          },
          {
            speaker: "Sarah",
            text: "So if price hits resistance three times and drops, that resistance must be a great place to trade short positions, right?",
            action: "draw_support",
            duration: 8
          },
          {
            speaker: "Ahmad",
            text: "Very wise. But when price breaks ABOVE a strong resistance, that ceiling often becomes the new floor (Support) as high breakout buying starts!",
            action: "trend_up",
            duration: 10
          },
          {
            speaker: "Sarah",
            text: "Fascinating! Then I should wait for the retest of that break before jumping into a buy order.",
            action: "add_buy_marker",
            duration: 7
          },
          {
            speaker: "Ahmad",
            text: "That is the mark of a seasoned professional trader. Practice patience. Let's lock this down with our chapter quiz!",
            action: "reset",
            duration: 8
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
};

// API: Generate Lesson via Gemini
app.post("/api/generate-lesson", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  // If Gemini is not set up, search corresponding fallback or generate a smart simulation
  if (!ai) {
    // Return custom topic simulated structure so user can see immediate response
    const topicLower = topic.toLowerCase();
    let selectedTheme = PREPACKAGED_LESSONS.intro;
    if (topicLower.includes("candle") || topicLower.includes("pattern") || topicLower.includes("bar")) {
      selectedTheme = PREPACKAGED_LESSONS.candles;
    } else if (topicLower.includes("support") || topicLower.includes("resistance") || topicLower.includes("breakout")) {
      selectedTheme = PREPACKAGED_LESSONS.support;
    } else {
      // Build a beautiful custom simulated lesson for whatever theme they typed!
      selectedTheme = {
        id: "dynamic-sim",
        title: `Masterclass: ${topic}`,
        description: `An exclusive lesson generated on ${topic}. Learn terms, trade analysis, and complete interactive assignments.`,
        pair: "EUR/USD",
        chapters: [
          {
            id: "dynamic-ch1",
            title: `Understanding ${topic}`,
            description: `Core concepts of ${topic} and how retail and institutional speculators execute.`,
            dialogue: [
              {
                speaker: "Ahmad",
                text: `Welcome to this special masterclass! Sarah is here to explore the deep mechanics of: ${topic}. Let's discuss where we begin.`,
                action: "reset",
                duration: 9
              },
              {
                speaker: "Sarah",
                text: `I've heard about ${topic} but didn't know how to apply it to live trading charts or risk formulas!`,
                action: "trend_up",
                duration: 8
              },
              {
                speaker: "Ahmad",
                text: `No worries. At its core, this concept helps us determine when massive buyer or seller interest is in control of the trend.`,
                action: "highlight_bullish",
                duration: 10
              },
              {
                speaker: "Sarah",
                text: "So we should align our buy limits or sell stops where institutional pools are active?",
                action: "none",
                duration: 7
              },
              {
                speaker: "Ahmad",
                text: "Absolutely. That's how we secure the highest profit-to-reward ratios while maximizing protective guardrails.",
                action: "trend_up",
                duration: 9
              },
              {
                speaker: "Sarah",
                text: "Got it! Let's examine our entries and test our skills.",
                action: "add_buy_marker",
                duration: 6
              }
            ],
            quiz: [
              {
                question: `What is the primary utility of studying ${topic} in Forex markets?`,
                options: ["To guarantee 100% win rate", "To spot institutional pools and align low-risk trades", "To avoid paying spreads", "To make trade indicators unnecessary"],
                correctIndex: 1,
                explanation: `Practicing ${topic} provides structural clues to spot high-consequence buyers and sellers so you can position low-risk trades.`
              }
            ]
          }
        ]
      };
    }
    return res.json(selectedTheme);
  }

  try {
    const prompt = `
Generate a highly descriptive and structured interactive lesson script teaching the Forex topic: "${topic}".
The lesson must represent a dialogue in the "Dangata FX Academy" room between the expert trading mentor "Ahmad" and his student "Sarah".

Your response MUST be fully compliant with the JSON schema. Ensure dialogue entries are visually active by using appropriate action flags:
- "reset": clean the canvas
- "draw_support": highlight support floors
- "draw_resistance": highlight resistance ceilings
- "highlight_bullish": highlight bullish candles
- "highlight_bearish": highlight bearish price drops
- "trend_up": animate general upward curves
- "trend_down": animate downward trends
- "add_buy_marker": place a BUY visual trade tag
- "add_sell_marker": place a SELL visual trade tag

The script should have exactly 1 chapter containing a clean narrative flow, detailed Forex terminology, dialogue with logical step-by-step questions, and 2 testing quiz questions.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["id", "title", "description", "pair", "chapters"],
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "A catchy educational title" },
            description: { type: Type.STRING },
            pair: { type: Type.STRING, description: "Relevant currency pair to draw: EUR/USD, GBP/USD, USD/JPY, AUD/USD" },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "description", "dialogue", "quiz"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dialogue: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["speaker", "text", "duration"],
                      properties: {
                        speaker: { type: Type.STRING, enum: ["Ahmad", "Sarah"] },
                        text: { type: Type.STRING, description: "Spoken line in first-person" },
                        action: { type: Type.STRING, enum: ["draw_resistance", "draw_support", "highlight_bullish", "highlight_bearish", "trend_up", "trend_down", "reset", "add_buy_marker", "add_sell_marker", "none"] },
                        duration: { type: Type.INTEGER, description: "Estimated speaking duration in seconds (usually 6 to 12)" }
                      }
                    }
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["question", "options", "correctIndex", "explanation"],
                      properties: {
                        question: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        correctIndex: { type: Type.INTEGER, description: "0-based index of correct option" },
                        explanation: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini failed, returning fallback:", error);
    return res.status(500).json({ error: error.message || "Failed to generate lesson with AI" });
  }
});

// API: Quiz Feedback / Tutor Chat with Ahmad
app.post("/api/tutor-chat", async (req, res) => {
  const { history, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!ai) {
    // Fast mock chatbot if key is missing
    const reply = `I'm Ahmad, Senior Trading Mentor at Dangata FX! Currently, I am operating in offline mentoring mode since my server key is not active. But remember, standard risk control starts with setting a proper Stop Loss. A 1:2 Risk to Reward level is the absolute baseline. Ask me any general questions about Forex or try initiating a custom lesson!`;
    return res.json({ response: reply });
  }

  try {
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add immediate system instructions as background context
    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are Ahmad, the expert Forex Trading Mentor from the prestigious Dangata FX Academy (seen in the image with the conference screens). Talk in a very premium, encouraging, clear manner. Break down complex currency trading terms (e.g. leverage, support/resistance wicks, margins, currency base/quote structure) simply, adding a high-contrast human touch. Mention Sarah or other students around the table warmly when appropriate, offering practical market suggestions for EUR/USD or GBP/USD pairs."
      },
      history: chatHistory
    });

    const response = await chatInstance.sendMessage({ message: message });
    return res.json({ response: response.text });
  } catch (err: any) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Failed to communicate with Ahmad" });
  }
});

// Serve frontend build and initialize dev-server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Forex Academy] Server running on port ${PORT}`);
  });
}

startServer();
