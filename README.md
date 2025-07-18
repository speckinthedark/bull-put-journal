# TradeJournal: A Bull Put Spread Tracker

TradeJournal is a modern, intuitive web application designed to help options traders meticulously track their bull put spread trades. It enforces a disciplined trading process through built-in checklists and provides clear performance analytics to help you understand and improve your trading strategy.

This application is built to be run locally, using Firebase's Firestore as a secure backend to store all your trade data persistently. The codebase has been completely refactored following React best practices for maintainability and scalability.

## Key Features

* **Performance Overview:** A comprehensive dashboard that visualizes your trading performance. View your total P/L, win rate, and a breakdown of winning vs. losing trades, all filterable by month.
* **Disciplined Trade Entry:** A dedicated form for entering new trades that requires you to complete mandatory Macro/Underlying and Entry Rule checklists before a trade can be logged. This enforces your trading plan on every setup.
* **Ongoing Trade Tracking:** See all your open positions at a glance with visual DTE (Days to Expiration) circular progress indicators. The app automatically highlights trades entering the critical "gamma risk" window (21 DTE or less).
* **Enhanced Exit Management:** Modern modal-based interface for closing out trades with intelligent P/L sign handling and exit confirmations directly from trade cards.
* **Real-time Price Integration:** Alpha Vantage API integration for enhanced market data (with 25 requests/day limit).
* **Advanced Analytics:** Strike price tracking in closed trades table and DTE-based sorting for ongoing trades.
* **Template System:** Built-in trade template service for quick trade setup based on common strategies.
* **Persistent Data:** All trade data is securely stored in your personal Firebase Firestore database, ensuring your journal is always up-to-date every time you open the app.

## Architecture & Code Quality

This application has been architected following React best practices:

### 🏗️ **Modular Component Structure**
- **UI Components**: Reusable, self-contained components (`Sidebar`, `StatCard`, `DTECircularProgress`, `TradeCard`, `InputField`)
- **View Components**: Page-level components that orchestrate UI elements (`OverviewView`, `OngoingTradesView`)
- **Custom Hooks**: Dedicated hooks for authentication (`useAuth`) and trade management (`useTrades`)
- **Utility Modules**: Pure functions for calculations, formatting, and business logic

### 📁 **Project Structure**
```
src/
├── components/
│   ├── ui/                   # Reusable UI components
│   └── views/               # Page-level view components
├── hooks/                   # Custom React hooks
├── utils/                   # Business logic utilities
├── constants/               # Application constants
├── services/                # External service integrations
└── App.jsx                 # Clean orchestration component
```

### ✨ **Development Benefits**
- **Maintainability**: Clean separation of concerns with focused, single-responsibility components
- **Testability**: Isolated components and pure functions make testing straightforward
- **Scalability**: Modular architecture supports easy feature additions and modifications
- **Reusability**: UI components can be reused across different views and contexts
- **Performance**: Optimized with proper React patterns and minimal re-renders

## Tech Stack

* **Frontend:** React 18, Vite (for fast development and building)
* **Styling:** Tailwind CSS (utility-first CSS framework)
* **Charts & Visualization:** Recharts (responsive chart library)
* **Icons:** Lucide React (modern SVG icon library)
* **Backend & Database:** Firebase (Authentication, Firestore)
* **External APIs:** Alpha Vantage (real-time market data)
* **Architecture:** Modern React patterns with custom hooks, modular components, and clean separation of concerns

## Application Views

The TradeJournal app is organized into five main views, each serving a specific purpose in the trading workflow:

### 1. Overview
The main dashboard that provides a comprehensive analysis of your trading performance:
- **Monthly Performance Filter:** View data for any specific month using the dropdown selector
- **Key Metrics:** Displays total P/L, win rate percentage, and number of closed trades with color-coded visual indicators
- **Visual Analytics:** Interactive pie chart showing the ratio of profitable vs. losing trades
- **Enhanced Trade History Table:** Complete list of all closed trades for the selected month, including ticker, strike prices, exit date, outcome, and final P/L
- **Smart Data Display:** Automatically filters out ongoing trades to show only completed positions

### 2. New Trade
A disciplined trade entry form that enforces proper analysis before logging any position:
- **Trade Specifications:** Input fields for ticker, entry/expiration dates, strike prices, net credit received, and number of contracts
- **Real-time Calculations:** Automatically computes and displays Max Profit, Max Loss, and Breakeven point as you enter trade details
- **Mandatory Checklists:** Two comprehensive checklists that must be completed before trade submission:
  - **Macro & Underlying Checklist:** Verifies liquidity, earnings schedule, IV percentile, and economic events
  - **Trade Entry Rules Checklist:** Confirms proper DTE, technical analysis, strike selection, and risk tolerance
- **Interactive Help System:** Each checklist item includes contextual help links to the strategy guide
- **Form Validation:** Submit button remains disabled until all fields are filled and all checklist items are confirmed

