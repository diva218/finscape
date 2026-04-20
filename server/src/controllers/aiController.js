const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getEnv } = require("../config/env");

let cachedAi = null;

function getAiRuntime() {
  if (cachedAi) {
    return cachedAi;
  }

  const { geminiApiKey } = getEnv();
  if (!geminiApiKey) {
    const error = new Error("GEMINI_API_KEY is not configured");
    error.status = 500;
    throw error;
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const model = genAI.getGenerativeModel({ model: modelName });

  console.log(`AI initialized with model: ${modelName}`);
  cachedAi = { model, modelName };
  return cachedAi;
}

function buildAnalysisPrompt({ profile = {}, events = [], simulation = {}, question = "" }) {
  const payload = {
    profile: {
      income: Number(profile.income) || 0,
      expenses: Number(profile.expenses) || 0
    },
    events: Array.isArray(events)
      ? events.map((event) => ({
          name: String(event?.name || "Unnamed event"),
          amount: Number(event?.amount) || 0,
          month: Number(event?.month) || 1
        }))
      : [],
    simulation: {
      monthlyBalances: Array.isArray(simulation.monthlyBalances) ? simulation.monthlyBalances : [],
      finalBalance: Number(simulation.finalBalance || 0),
      stressScore: Number(simulation.stressScore || 0),
      riskLevel: simulation.riskLevel || "UNKNOWN"
    },
    question: question ? String(question) : "Explain my scenario, identify risks, and give suggestions."
  };

  return `You are FinScape's AI Financial Advisor.\nAnalyze ONLY the provided data.\nTasks:\n1) Explain the scenario clearly\n2) Identify key financial risks\n3) Give practical suggestions\n\nRespond in concise plain text with these headings:\n- Scenario Summary\n- Risks\n- Suggestions\n\nDATA:\n${JSON.stringify(payload, null, 2)}`;
}

function parseAnalysisSections(analysis) {
  const text = String(analysis || "").trim();
  if (!text) {
    return {
      explanation: "",
      risks: [],
      suggestions: []
    };
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const sections = { summary: [], risks: [], suggestions: [] };
  let active = "summary";

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("scenario summary")) {
      active = "summary";
      continue;
    }
    if (lower === "risks" || lower.startsWith("risks")) {
      active = "risks";
      continue;
    }
    if (lower === "suggestions" || lower.startsWith("suggestions")) {
      active = "suggestions";
      continue;
    }

    sections[active].push(line.replace(/^[-*]\s*/, ""));
  }

  return {
    explanation: sections.summary.join(" ") || text,
    risks: sections.risks,
    suggestions: sections.suggestions
  };
}

async function analyzeScenario(req, res, next) {
  try {
    const { model, modelName } = getAiRuntime();

    const { profile, events, simulation, question } = req.body || {};

    if (!simulation || !Array.isArray(simulation.monthlyBalances)) {
      return res.status(400).json({ message: "simulation.monthlyBalances is required" });
    }

    const prompt = buildAnalysisPrompt({ profile, events, simulation, question });
    let analysis = "";
    try {
      const result = await model.generateContent(prompt);
      analysis = String(result?.response?.text?.() || "").trim();
    } catch (providerError) {
      return res.status(502).json({
        message: providerError?.message || "Gemini request failed",
        providerError: {
          name: providerError?.name || null,
          status: providerError?.status || null,
          details: providerError?.details || null
        }
      });
    }

    if (!analysis) {
      return res.status(502).json({ message: "Gemini returned an empty response" });
    }

    const structured = parseAnalysisSections(analysis);

    return res.json({
      analysis,
      explanation: structured.explanation,
      risks: structured.risks,
      suggestions: structured.suggestions,
      source: "gemini",
      model: modelName
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeScenario };
