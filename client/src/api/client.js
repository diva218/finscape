async function request(path, options = {}, token) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}

export function signup(data) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function login(data) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function getProfile(token) {
  return request("/api/user/profile", { method: "GET" }, token);
}

export function updateProfile(data, token) {
  return request(
    "/api/user/profile",
    {
      method: "PUT",
      body: JSON.stringify(data)
    },
    token
  );
}

export function createScenario(data, token) {
  return request(
    "/api/scenario",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function getScenariosByUser(token) {
  return request("/api/scenario", { method: "GET" }, token);
}

export function updateScenarioById(scenarioId, data, token) {
  return request(
    `/api/scenario/${scenarioId}`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    },
    token
  );
}

export function deleteScenarioById(scenarioId, token) {
  return request(`/api/scenario/${scenarioId}`, { method: "DELETE" }, token);
}

export function runSimulation(data, token) {
  return request(
    "/api/simulate",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function compareScenarios(data, token) {
  return request(
    "/api/compare",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function compareAllScenarios(data, token) {
  return request(
    "/api/compare/all",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function getResultsByScenarioId(scenarioId, token) {
  return request(`/api/results/${scenarioId}`, { method: "GET" }, token);
}

export function submitPersonalityQuiz(data, token) {
  return request(
    "/api/personality/quiz",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function getPersonality(userId, token) {
  return request(`/api/personality/${userId}`, { method: "GET" }, token);
}

export function getScenarioInsights(scenarioId, token) {
  return request(`/api/insights/${scenarioId}`, { method: "GET" }, token);
}

export function getInlineInsights(data, token) {
  return request(
    "/api/insights",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}

export function getRecommendations(token) {
  return request("/api/recommendations", { method: "GET" }, token);
}

export function analyzeScenarioWithAi(data, token) {
  return request(
    "/api/ai/analyze",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );
}
