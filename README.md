# Career Decision Simulator V3 (AI-Powered)

An advanced, full-stack financial planning tool designed to help students and professionals navigate future career paths using **Generative AI predictions** and robust economic modeling.

## 🚀 The AI Core
Unlike traditional simulators that rely on fixed data, this prototype leverages the **Google Gemini 1.5 Flash SDK** to provide:
- **Infinite Career Generation**: Type any career (e.g., "Mars Colonist" or "DeFi Architect") and the AI dynamically predicts industry-standard starting salaries, growth rates, and automation risks.
- **Resume & Skill-Gap Analysis**: Paste your resume/skills for a real-time AI evaluation of what targeted skills you need to maximize your trajectory.
- **Conversational Career Coach**: A built-in AI chatbot with full context over your simulated graph data to guide your decision-making.
- **Predictive AI Insights**: Dynamic text-based breakdowns of your 30-year outlook generated directly from the simulation math.

## 🎨 Professional Brutalist UI
The application features a **Neo-Brutalist** dashboard built with:
- **Architecture**: Sharp 4px borders, pitch-black themes, and Electric Blue accents.
- **Visuals**: Responsive Recharts with "Step" line logic for an technical, high-contrast aesthetic.
- **Experience**: Floating AI Counselor, infinite scrolling sidebar, and one-click PDF Report generation.

## 📈 The Math Engine (The Backend Logic)
Every simulation runs across a 30-year chronological loop calculating:
1. **Compounding Growth**: Base salary scaled by AI-predicted growth rates and user skill modifiers.
2. **Inflation Adjustment**: Real-time toggling between Nominal (Gross) and Real Purchasing Power (Inflation-deducted) values.
3. **Debt Repayment**: Automated 10% gross salary allocation for student loan payoff with compounding interest.
4. **Net Worth Calculation**: A true liquidity tracker factoring in cash reserves vs. remaining debt.
5. **Life Event Injections**: Dynamic volatility via one-time costs or sudden growth boosts at specific Years.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Recharts, Lucide React.
- **Backend**: Node.js, Express, Google Generative AI SDK, Dotenv.
- **Reports**: html2canvas & jsPDF.

## 📦 Setup Instructions
1.  **Environment**: Create a `.env` file in the `/backend` folder.
    ```env
    GEMINI_API_KEY=your_key_here
    ```
2.  **Installation**:
    ```bash
    # Root
    npm install
    # Frontend
    cd frontend && npm install
    # Backend
    cd ../backend && npm install
    ```
3.  **Run**:
    ```bash
    npm run dev
    ```

## 📄 Deliverables
Successfully maps to the project requirements:
- [x] **Documentation**: Current README and Code Comments.
- [x] **Working Prototype**: Full-stack MERN application.
- [x] **AI Predictions**: Dynamic Gemini SDK integration.
