# TradeJournal: A Bull Put Spread Tracker

TradeJournal is a modern, intuitive web application designed to help options traders meticulously track their bull put spread trades. It enforces a disciplined trading process through built-in checklists and provides clear performance analytics to help you understand and improve your trading strategy.

This application is built to be run locally, using Firebase's Firestore as a secure backend to store all your trade data persistently.

## Key Features

* **Performance Overview:** A comprehensive dashboard that visualizes your trading performance. View your total P/L, win rate, and a breakdown of winning vs. losing trades, all filterable by month.
* **Disciplined Trade Entry:** A dedicated form for entering new trades that requires you to complete mandatory Macro/Underlying and Entry Rule checklists before a trade can be logged. This enforces your trading plan on every setup.
* **Ongoing Trade Tracking:** See all your open positions at a glance. The app automatically calculates and displays the Days to Expiration (DTE) for each trade, highlighting those that enter the critical "gamma risk" window (21 DTE or less).
* **Simple Exit Management:** An easy-to-use interface for closing out trades. Select an ongoing position, specify the outcome (profit or loss), and record the final P/L. The trade is then moved to your historical log for performance analysis.
* **Persistent Data:** All trade data is securely stored in your personal Firebase Firestore database, ensuring your journal is always up-to-date every time you open the app.

## Tech Stack

* **Frontend:** React, Vite
* **Styling:** Tailwind CSS
* **Charts & Visualization:** Recharts
* **Icons:** Lucide React
* **Backend & Database:** Firebase (Authentication, Firestore)

## Application Views

The TradeJournal app is organized into five main views, each serving a specific purpose in the trading workflow:

### 1. Overview
The main dashboard that provides a comprehensive analysis of your trading performance:
- **Monthly Performance Filter:** View data for any specific month using the dropdown selector
- **Key Metrics:** Displays total P/L, win rate percentage, and number of closed trades
- **Visual Analytics:** Interactive pie chart showing the ratio of profitable vs. losing trades
- **Trade History Table:** Complete list of all closed trades for the selected month, including ticker, exit date, outcome, and final P/L
- **Smart Data Display:** Automatically filters out ongoing trades to show only completed positions

### 2. New Trade
A disciplined trade entry form that enforces proper analysis before logging any position:
- **Trade Specifications:** Input fields for ticker, entry/expiration dates, strike prices, net credit received, and number of contracts
- **Real-time Calculations:** Automatically computes and displays Max Profit, Max Loss, and Breakeven point as you enter trade details
- **Mandatory Checklists:** Two comprehensive checklists that must be completed before trade submission:
  - **Macro & Underlying Checklist:** Verifies liquidity, earnings schedule, IV percentile, and economic events
  - **Trade Entry Rules Checklist:** Confirms proper DTE, technical analysis, strike selection, and risk tolerance
- **Form Validation:** Submit button remains disabled until all fields are filled and all checklist items are confirmed

### 3. Ongoing Trades
A visual dashboard for monitoring all open positions:
- **Trade Cards:** Each ongoing trade is displayed as an individual card showing ticker, strike prices, breakeven, max profit/loss
- **DTE Tracking:** Prominently displays Days to Expiration with automatic gamma risk warnings (highlighted in yellow when ≤21 DTE)
- **Key Details:** Shows entry date, expiration date, and all critical trade metrics at a glance
- **Risk Management:** Visual alerts help identify trades approaching the dangerous gamma risk zone

### 4. Exit a Trade
A streamlined interface for closing positions and recording outcomes:
- **Trade Selection:** Dropdown menu listing all ongoing trades with full details (ticker, strikes, expiration)
- **Outcome Classification:** Simple buttons to categorize the trade result as either "Profit" or "Loss"
- **P/L Recording:** Input field for final profit/loss amount (pre-filled with 50% of max profit as a default target)
- **Exit Date:** Date picker for recording when the position was closed
- **Data Transfer:** Once submitted, the trade moves from "Ongoing" to historical data for performance tracking

### 5. Delete a Trade
A careful interface for permanently removing trades from the system:
- **Trade Selection:** Dropdown showing all trades (ongoing and closed) sorted by entry date
- **Trade Preview:** Displays selected trade details including ticker, strikes, entry date, and current status
- **Safety Confirmation:** Requires explicit confirmation via browser alert before deletion
- **Permanent Action:** Once confirmed, the trade is completely removed from the database with no recovery option

Each view is designed with a specific purpose in the trading lifecycle, from careful analysis and entry, through monitoring and management, to final exit and record-keeping. The app enforces discipline at every step while providing the flexibility to manage positions effectively.

---

## Local Development Setup

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

Ensure you have the following installed:
* [Node.js and npm](https://nodejs.org/)
* [Git](https://git-scm.com/)

### 2. Set Up Firebase

You need a free Firebase project to act as your backend.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  From the project dashboard, create a **Firestore Database**. Start it in **Production mode**.
3.  In the **Authentication** section, go to the "Sign-in method" tab and **enable** the **Anonymous** provider.
4.  Go to your **Project settings** (gear icon) and in the "Your apps" section, create a new **Web app** (`</>`).
5.  Copy the `firebaseConfig` object that is generated. You will need this in a moment.

### 3. Clone and Install

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd bull-put-journal
    ```

2.  **Install dependencies:**
    This project uses specific versions of Tailwind CSS and its dependencies to ensure compatibility.
    ```bash
    npm install recharts lucide-react firebase tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
    ```

### 4. Configure Environment

1.  In the `src/` directory, create a new file named `firebase.js`.
2.  Paste the following code into `firebase.js`, replacing the placeholder with the `firebaseConfig` object you copied from your Firebase project:

    ```javascript
    import { initializeApp } from "firebase/app";
    import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';

    // PASTE YOUR FIREBASE CONFIG OBJECT HERE
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "..."
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const appId = firebaseConfig.appId;

    export { db, auth, appId, signInAnonymously, onAuthStateChanged, signInWithCustomToken };
    ```

### 5. Run the Application

You're all set! Start the local development server by running:

```bash
npm run dev