### 3. Ongoing Trades
A modern, visual dashboard for monitoring all open positions with enhanced UX:
- **Smart Trade Cards:** Each ongoing trade displayed in an intuitive card layout with all key metrics
- **DTE Circular Progress:** Visual circular progress indicators showing time decay with color-coded risk levels
- **Gamma Risk Alerts:** Automatic visual warnings when trades reach ≤21 DTE with yellow highlighting and alert icons
- **Exit Trade Integration:** Direct "Exit Trade" buttons on each card with modal-based exit workflow
- **Intelligent Sorting:** Trades automatically sorted by DTE (closest to expiration first) for better risk management
- **One-Click Actions:** Streamlined workflow from monitoring to exit without navigation

### 4. Exit a Trade
Enhanced exit management with improved user experience:
- **Modal-Based Interface:** Clean, focused exit workflow without page navigation
- **Smart Defaults:** Pre-populates with 50% of max profit for quick profit-taking decisions
- **Intelligent P/L Handling:** Automatic sign management - enter positive amounts, system applies correct sign based on profit/loss selection
- **Real-time Feedback:** Visual confirmation of final P/L amount with color-coded display
- **Multiple Entry Points:** Exit trades from dedicated view or directly from ongoing trade cards

### 5. Delete a Trade
A careful interface for permanently removing trades from the system:
- **Trade Selection:** Dropdown showing all trades (ongoing and closed) sorted by entry date
- **Trade Preview:** Displays selected trade details including ticker, strikes, entry date, and current status
- **Safety Confirmation:** Requires explicit confirmation via browser alert before deletion
- **Permanent Action:** Once confirmed, the trade is completely removed from the database with no recovery option

Each view is designed with a specific purpose in the trading lifecycle, from careful analysis and entry, through monitoring and management, to final exit and record-keeping. The app enforces discipline at every step while providing the flexibility to manage positions effectively.

---

## Recent Major Refactoring (v2.0)

The application underwent a comprehensive architectural refactoring to improve maintainability, scalability, and developer experience:

### 🔄 **What Changed**
- **Transformed monolithic 1191-line App.jsx** into a clean, modular architecture
- **Extracted reusable UI components** with proper prop interfaces and encapsulation
- **Created custom hooks** for authentication and trade data management
- **Established utility modules** for business logic and calculations
- **Implemented modern React patterns** throughout the codebase

### 📈 **Benefits Achieved**
- **85% reduction** in main component complexity (1191 → 85 lines)
- **Improved maintainability** with clear separation of concerns
- **Enhanced reusability** of UI components across views
- **Better testability** with isolated, focused components
- **Easier feature development** with established patterns and structure

### 🎯 **Developer Experience**
- **Clear project structure** makes navigation intuitive
- **Modular components** enable focused development
- **Custom hooks** simplify state management
- **Utility functions** centralize business logic
- **Type-safe patterns** ready for TypeScript adoption

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

3.  **Configure Alpha Vantage API** (for enhanced market data features):
    - Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
    - The API key is already integrated in the refactored codebase within the PriceService class
    - Note: Free tier provides 25 requests per day, which is sufficient for typical usage patterns
    - This enables real-time price display and enhanced trade analysis features

### 5. Run the Application

You're all set! Start the local development server by running:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:5173` (or the next available port). 

### 6. Development Notes

- **Hot Reload**: Changes to the code will automatically refresh the browser
- **Component Development**: New UI components should be added to `src/components/ui/`
- **Business Logic**: Add utility functions to `src/utils/` for reusability
- **Data Management**: Extend the custom hooks in `src/hooks/` for new data operations
- **Build for Production**: Run `npm run build` to create an optimized production build

---

## Contributing & Future Development

The modular architecture makes it easy to extend and improve the application:

### 🎯 **Adding New Features**
1. **UI Components**: Create reusable components in `src/components/ui/`
2. **Views**: Add new page-level components in `src/components/views/`
3. **Data Logic**: Extend custom hooks in `src/hooks/` for new data operations
4. **Business Logic**: Add pure functions to `src/utils/` for calculations and formatting

### 🔧 **Development Patterns**
- **Component Props**: Use clear, typed interfaces for component communication
- **State Management**: Leverage custom hooks for complex state logic
- **Error Handling**: Implement proper error boundaries and user feedback
- **Performance**: Use React.memo, useMemo, and useCallback where appropriate

### 🚀 **Potential Enhancements**
- **TypeScript Migration**: The modular structure is ready for type safety
- **Testing Suite**: Add unit tests for components and utility functions
- **Performance Monitoring**: Implement analytics and performance tracking
- **Advanced Features**: Paper trading mode, trade alerts, portfolio analysis
- **Mobile Optimization**: Enhance responsive design for mobile trading

### 📝 **Code Quality**
- **ESLint Configuration**: Maintain consistent coding standards
- **Component Documentation**: Document component APIs and usage patterns
- **Git Workflow**: Use feature branches and meaningful commit messages
- **Code Reviews**: Leverage the modular structure for focused reviews