const { getEnv } = require("../config/env");

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

function extractTextFromResponsesApi(responseJson) {
  if (responseJson?.output_text && String(responseJson.output_text).trim()) {
    return String(responseJson.output_text).trim();
  }

  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && part?.text) {
        return String(part.text).trim();
      }
    }
  }

  return "";
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
    const { openaiApiKey, openaiModel } = getEnv();

    if (!openaiApiKey) {
      return res.status(500).json({ message: "OPENAI_API_KEY is not configured on the server" });
    }

    const { profile, events, simulation, question } = req.body || {};

    if (!simulation || !Array.isArray(simulation.monthlyBalances)) {
      return res.status(400).json({ message: "simulation.monthlyBalances is required" });
    }

    const prompt = buildAnalysisPrompt({ profile, events, simulation, question });

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: openaiModel,
        temperature: 0.3,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "You are a practical financial advisor. Do not invent numbers. Base every point on the provided data."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const payload = await openaiResponse.json().catch(() => ({}));

    if (!openaiResponse.ok) {
      const message = payload?.error?.message || "OpenAI request failed";
      return res.status(502).json({ message });
    }

    const analysis = extractTextFromResponsesApi(payload);

    if (!analysis) {
      return res.status(502).json({ message: "OpenAI returned an empty response" });
    }

    const structured = parseAnalysisSections(analysis);

    return res.json({
      analysis,
      explanation: structured.explanation,
      risks: structured.risks,
      suggestions: structured.suggestions
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeScenario };
