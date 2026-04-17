# ⚡ S. T. A. K.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **A brutalist, AI-powered career simulator that tells you the truth about your financial future.**

**S. T. A. K.** *(Simulate. Track. Analyze. Know.)* is a full-stack web application with 8 data-driven tools that combine compounding math, multi-dimensional scoring, and Google Gemini AI to simulate, diagnose, and optimize your career and financial trajectory.

---

## ✨ Features

### 1. ▶ Career Simulator
Simulate any career path - real or imagined - across 30 years of compounding economics.

- Type **any job title** and Gemini AI predicts starting salary, growth rate, and automation risk
- Configurable **economic scenarios**: Normal, Bull Market, Recession, AI Disruption
- **Student debt repayment** model with interest compounding
- **Learning investment toggle** - see how skipping upskilling costs you `-0.3%/yr growth`
- **Compare two careers** side-by-side on the same chart
- Location tier modifier (Tier 1/2/3 city salary adjustments)
- AI Coach chatbot with full context over your simulation data
- Resume Matcher - paste your skills for a compatibility score

---

### 2. ⚡ AI Pivot Engine
Get AI-generated career transition plans with zero fluff.

- Input your background and goals in plain English
- AI returns a **compatibility score** (%), **skill gap list**, and a **month-by-month transition roadmap**
- Identifies which skills to learn in what order and why
- Pulls from real market demand signals

---

### 3. 💀 Life Regret Calculator
Quantify the true cost of staying where you are.

- Enter your current role, dream role, salary gap, and years of hesitation
- Calculates **total lost lifetime earnings** with compounding
- Shows the **retirement corpus gap** - how much smaller your nest egg will be at 60
- Dramatic "death clock" countdown - career hours burned in your current role
- AI-generated regret narrative: what your life looks like in each path

---

### 4. ⏰ Time Machine
See the ghost of your future career - the path you didn't take.

- Models two parallel wealth-accumulation paths (current vs. dream) over 10 years
- Animated `ComposedChart` shows where the two paths diverge
- Highlights the **exact year of divergence** and the wealth gap at that point
- Annual salary premium from switching, compounded over time
- AI-generated "alternate universe" narrative

---

### 5. 🎯 Skill Gap Assassin
Find the exact skills between you and your next salary jump.

- Input your current role, target role, and existing skills
- Returns a **radar chart** of your skills DNA vs. target role requirements
- Priority-coded skill cards: Critical / Important / Nice-to-Have
- Each skill includes **salary premium unlocked** (e.g., "+₹13.5L/yr")
- Free learning resources linked per skill
- AI-generated **90-day battle plan** with typewriter animation

---

### 6. 🔥 Burnout Index
Calculate exactly how many days until you break down.

- 8 inputs: hours/week, commute, vacation frequency, work-life balance, meaningfulness, manager quality, job satisfaction, remote work
- Multi-dimensional scoring: **Physical / Motivational / Relational / Emotional**
- Animated SVG ring gauge (0–100 burnout score)
- Massive "**X days until breakdown**" counter
- Dynamic recovery action list - only shows interventions relevant to your highest-scoring dimensions
- AI-generated burnout narrative with ONE specific action to take this week

---

### 7. 💰 FIRE Calculator
Know exactly when - and how - you never have to work again.

- 5 sliders: current salary, monthly expenses, current portfolio, dream salary, expected returns
- Live **savings rate badge** updates as you move sliders (🟢 Strong / 🟡 Moderate / 🔴 Too low)
- **Animated SVG ring gauge** - FIRE Readiness Score (0–100%)
- Giant animated FIRE corpus number (₹X.XXCr) with gold glow
- **SIP needed** - exact monthly investment required to hit FIRE in N years
- Dual-path wealth accumulation chart: current vs. dream career with FIRE reference line
- Dramatic "**X years saved**" banner: `X fewer Mondays, X months of waking up free`
- AI-generated FIRE insight: frames the year difference as lived human experience

---

### 8. 🩺 Career Health Check
Get a brutally honest grade on the health of your career across 5 dimensions.

