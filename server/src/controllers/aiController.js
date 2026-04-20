const { getEnv } = require("../config/env");

function buildLocalFallbackAnalysis({ profile = {}, events = [], simulation = {}, question = "" }) {
  const income = Number(profile?.income) || 0;
  const expenses = Number(profile?.expenses) || 0;
  const monthlyBalances = Array.isArray(simulation?.monthlyBalances) ? simulation.monthlyBalances : [];
  const finalBalance = Number(simulation?.finalBalance) || (monthlyBalances.length ? Number(monthlyBalances[monthlyBalances.length - 1]) : 0);
  const stressScore = Number(simulation?.stressScore) || 0;
  const riskLevel = simulation?.riskLevel || "UNKNOWN";
  const savingsRate = income > 0 ? (((income - expenses) / income) * 100) : 0;
  const negativeMonth = monthlyBalances.findIndex((value) => Number(value) < 0);

  const explanationParts = [
    `This scenario projects a final balance of ${Number(finalBalance).toFixed(2)} with risk level ${riskLevel} and stress score ${Number(stressScore).toFixed(1)}/10.`,
    income > 0
      ? `Estimated savings rate based on provided profile is ${Number(savingsRate).toFixed(1)}%.`
      : "Income value is not provided, so savings-rate confidence is limited.",
    question ? `You asked: "${String(question).trim()}".` : ""
  ].filter(Boolean);

  const risks = [];
  if (negativeMonth !== -1) {
    risks.push(`Balance drops below zero in month ${negativeMonth + 1}.`);
  }
  if (stressScore >= 7) {
    risks.push("Expense pressure is high relative to income.");
  }
  if (savingsRate < 10) {
    risks.push("Savings rate is below the 10% safety threshold.");
  }
  if (!risks.length) {
    risks.push("No severe risk trigger detected in current inputs.");
  }

  const suggestions = [];
  if (expenses > income && income > 0) {
    suggestions.push("Reduce discretionary and fixed outflows to bring expenses below income.");
  }
  if (stressScore >= 7) {
    suggestions.push("Lower EMI or defer non-essential spend to reduce stress score.");
  }
  if (Array.isArray(events) && events.length) {
    suggestions.push("Spread large negative events across months to reduce cashflow shocks.");
  }
  suggestions.push("Run an alternate scenario with +10% income or -10% expenses for comparison.");

  return {
    analysis: `Scenario Summary\n${explanationParts.join(" ")}\n\nRisks\n${risks.map((item) => `- ${item}`).join("\n")}\n\nSuggestions\n${suggestions.map((item) => `- ${item}`).join("\n")}`,
    explanation: explanationParts.join(" "),
    risks,
    suggestions
  };
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

    const { profile, events, simulation, question } = req.body || {};

    if (!simulation || !Array.isArray(simulation.monthlyBalances)) {
      return res.status(400).json({ message: "simulation.monthlyBalances is required" });
    }

    if (!openaiApiKey) {
      return res.json({
        ...buildLocalFallbackAnalysis({ profile, events, simulation, question }),
        source: "local-fallback"
      });
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
      return res.json({
        ...buildLocalFallbackAnalysis({ profile, events, simulation, question }),
        source: "local-fallback",
        providerError: payload?.error?.message || "OpenAI request failed"
      });
    }

    const analysis = extractTextFromResponsesApi(payload);

    if (!analysis) {
      return res.json({
        ...buildLocalFallbackAnalysis({ profile, events, simulation, question }),
        source: "local-fallback",
        providerError: "OpenAI returned an empty response"
      });
    }

    const structured = parseAnalysisSections(analysis);

    return res.json({
      analysis,
      explanation: structured.explanation,
      risks: structured.risks,
      suggestions: structured.suggestions,
      source: "openai"
    });
  } catch (error) {
    try {
      const { profile, events, simulation, question } = req.body || {};
      if (simulation && Array.isArray(simulation.monthlyBalances)) {
        return res.json({
          ...buildLocalFallbackAnalysis({ profile, events, simulation, question }),
          source: "local-fallback",
          providerError: error.message
        });
      }
    } catch (_fallbackError) {
      // Ignore fallback failure and pass original error to handler.
    }
    next(error);
  }
}

module.exports = { analyzeScenario };
