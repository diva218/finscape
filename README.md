# FinScape - Financial Decision Simulator

Full-stack MERN application to simulate money decisions, project future balance, assess financial stress, and compare scenarios visually.

## Stack

- Frontend: React + Vite + React Router + Tailwind CSS + Framer Motion + MUI + Recharts
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- State/Form: Zustand + React Hook Form

## Features

- JWT signup/login with protected routes and session persistence
- Dashboard with overview cards and recent simulations
- Scenario builder with real-time simulation updates
- 12-month simulation engine with warnings, risk level, and stress score
- Scenario save and comparison view (up to 3 scenarios)
- Insights page with dynamic rule-based recommendations
- Profile update page for income, expenses, risk tolerance, and theme toggle
- Toast notifications, responsive glassmorphism UI, and smooth motion transitions

## Folder Structure

```text
server/
   src/
      config/
      controllers/
         authController.js
         scenarioController.js
         simulationController.js
         userController.js
      db/
      middleware/
         auth.js
         errorHandler.js
      models/
         User.js
         Scenario.js
         Simulation.js
      routes/
         authRoutes.js
         userRoutes.js
         scenarioRoutes.js
         simulationRoutes.js
      services/
         simulationEngine.js
      utils/
         jwt.js

client/
   src/
      api/
         client.js
      components/
         AppFrame.jsx
         MetricCard.jsx
         ProtectedRoute.jsx
         ScenarioCompareChart.jsx
         SimulationChart.jsx
      context/
         AuthContext.jsx
         ToastContext.jsx
      pages/
         LandingPage.jsx
         LoginPage.jsx
         SignupPage.jsx
         DashboardPage.jsx
         ScenarioBuilderPage.jsx
         ResultsPage.jsx
         InsightsPage.jsx
         ProfilePage.jsx
         NotFoundPage.jsx
      store/
         simulationStore.js
```

## Local Setup

1. Install root dependencies:
    - `npm install`
2. Install app dependencies:
    - `npm run install:all`
3. Configure backend env:
    - Copy `server/.env.example` to `server/.env`
   - Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` (default: `gemini-2.5-flash`)
   - If MongoDB is offline, FinScape now uses an in-memory fallback for auth and scenarios, but persistence will be temporary.
4. Start both apps:
    - `npm run dev`

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `POST /api/scenario`
- `GET /api/scenario/:userId`
- `POST /api/simulate`
- `GET /api/results/:scenarioId`

## Simulation Logic

- Projects 12 months (or chosen horizon up to 12)
- Core loop:
   - `balance = balance + income - expenses - emi`
- Handles:
   - Rent/lifestyle changes
   - Job-loss toggle
   - Medical-expense toggle
   - Custom one-time/recurring events
- Returns:
   - `monthlyBalances`
   - `stressScore` (0-10)
   - `riskLevel` (`LOW`, `MEDIUM`, `HIGH`)
   - `warnings`