- 10-question diagnostic quiz (2 questions per dimension)
- 5 scored dimensions: **Financial Health · Growth Trajectory · Job Security · Purpose Alignment · Market Position**
- 1–5 interactive rating buttons - live preview score updates as you answer
- **Giant letter grade** (A/B/C/D/F) with dimension-matched color glow
- Pentagon **RadarChart** showing all 5 dimensions at once
- Mini-card per dimension - tags your Weakest and Strongest
- AI-generated 3-sentence diagnostic report
- Dynamic **30-day prescription** - only shows actions relevant to your lowest-scoring dimensions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), Vanilla CSS (Brutalist design system), Recharts, Lucide React |
| **Backend** | Node.js, Express.js |
| **AI** | Google Gemini 1.5 Flash (via `@google/generative-ai` SDK) |
| **Charts** | Recharts - ComposedChart, RadarChart, AreaChart, ReferenceLine |
| **Animations** | Custom `useCountUp`, `useTypewriter`, SVG ring gauge hooks |
| **Env** | dotenvx |

---

## 📁 Project Structure

```
stak-1/
├── backend/
│   ├── controllers/
│   │   ├── careerController.js        # Simulate, pivot, resume, chat
│   │   ├── regretController.js        # Regret calculator
│   │   ├── timeMachineController.js   # Parallel path projections
│   │   ├── skillGapController.js      # Skill gap analysis
│   │   ├── burnoutController.js       # Burnout scoring engine
│   │   ├── fireController.js          # FIRE + SIP calculations
│   │   └── careerHealthController.js  # 5-dimension career health
│   ├── routes/
│   │   └── careerRoutes.js            # All 11 API endpoints
│   ├── utils/
│   │   └── aiService.js               # Gemini AI prompts & fallbacks
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SidebarForm.jsx
│       │   ├── SimulationResults.jsx
│       │   ├── PivotEngine.jsx
│       │   ├── RegretCalculator.jsx
│       │   ├── TimeMachine.jsx
│       │   ├── SkillGap.jsx
│       │   ├── BurnoutIndex.jsx
│       │   ├── FireCalculator.jsx
│       │   └── CareerHealth.jsx
│       ├── App.jsx                    # 8-tab navigation
│       └── index.css                  # Brutalist design system tokens
└── README.md
```

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key (free)

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run

```bash
# Terminal 1 - Backend (port 5000)
cd backend && node server.js

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Endpoints

| Method | Endpoint | Feature |
|---|---|---|
| `GET` | `/api/careers` | Fetch mock career database |
| `POST` | `/api/simulate` | 30-year career simulation |
| `POST` | `/api/analyze-resume` | Resume ↔ career compatibility |
| `POST` | `/api/chat` | AI career coach chat |
| `POST` | `/api/pivot` | AI career pivot plan |
| `POST` | `/api/regret` | Regret cost calculation |
| `POST` | `/api/time-machine` | Parallel path projection |
| `POST` | `/api/skill-gap` | Skill gap analysis |
| `POST` | `/api/burnout` | Burnout runway calculation |
| `POST` | `/api/fire` | FIRE number + SIP calculation |
| `POST` | `/api/career-health` | 5-dimension health diagnosis |

---

## 🎨 Design System

The app uses a **Neo-Brutalist** design system defined in `index.css`:

- **Black** background (`#0a0a0a`) with sharp 4px solid borders
- **Electric Green** (`#0BF46C`) - primary accent, success states
- **Gold** (`#FFD700`) - FIRE calculator, financial data
- **Danger Red** (`#FF0000`) - burnout, regret, critical warnings
- **Purple** (`#8B5CF6`) - dream career paths, aspirational data
- Sharp corners, no border-radius, monospace typography throughout
- All features include animated skeleton loading screens with "cooking" copy

---

## 🤖 AI Behaviour

Every AI call has a **hardcoded offline fallback** - if the Gemini API is unavailable or the key is missing, the app returns a pre-written narrative based on the calculated numbers. No feature breaks without an API key; they just lose the personalized narrative layer.

Gemini is used for:
- Career salary/growth/risk prediction (`/simulate`, `/pivot`)
- Skill gap structured JSON analysis (`/skill-gap`)
- Burnout, FIRE, regret, and health narrative generation
- Conversational career coaching (`/chat`)

Made with ❤️ by S.T.A.K. Team
