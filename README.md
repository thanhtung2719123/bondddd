# Vietnam Investment Analyzer

A comprehensive React application for analyzing Vietnamese bond and fund investment options. This tool provides detailed comparative analysis, portfolio allocation recommendations, and Monte Carlo simulation for risk assessment.

## Overview

This application presents a real-world case study of Ms. An, a 30-year-old investor in Vietnam with ₫200 million to invest over a 10-year horizon. The analyzer compares three investment options:

- **Option A**: Government Bonds (10-year, 4.8% coupon)
- **Option B**: Corporate Bonds (VPBank 7-year, 8.0% coupon)
- **Option C**: Balanced Fund (TCBF, 9% expected return, 80% bonds/20% stocks)

## Features

### 1. Case Study Presentation
- Detailed investor profile
- Complete description of all three investment options
- Regulatory information about Vietnamese bond market restrictions
- Professional investor requirements (Decree 153/2020/ND-CP)

### 2. Comparative Analysis
- Side-by-side comparison table with key metrics:
  - 10-year future value projections
  - Nominal and real returns (CAGR)
  - Current yield and YTM
  - Risk level assessment
- Interactive bar chart visualization
- Key insights and recommendations

### 3. Portfolio Allocation
- Recommended 20/40/40 portfolio split
- Interactive pie chart visualization
- Detailed rationale for each allocation
- Portfolio performance metrics:
  - Weighted nominal return: 7.81%
  - Weighted real return: 3.66%
- Diversification benefits analysis

### 4. Monte Carlo Simulation
- 10,000 trial probabilistic analysis
- Comparison of Option C vs. Proposed Portfolio
- Percentile-based outcomes (5th, 50th, 95th)
- Risk parameters:
  - Option C: μ=9%, σ=12%
  - Portfolio: μ=7.81%, σ=4.8%
- Downside protection analysis
- Visual demonstration of diversification benefits

## Technology Stack

- **React 18** with Hooks (useState, useMemo)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Vite** for build tooling

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Basic Setup

```jsx
import VnInvestmentAnalyzer from './VnInvestmentAnalyzer';

function App() {
  return <VnInvestmentAnalyzer />;
}
```

### Tailwind CSS Configuration

Create a `tailwind.config.js` file:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./VnInvestmentAnalyzer.jsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### CSS Entry Point

Create a `src/index.css` file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Main Application File

Create a `src/main.jsx` file:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import VnInvestmentAnalyzer from '../VnInvestmentAnalyzer.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VnInvestmentAnalyzer />
  </React.StrictMode>,
)
```

### HTML Entry Point

Create an `index.html` file:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vietnam Investment Analyzer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Key Insights

### Regulatory Considerations
Based on Vietnamese Decree 153/2020/ND-CP (and amendments like Decree 65/2022/ND-CP), direct purchase of corporate bonds is restricted to "professional investors" who meet strict criteria:
- Securities portfolio ≥ ₫2 billion (avg. over 180 days), OR
- Annual taxable income ≥ ₫1 billion

Most retail investors like Ms. An would need to access corporate bonds through funds.

### Investment Recommendations
The recommended **20/40/40 portfolio** balances:
- **Safety** (20% government bonds)
- **Income** (40% corporate bonds or bond fund exposure)
- **Growth** (40% balanced fund with equity exposure)

This allocation provides:
- Expected nominal return: 7.81%
- Expected real return: 3.66% (after 4% inflation)
- Moderate risk profile suitable for 10-year horizon
- Better downside protection than 100% equity fund exposure

### Monte Carlo Findings
The simulation demonstrates:
- **Portfolio median outcome** (~₫420M) is slightly lower than Option C alone (~₫460M)
- **Portfolio worst-case** (5th percentile) significantly outperforms Option C in bad scenarios
- **Volatility reduction** from 12% to 4.8% through diversification
- Better risk-adjusted returns for moderate-risk investors

## Component Architecture

The application is built as a single, self-contained component with:
- All UI components (Card, Tabs, Button, Table, Alert) defined inline
- No external component library dependencies
- Modular tab-based navigation
- Responsive design with mobile-first approach
- Professional styling using Tailwind CSS

## Mathematical Models

### Future Value Calculations
- **Option A**: Bond valuation with annual coupons + reinvestment
- **Option B**: Semi-annual coupons for 7 years + 3-year reinvestment
- **Option C**: Compound annual growth rate

### Monte Carlo Simulation
- Box-Muller transform for normal distribution
- 10-year annual compounding with random returns
- Percentile-based risk assessment
- Portfolio volatility calculation using weighted standard deviation

## License

MIT

## Author

Created for Vietnamese retail investors seeking data-driven investment decisions.

## Disclaimer

This is an educational tool for investment analysis. Past performance does not guarantee future results. Consult with a licensed financial advisor before making investment decisions.

