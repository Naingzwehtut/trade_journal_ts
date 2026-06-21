import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API Client lazily or gracefully
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI client:", e);
}

// REST Backend Route for AI trade analysis
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { trades, lang } = req.body;
    
    if (!trades || !Array.isArray(trades)) {
      return res.status(400).json({ error: "No trades catalog found or trade list is not valid." });
    }

    if (trades.length === 0) {
      return res.json({
        analysis: "### Journal Analysis Empty\nRecord your first few trades to receive structured risk management and emotional performance feedback from your AI coach."
      });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel."
      });
    }

    const tradeSummary = trades.map((t, idx) => ({
      index: idx + 1,
      symbol: t.symbol,
      date: t.date,
      direction: t.direction,
      entry: t.entryPrice,
      exit: t.exitPrice,
      quantity: t.quantity,
      setup: t.setup,
      loss_gain: t.profitLoss,
      outcome: t.status,
      mindset: t.mindset ? t.mindset.join(", ") : "None",
      notes: t.notes || "",
    }));

    const languageInstruction = lang === 'my' 
      ? "\nIMPORTANT: Write your entire analysis in Burmese (မြန်မာဘာသာ). Ensure you use clear, professional, readable Burmese trading terminology for concepts like BOS, CHoCH, Order Block, FVG, Liquidity Grab, and S&R, but write the structured headers and text in Burmese." 
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an elite Prop Firm Risk Manager and trading psychologist who specializes in Smart Money Concepts (SMC), Inner Circle Trader (ICT) methodology, and Support & Resistance (S&R) framework. Generate a concise, highly professional trading analysis based on the following trading logs:

${JSON.stringify(tradeSummary, null, 2)}

The trader specifically uses and understands ICT, SMC, and SNR approaches. Tailor your terminology to match (use concepts like Fair Value Gaps (FVG), Order Blocks (OB), Liquidity Sweeps, BOS (Break of Structure), CHoCH (Change of Character), Premium/Discount Zones, and Key S&R Levels).
${languageInstruction}

Provide your response in structured Markdown with these exact headings:
1. **Performance Summary**: Briefly summarize key patterns spotted (e.g., winning set-ups, core metrics, symbols).
2. **ICT/SMC/SNR Strategy Efficiency**: Evaluate which methods (SMC, ICT, or SNR) are performing best or worst, highlighting how they handled key structural points like FVGs, Order Blocks, or S&R levels.
3. **Psychology & Cognitive Traps**: Call out triggers from the mindset tags (such as FOMO, Revenge Trading, Impulsiveness) that directly impacted trade execution quality, fear of missing entries, or early exits.
4. **Actionable Improvement Plan**: Give exactly 3 sharp, highly practical rules for this trader to implement next week, incorporating proper ICT/SMC/SNR risk management (e.g., risk-to-reward ratio, structural validation, session-specific setups).`,
    });

    const markdownText = response.text || "No insights generated.";

    return res.json({ analysis: markdownText });
  } catch (error: any) {
    console.error("Gemini analysis server error:", error);
    return res.status(500).json({ error: error.message || "Something went wrong during trade analysis." });
  }
});

// Configure Vite middleware in development or serve static assets in production
async function setupServer() {
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
    console.log(`Server executing successfully on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
