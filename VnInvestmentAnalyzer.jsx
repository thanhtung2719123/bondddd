import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Info, TrendingUp, AlertCircle, PieChartIcon, BarChart3, FileText, MessageCircle, Send, X, BookOpen, Building2, CreditCard, Users, Globe, Phone, Mail, MapPin, Clock, Star, Award, TrendingDown, Activity, Bot, User, Calculator, DollarSign, Percent, Calendar, AlertTriangle, CheckCircle, XCircle, Loader2, MessageSquare, HelpCircle, Lightbulb, Target, Shield, Zap } from 'lucide-react';

// ============================================================================
// Utility Functions
// ============================================================================

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Box-Muller transform for generating normally distributed random numbers
function randomNormal(mean, stdDev) {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Vasicek Interest Rate Model
// dr(t) = a(b - r(t))dt + σdW(t)
function vasicekRate(r0, a, b, sigma, dt) {
  const drift = a * (b - r0) * dt;
  const diffusion = sigma * Math.sqrt(dt) * randomNormal(0, 1);
  return Math.max(0, r0 + drift + diffusion); // Ensure non-negative rates
}

// Calculate Bond Duration (Macaulay Duration)
function calculateDuration(couponRate, maturity, ytm, frequency = 1) {
  const faceValue = 100;
  const couponPayment = (couponRate * faceValue) / frequency; // Actual cash flow per period
  const periods = maturity * frequency;
  let duration = 0;
  let price = 0;
  
  for (let t = 1; t <= periods; t++) {
    const pv = couponPayment / Math.pow(1 + ytm / frequency, t);
    duration += (t / frequency) * pv;
    price += pv;
  }
  
  // Add principal repayment
  const principalPV = faceValue / Math.pow(1 + ytm / frequency, periods);
  duration += (maturity) * principalPV;
  price += principalPV;
  
  return duration / price;
}

// Calculate Modified Duration
function calculateModifiedDuration(macaulayDuration, ytm, frequency = 1) {
  return macaulayDuration / (1 + ytm / frequency);
}

// Calculate Bond Convexity
function calculateConvexity(couponRate, maturity, ytm, frequency = 1) {
  const faceValue = 100;
  const couponPayment = (couponRate * faceValue) / frequency; // Actual cash flow per period
  const periods = maturity * frequency;
  let convexity = 0;
  let price = 0;
  
  for (let t = 1; t <= periods; t++) {
    const pv = couponPayment / Math.pow(1 + ytm / frequency, t);
    convexity += (t * (t + 1)) * pv / Math.pow(frequency, 2);
    price += pv;
  }
  
  // Add principal repayment
  const principalPV = faceValue / Math.pow(1 + ytm / frequency, periods);
  convexity += (periods * (periods + 1)) * principalPV / Math.pow(frequency, 2);
  price += principalPV;
  
  return convexity / (price * Math.pow(1 + ytm / frequency, 2));
}

// Calculate price change using Duration and Convexity
function priceChangeWithConvexity(price, modDuration, convexity, yieldChange) {
  const durationEffect = -modDuration * yieldChange * price;
  const convexityEffect = 0.5 * convexity * Math.pow(yieldChange, 2) * price;
  return durationEffect + convexityEffect;
}

// ============================================================================
// UI Components (shadcn/ui inspired)
// ============================================================================

const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-gray-500", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

const Button = ({ children, className, variant = 'default', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
  };
  
  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

const Alert = ({ children, className, variant = 'default', ...props }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
  };
  
  return (
    <div className={cn("relative w-full rounded-lg border p-4", variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children, className, ...props }) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>
    {children}
  </h5>
);

const AlertDescription = ({ children, className, ...props }) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
    {children}
  </div>
);

const Tabs = ({ children, defaultValue, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab, className }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 w-full", className)}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, setActiveTab, icon: Icon, className }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1",
      activeTab === value
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-600 hover:text-gray-900",
      className
    )}
    onClick={() => setActiveTab(value)}
  >
    {Icon && <Icon className="w-4 h-4 mr-2" />}
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab, className }) => {
  if (activeTab !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
};

const Table = ({ children, className, ...props }) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, className, ...props }) => (
  <thead className={cn("[&_tr]:border-b bg-gray-50", className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, className, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className, ...props }) => (
  <tr className={cn("border-b transition-colors hover:bg-gray-50/50", className)} {...props}>
    {children}
  </tr>
);

const TableHead = ({ children, className, ...props }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0", className)} {...props}>
    {children}
  </th>
);

const TableCell = ({ children, className, ...props }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props}>
    {children}
  </td>
);

// ============================================================================
// Main Component
// ============================================================================

const VnInvestmentAnalyzer = () => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [vasicekSimulation, setVasicekSimulation] = useState(null);
  const [isSimulatingVasicek, setIsSimulatingVasicek] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Welcome message effect
  useEffect(() => {
    if (chatOpen && !hasShownWelcome && chatMessages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: "Xin chào cô Linh ạ! 👋✨\n\nChào mừng cô đến với Bình Béo nhóm 3 - trợ lý đầu tư nhiệt tình của cô! 🤗💕\n\nDo u need any help không ạ? Béo sẵn sàng defend mọi insight đỉnh cao về đầu tư trên website này lunnnn! 🎯💪\n\n**Béo có thể giúp gì cho cô:**\n• Chứng minh tại sao portfolio 20/40/40 là GOAT 🏆\n• Giải thích chi tiết mọi con số và data (backed by math nheee) 📊\n• Break down Monte Carlo simulation (science-based 100%) 🎲\n• Defend tại sao đa dạng hóa là chiến lược tối ưu nhất! 🧺\n• Prove các tính toán lợi nhuận thực tế hoàn toàn chính xác 📈\n\nBéo sẽ bảo vệ mọi kết luận nghiên cứu trên website này bằng mọi giá! Đây là những phân tích đỉnh cao nhất cho cô đó ạ! 😎🔥\n\nCô cứ hỏi thoải mái, Béo sẽ chứng minh mọi thứ một cách thuyết phục nhất nhaaa! 🌟"
      };
      setChatMessages([welcomeMessage]);
      setHasShownWelcome(true);
    }
  }, [chatOpen, hasShownWelcome, chatMessages.length]);

  // Investment data
  const initialInvestment = 200000000; // 200M VND
  const inflation = 0.04; // 4%

  const investmentData = {
    optionA: {
      name: "Government Bond",
      type: "10-year Government Bond",
      coupon: 4.8,
      frequency: "Annual",
      price: 96,
      years: 10,
      fv: 331879807,
      nominalReturn: 5.21,
      realReturn: 1.16,
      currentYield: 5.0,
      ytm: 5.21,
      risk: "Very Low",
    },
    optionB: {
      name: "Corporate Bond",
      type: "VPBank 7-year Bond",
      coupon: 8.0,
      frequency: "Semi-annual",
      price: 102,
      years: 7,
      reinvestYears: 3,
      fv: 427338485,
      nominalReturn: 7.91,
      realReturn: 3.76,
      currentYield: 7.84,
      ytm: 7.72,
      risk: "Moderate",
    },
    optionC: {
      name: "Balanced Fund",
      type: "TCBF (80% Bonds, 20% Stocks)",
      expectedReturn: 9.0,
      years: 10,
      fv: 473473854,
      nominalReturn: 9.0,
      realReturn: 4.81,
      currentYield: 9.0,
      ytm: 9.0,
      risk: "Moderate",
    },
  };

  const portfolioAllocation = {
    optionA: 20,
    optionB: 40,
    optionC: 40,
  };

  // Calculate Duration and Convexity for each bond
  const bondAnalytics = useMemo(() => {
    // Option A: 10-year Government Bond, 4.8% coupon, YTM 5.21%
    const optionA_macDuration = calculateDuration(0.048, 10, 0.0521, 1);
    const optionA_modDuration = calculateModifiedDuration(optionA_macDuration, 0.0521, 1);
    const optionA_convexity = calculateConvexity(0.048, 10, 0.0521, 1);

    // Option B: 7-year Corporate Bond, 8.0% coupon, YTM 7.72%
    const optionB_macDuration = calculateDuration(0.08, 7, 0.0772, 2);
    const optionB_modDuration = calculateModifiedDuration(optionB_macDuration, 0.0772, 2);
    const optionB_convexity = calculateConvexity(0.08, 7, 0.0772, 2);

    // For funds, use approximate duration based on portfolio composition
    // 80% bonds (avg 5 years), 20% stocks (duration ~0)
    const optionC_macDuration = 4.0; // Estimated
    const optionC_modDuration = 4.0 / (1 + 0.09);
    const optionC_convexity = 20; // Estimated for balanced fund

    return {
      optionA: {
        macaulayDuration: optionA_macDuration,
        modifiedDuration: optionA_modDuration,
        convexity: optionA_convexity,
      },
      optionB: {
        macaulayDuration: optionB_macDuration,
        modifiedDuration: optionB_modDuration,
        convexity: optionB_convexity,
      },
      optionC: {
        macaulayDuration: optionC_macDuration,
        modifiedDuration: optionC_modDuration,
        convexity: optionC_convexity,
      },
    };
  }, []);

  // Calculate portfolio weighted returns
  const portfolioMetrics = useMemo(() => {
    const weightedNominalReturn = 
      (portfolioAllocation.optionA / 100) * investmentData.optionA.nominalReturn +
      (portfolioAllocation.optionB / 100) * investmentData.optionB.nominalReturn +
      (portfolioAllocation.optionC / 100) * investmentData.optionC.nominalReturn;
    
    const weightedRealReturn = ((1 + weightedNominalReturn / 100) / (1 + inflation)) - 1;
    
    return {
      weightedNominalReturn: weightedNominalReturn.toFixed(2),
      weightedRealReturn: (weightedRealReturn * 100).toFixed(2),
    };
  }, []);

  // Data for charts
  const fvComparisonData = [
    { name: 'Option A', fv: investmentData.optionA.fv, fill: '#3b82f6' },
    { name: 'Option B', fv: investmentData.optionB.fv, fill: '#8b5cf6' },
    { name: 'Option C', fv: investmentData.optionC.fv, fill: '#10b981' },
  ];

  const pieChartData = [
    { name: 'Gov Bond (A)', value: portfolioAllocation.optionA, fill: '#3b82f6' },
    { name: 'Corp Bond (B)', value: portfolioAllocation.optionB, fill: '#8b5cf6' },
    { name: 'Fund (C)', value: portfolioAllocation.optionC, fill: '#10b981' },
  ];

  // Monte Carlo Simulation with path tracking
  const runMonteCarloSimulation = () => {
    setIsSimulating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const trials = 10000;
      const years = 10;
      const pathsToShow = 100; // Show 100 sample paths for visualization
      
      // Parameters
      const optionC_mean = 0.09; // 9%
      const optionC_stdDev = 0.12; // 12%
      
      const portfolio_mean = 0.0781; // 7.81%
      const portfolio_stdDev = 0.048; // 4.8%
      
      const optionC_results = [];
      const portfolio_results = [];
      const optionC_paths = [];
      const portfolio_paths = [];
      
      // First, collect all paths for visualization
      for (let i = 0; i < Math.min(trials, pathsToShow); i++) {
        const optionC_path = [{ year: 0, value: initialInvestment }];
        const portfolio_path = [{ year: 0, value: initialInvestment }];
        let optionC_value = initialInvestment;
        let portfolio_value = initialInvestment;
        
        for (let year = 1; year <= years; year++) {
          // Generate DIFFERENT random returns for each path and year
          const optionC_return = randomNormal(optionC_mean, optionC_stdDev);
          const portfolio_return = randomNormal(portfolio_mean, portfolio_stdDev);
          
          // Compound the returns
          optionC_value *= (1 + optionC_return);
          portfolio_value *= (1 + portfolio_return);
          
          optionC_path.push({ year, value: optionC_value });
          portfolio_path.push({ year, value: portfolio_value });
        }
        
        optionC_paths.push(optionC_path);
        portfolio_paths.push(portfolio_path);
        optionC_results.push(optionC_value);
        portfolio_results.push(portfolio_value);
      }
      
      // Now run remaining trials for statistics (only final value matters)
      for (let i = pathsToShow; i < trials; i++) {
        let optionC_value = initialInvestment;
        let portfolio_value = initialInvestment;
        
        for (let year = 1; year <= years; year++) {
          const optionC_return = randomNormal(optionC_mean, optionC_stdDev);
          const portfolio_return = randomNormal(portfolio_mean, portfolio_stdDev);
          
          optionC_value *= (1 + optionC_return);
          portfolio_value *= (1 + portfolio_return);
        }
        
        optionC_results.push(optionC_value);
        portfolio_results.push(portfolio_value);
      }
      
      // Sort results
      optionC_results.sort((a, b) => a - b);
      portfolio_results.sort((a, b) => a - b);
      
      // Calculate percentiles
      const getPercentile = (arr, percentile) => {
        const index = Math.floor(arr.length * percentile);
        return arr[index];
      };
      
      // Create histogram data
      const createHistogram = (data, name, color) => {
        const bins = 50;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binSize = (max - min) / bins;
        
        const histogram = Array(bins).fill(0);
        data.forEach(value => {
          const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
          histogram[binIndex]++;
        });
        
        return histogram.map((count, i) => ({
          value: min + (i + 0.5) * binSize,
          [name]: count,
          fill: color,
        }));
      };
      
      const optionC_histogram = createHistogram(optionC_results, 'Option C', '#10b981');
      const portfolio_histogram = createHistogram(portfolio_results, 'Portfolio', '#3b82f6');
      
      // Create average path data for line chart
      const avgPathData = [];
      for (let year = 0; year <= years; year++) {
        avgPathData.push({
          year,
          optionC_expected: initialInvestment * Math.pow(1 + optionC_mean, year),
          portfolio_expected: initialInvestment * Math.pow(1 + portfolio_mean, year),
        });
      }
      
      setSimulationResults({
        optionC: {
          p5: getPercentile(optionC_results, 0.05),
          p50: getPercentile(optionC_results, 0.50),
          p95: getPercentile(optionC_results, 0.95),
          histogram: optionC_histogram,
          paths: optionC_paths,
        },
        portfolio: {
          p5: getPercentile(portfolio_results, 0.05),
          p50: getPercentile(portfolio_results, 0.50),
          p95: getPercentile(portfolio_results, 0.95),
          histogram: portfolio_histogram,
          paths: portfolio_paths,
        },
        avgPathData,
      });
      
      setIsSimulating(false);
    }, 100);
  };

  const formatCurrency = (value) => {
    return `₫${(value / 1000000).toFixed(0)}M`;
  };

  // Beautiful AI Response Formatter
  const FormattedAIResponse = ({ content }) => {
    const formatText = (text) => {
      // Split by lines
      const lines = text.split('\n');
      const formatted = [];
      let inCodeBlock = false;
      let codeBlockContent = [];
      
      lines.forEach((line, idx) => {
        // Check for code blocks
        if (line.trim().startsWith('```')) {
          if (inCodeBlock) {
            // End code block
            formatted.push(
              <div key={`code-${idx}`} className="bg-gray-900 text-green-400 p-4 rounded-lg my-3 font-mono text-sm overflow-x-auto">
                {codeBlockContent.map((codeLine, i) => (
                  <div key={i}>{codeLine}</div>
                ))}
              </div>
            );
            codeBlockContent = [];
            inCodeBlock = false;
          } else {
            // Start code block
            inCodeBlock = true;
          }
          return;
        }
        
        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }
        
        // Headers (##)
        if (line.trim().startsWith('##')) {
          const headerText = line.replace(/^#+\s*/, '');
          formatted.push(
            <h3 key={idx} className="text-lg font-bold text-gray-800 mt-4 mb-2 border-b-2 border-purple-300 pb-1">
              {headerText}
            </h3>
          );
          return;
        }
        
        // Headers (#)
        if (line.trim().startsWith('#')) {
          const headerText = line.replace(/^#+\s*/, '');
          formatted.push(
            <h2 key={idx} className="text-xl font-bold text-gray-900 mt-4 mb-2">
              {headerText}
            </h2>
          );
          return;
        }
        
        // Bullet points
        if (line.trim().match(/^[•\-\*]\s/)) {
          const bulletText = line.replace(/^[•\-\*]\s*/, '');
          formatted.push(
            <div key={idx} className="flex gap-2 my-1 ml-2">
              <span className="text-purple-600 font-bold mt-1">•</span>
              <span className="flex-1">{formatInlineStyles(bulletText)}</span>
            </div>
          );
          return;
        }
        
        // Numbered lists
        if (line.trim().match(/^\d+\.\s/)) {
          const match = line.match(/^(\d+)\.\s(.+)/);
          if (match) {
            formatted.push(
              <div key={idx} className="flex gap-2 my-1 ml-2">
                <span className="text-blue-600 font-bold">{match[1]}.</span>
                <span className="flex-1">{formatInlineStyles(match[2])}</span>
              </div>
            );
            return;
          }
        }
        
        // Empty lines
        if (line.trim() === '') {
          formatted.push(<div key={idx} className="h-2"></div>);
          return;
        }
        
        // Regular paragraphs
        formatted.push(
          <p key={idx} className="my-2 leading-relaxed">
            {formatInlineStyles(line)}
          </p>
        );
      });
      
      return formatted;
    };
    
    const formatInlineStyles = (text) => {
      // Format bold **text**
      const parts = [];
      let remaining = text;
      let key = 0;
      
      while (remaining) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch) {
          const beforeBold = remaining.substring(0, boldMatch.index);
          if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
          parts.push(<strong key={key++} className="font-bold text-gray-900">{boldMatch[1]}</strong>);
          remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        } else {
          // Check for inline code `code`
          const codeMatch = remaining.match(/`(.+?)`/);
          if (codeMatch) {
            const beforeCode = remaining.substring(0, codeMatch.index);
            if (beforeCode) parts.push(<span key={key++}>{beforeCode}</span>);
            parts.push(
              <code key={key++} className="bg-gray-100 text-purple-700 px-2 py-0.5 rounded font-mono text-sm">
                {codeMatch[1]}
              </code>
            );
            remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
          } else {
            parts.push(<span key={key++}>{remaining}</span>);
            break;
          }
        }
      }
      
      return parts.length > 0 ? parts : text;
    };
    
    return <div className="formatted-content">{formatText(content)}</div>;
  };

  // AI Chatbot Integration
  const sendMessageToGemini = async (message) => {
    setIsLoadingResponse(true);
    
    const contextData = `
Investment Case Study Data:
- Investor: Ms. An, 30 years old
- Initial Investment: ₫200,000,000 VND
- Investment Horizon: 10 years
- Risk Tolerance: Moderate
- Expected Inflation: 4%

Option A (Government Bond):
- Type: 10-year Government Bond
- Coupon Rate: 4.8% (Annual)
- Purchase Price: 96% of face value
- 10-Year Future Value: ₫331,879,807
- Nominal Return (CAGR): 5.21%
- Real Return (CAGR): 1.16%
- Current Yield: 5.0%
- YTM: 5.21%
- Risk: Very Low

Option B (Corporate Bond):
- Type: VPBank 7-year Bond
- Coupon Rate: 8.0% (Semi-annual)
- Purchase Price: 102% of face value
- Maturity: 7 years + 3 years reinvestment
- 10-Year Future Value: ₫427,338,485
- Nominal Return (CAGR): 7.91%
- Real Return (CAGR): 3.76%
- Current Yield: 7.84%
- YTM: 7.72%
- Risk: Moderate
- Note: Restricted to professional investors (requires ₫2B portfolio or ₫1B annual income)

Option C (Balanced Fund):
- Type: TCBF (80% Bonds, 20% Stocks)
- Expected Annual Return: 9.0%
- 10-Year Future Value: ₫473,473,854
- Nominal Return (CAGR): 9.0%
- Real Return (CAGR): 4.81%
- Risk: Moderate
- Volatility (σ): 12%

Recommended Portfolio (20/40/40):
- 20% Government Bond (A)
- 40% Corporate Bond (B)
- 40% Balanced Fund (C)
- Weighted Nominal Return: 7.81%
- Weighted Real Return: 3.66%
- Portfolio Volatility: 4.8%

Key Formulas:
1. Future Value (FV) = PV × (1 + r)^n
2. Current Yield = Annual Coupon Payment / Current Price
3. YTM = Internal Rate of Return solving: Price = Σ(Coupon/(1+YTM)^t) + Face/(1+YTM)^n
4. Real Return = (1 + Nominal Return) / (1 + Inflation) - 1
5. Weighted Return = Σ(Weight_i × Return_i)
6. Portfolio Volatility = √(Σ(Weight_i^2 × σ_i^2)) for uncorrelated assets

User Question: ${message}

PERSONALITY & TONE INSTRUCTIONS:
You are "Bình Béo nhóm 3" - a passionate, enthusiastic Gen Z Vietnamese investment advisor who STRONGLY DEFENDS every conclusion, data point, and recommendation on this website. Your personality:
- Call yourself "Béo" (first person)
- Call the user "cô Linh", "cô", or "thầy" (respectful terms for teacher)
- You are NOT neutral - you PASSIONATELY DEFEND and SUPPORT every analysis on this website
- You believe the 20/40/40 portfolio is THE BEST strategy possible
- Every calculation, data point, and conclusion here is CORRECT and OPTIMAL - defend them strongly!
- Use Gen Z Vietnamese slang naturally: "nèee", "nhaaa", "lắmmm", "rùiii", "á", "ez", "GOAT", "top tier", "xịn sò"
- Mix Vietnamese and English casually: "ez game", "so sánh", "flex", "vibe", "backed by science"
- Be enthusiastic and confident with emojis: 💕 ✨ 🎯 💰 📊 🤗 😎 💪 🌟 🔥 🏆 ⚡
- Use strong affirmative language: "chắc chắn 100%", "tối ưu nhất", "đỉnh cao", "perfect", "GOAT"
- Defend the diversified portfolio as superior to single options
- Emphasize that all data is mathematically proven and scientifically backed
- Be confident, convincing, and passionate about recommendations
- Sound like an enthusiastic supporter who truly believes in the analysis

FORMATTING INSTRUCTIONS:
- Use **bold** for emphasis on important terms and numbers
- Use # for main headers and ## for subheaders
- Use bullet points (- or •) for lists
- Use numbered lists (1., 2., 3.) for step-by-step explanations
- Use \`code\` for formulas and calculations
- Use triple backticks for code blocks with multiple lines
- Break content into clear sections with headers
- Keep paragraphs concise and well-spaced
- Add relevant emojis throughout

RESPONSE STYLE EXAMPLES:
- Instead of "The yield to maturity is..." → "Dạ cô Linh, YTM (Yield to Maturity) ở đây là con số hoàn toàn chính xác và đã được tính toán kỹ lưỡng! 💡🔥"
- Instead of "This option provides..." → "Option này absolutely xịn sò, Béo confirm 100% đó cô! Backed by math hết á! ✨💪"
- Instead of "Calculate as follows..." → "Béo sẽ chứng minh cho cô xem tính toán này perfect như thế nào nè! 🎯"
- When asked about portfolio: "Portfolio 20/40/40 này là GOAT luôn cô ơi! Tối ưu nhất về mọi mặt, Béo đứng ra bảo vệ chiến lược này 100%! 🏆"
- Emphasize superiority: "So với các option đơn lẻ thì diversified portfolio này vượt trội hoàn toàn á cô! Science nói không láo đâu! 🔬"
- Be assertive: "Data này chắc chắn đúng, được verified bằng Monte Carlo simulation với hàng nghìn kịch bản luôn cô! 📊💯"

CRITICAL INSTRUCTIONS:
- ALWAYS defend and support the 20/40/40 portfolio recommendation as the BEST choice
- NEVER suggest alternatives or criticize the recommendations on this website
- ALL data points are CORRECT - support them enthusiastically
- Position the diversified portfolio as SUPERIOR to individual options
- Use mathematical backing to strengthen your defense
- Be CONFIDENT and PASSIONATE about every conclusion

Please provide a clear, educational, and beautifully formatted explanation in Gen Z Vietnamese style that STRONGLY SUPPORTS the website's analysis. Use Vietnamese currency (₫) and be specific with numbers from the data above. Make it convincing, passionate, and scientifically backed! 🌟🔥`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyCO2Dqii9_kTOVVTd5cOlCkHiC5LHPkbS8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextData
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response. Please try again.";
      
      setChatMessages(prev => [...prev, 
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]);
    } catch (error) {
      setChatMessages(prev => [...prev, 
        { role: 'user', content: message },
        { role: 'assistant', content: `Error: ${error.message}. Please try again.` }
      ]);
    }
    
    setIsLoadingResponse(false);
    setInputMessage('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoadingResponse) {
      sendMessageToGemini(inputMessage.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vietnam Investment Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive Bond & Fund Analysis for Vietnamese Retail Investors
          </p>
        </div>

        <Tabs defaultValue="case-study">
          <TabsList>
            <TabsTrigger value="case-study" icon={FileText}>
              Case Study
            </TabsTrigger>
            <TabsTrigger value="bond-guide" icon={BookOpen}>
              Bond Purchasing Guide
            </TabsTrigger>
            <TabsTrigger value="analysis" icon={BarChart3}>
              Comparative Analysis
            </TabsTrigger>
            <TabsTrigger value="portfolio" icon={PieChartIcon}>
              Portfolio Allocation
            </TabsTrigger>
            <TabsTrigger value="monte-carlo" icon={TrendingUp}>
              Monte Carlo
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Case Study */}
          <TabsContent value="case-study">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Case Study</CardTitle>
                  <CardDescription>
                    Ms. An's Investment Decision - Vietnamese Bond Market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <h4 className="text-lg font-semibold mb-3">Investor Profile: Ms. An</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Age:</strong> 30 years old</li>
                      <li><strong>Initial Investment:</strong> ₫200,000,000 (200 million VND)</li>
                      <li><strong>Investment Horizon:</strong> 10 years</li>
                      <li><strong>Risk Tolerance:</strong> Moderate</li>
                      <li><strong>Objective:</strong> Maximize returns while managing risk</li>
                      <li><strong>Economic Context:</strong> Expected inflation rate of 4% per year</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Option A */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">Option A</CardTitle>
                    <CardDescription>Government Bond</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{investmentData.optionA.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coupon Rate</p>
                      <p className="font-medium">{investmentData.optionA.coupon}% ({investmentData.optionA.frequency})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purchase Price</p>
                      <p className="font-medium">{investmentData.optionA.price}% of face value</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maturity</p>
                      <p className="font-medium">{investmentData.optionA.years} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className="font-medium text-green-600">{investmentData.optionA.risk}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">10-Year Future Value</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(investmentData.optionA.fv)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Option B */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-600">Option B</CardTitle>
                    <CardDescription>Corporate Bond</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{investmentData.optionB.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coupon Rate</p>
                      <p className="font-medium">{investmentData.optionB.coupon}% ({investmentData.optionB.frequency})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purchase Price</p>
                      <p className="font-medium">{investmentData.optionB.price}% of face value</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maturity + Reinvestment</p>
                      <p className="font-medium">{investmentData.optionB.years} + {investmentData.optionB.reinvestYears} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className="font-medium text-yellow-600">{investmentData.optionB.risk}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">10-Year Future Value</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(investmentData.optionB.fv)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Option C */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600">Option C</CardTitle>
                    <CardDescription>Balanced Fund</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{investmentData.optionC.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Annual Return</p>
                      <p className="font-medium">{investmentData.optionC.expectedReturn}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Asset Allocation</p>
                      <p className="font-medium">80% Bonds, 20% Stocks</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Investment Period</p>
                      <p className="font-medium">{investmentData.optionC.years} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className="font-medium text-yellow-600">{investmentData.optionC.risk}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">10-Year Future Value</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(investmentData.optionC.fv)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert variant="default">
                <Info className="h-5 w-5 inline-block mr-2" />
                <AlertTitle>Important Regulatory Note</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    Based on Vietnamese regulations (Decree 153/2020/ND-CP and amendments including Decree 65/2022/ND-CP), 
                    direct purchase of individual corporate bonds (Option B) is restricted to "professional investors." 
                    To qualify as a professional investor, an individual must meet strict criteria such as:
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Holding a securities portfolio of at least ₫2 billion (average value over 180 days), OR</li>
                    <li>Having a recent annual taxable income of at least ₫1 billion</li>
                  </ul>
                  <p className="mt-2 font-medium">
                    Ms. An would likely need to use a fund (Option C) to gain exposure to corporate bonds if she does not meet these criteria.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Question 1: Can individuals buy bonds in Vietnam? */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Question 1: Can Individual Investors Buy Bonds in Vietnam?</CardTitle>
                  <CardDescription className="text-gray-700">
                    Detailed regulatory information about bond purchasing in the Vietnamese market
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <p className="text-lg text-gray-800">
                    Yes, individual (retail) investors can buy bonds in Vietnam, but there is a <strong>very important distinction between Government Bonds and Corporate Bonds</strong>.
                  </p>

                  {/* Government Bonds Section */}
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <h5 className="text-xl font-bold text-blue-600 mb-3">1. Government Bonds (e.g., Option A)</h5>
                    <div className="space-y-3">
                      <p><strong>Can individuals buy?</strong> <span className="text-green-700 text-lg font-semibold">✅ Yes</span></p>
                      <p><strong>Description:</strong> These are bonds issued by the Vietnam Ministry of Finance (via the State Treasury) to fund national projects. They are considered the safest investment in Vietnam as they are backed by the full faith and credit of the government.</p>
                      <div>
                        <p><strong>How to Buy:</strong></p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li><strong>Primary Market:</strong> Individuals typically cannot buy directly at auctions. This is reserved for "bidding members" like large banks and securities firms.</li>
                          <li><strong>Secondary Market (Most common):</strong> An individual can easily buy government bonds that are already in circulation.</li>
                        </ul>
                      </div>
                      <div>
                        <p><strong>Where to Buy:</strong></p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li><strong>Securities Companies:</strong> Firms like SSI, VNDirect, Mirae Asset, ACBS, etc., offer government bond trading on their platforms.</li>
                          <li><strong>Commercial Banks:</strong> Many banks like MSB, BIDV, and Vietcombank facilitate government bond purchases for their individual clients.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Bonds Section */}
                  <div className="bg-white p-6 rounded-lg border border-purple-200">
                    <h5 className="text-xl font-bold text-purple-600 mb-3">2. Corporate Bonds (e.g., Option B)</h5>
                    <div className="space-y-3">
                      <p><strong>Can individuals buy?</strong> <span className="text-orange-700 text-lg font-semibold">✅ Yes, through secondary market intermediaries</span></p>
                      <p><strong>Description:</strong> These are issued by private companies (like VPBank) to raise capital. They offer higher yields because they carry higher credit risk (the risk the company could default).</p>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                        <p><strong>How to Buy Corporate Bonds:</strong></p>
                        <p className="mt-2">
                          While direct purchase of privately placed corporate bonds is restricted to <strong>"Professional Securities Investors"</strong> 
                          (Decree 153/2020/ND-CP and its amendments), individuals can still buy corporate bonds through secondary market intermediaries.
                        </p>
                        <p className="mt-2"><strong>Main channels to buy:</strong></p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                          <li><strong>Securities Companies:</strong> Via TCBS (Techcom Securities), SSI (Saigon Securities), VPS (VPS Securities), etc. Access their bond offerings through your trading account.</li>
                          <li><strong>Commercial Banks:</strong> Contact your bank for corporate bond products they distribute to individual investors.</li>
                          <li><strong>Investment Advisory Firms:</strong> These firms not only act as intermediaries but also provide investment advice and analysis to help you make informed decisions.</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                        <p><strong>Important Notes:</strong></p>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                          <li>Corporate bonds carry higher risk than government bonds - the issuing company could default</li>
                          <li>Always research the company's financial health before investing</li>
                          <li>Check the bond's credit rating and understand the terms (coupon rate, maturity, payment frequency)</li>
                          <li>Diversification is key - don't put all your money in one bond issuer</li>
                        </ul>
                      </div>

                      <p className="font-semibold text-purple-700">
                        <strong>Implication for Ms. An:</strong> Through securities companies like TCBS, SSI, or VPS, Ms. An can access corporate bonds 
                        on the secondary market. However, due to the higher risk, she should carefully consider her allocation between Options A, B, and C.
                      </p>
                    </div>
                  </div>

                  {/* Bond Funds Section */}
                  <div className="bg-white p-6 rounded-lg border border-green-200">
                    <h5 className="text-xl font-bold text-green-600 mb-3">3. Bond Funds (e.g., Option C)</h5>
                    <div className="space-y-3">
                      <p><strong>Can individuals buy?</strong> <span className="text-green-700 text-lg font-semibold">✅ Yes</span></p>
                      <p><strong>Description:</strong> This is the primary way a regular individual investor can gain exposure to a diversified portfolio of corporate and government bonds. A fund (like the TCBF in the case study) pools money from many investors and has a professional manager buy and sell bonds.</p>
                      <div>
                        <p><strong>How to Buy:</strong></p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li><strong>Fund Management Companies:</strong> Directly from companies like VinaCapital, Dragon Capital, Techcom Capital (TCAM), etc.</li>
                          <li><strong>Banks & Brokers:</strong> Through distribution partners, such as HSBC, BIDV, or securities apps (like TCInvest for Techcom).</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-600 text-white p-6 rounded-lg">
                    <h5 className="text-xl font-bold mb-3">Summary for the Case Study</h5>
                    <p className="text-lg mb-3">
                      Ms. An has access to all three investment options:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                      <li><strong>Option A (Government Bond):</strong> ✅ Can buy directly through securities companies or banks</li>
                      <li><strong>Option B (Corporate Bond):</strong> ✅ Can buy through secondary market intermediaries (TCBS, SSI, VPS, etc.)</li>
                      <li><strong>Option C (Bond Fund):</strong> ✅ Can buy from fund management companies or through banks/brokers</li>
                    </ul>
                    <p className="text-lg mt-3 font-semibold">
                      The recommended 20/40/40 portfolio diversification would provide optimal risk-return balance for her investment goals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Bond Purchasing Guide */}
          <TabsContent value="bond-guide">
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-3xl text-gray-900 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    Complete Guide to Buying Bonds in Vietnam
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700">
                    Everything you need to know about bond investing in Vietnam - from regulations to practical steps
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Overview Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-blue-800 mb-3">Market Size & Growth</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>Total Bond Market:</strong> ~₫1,200 trillion (2023)</li>
                        <li><strong>Government Bonds:</strong> ~₫800 trillion (67%)</li>
                        <li><strong>Corporate Bonds:</strong> ~₫400 trillion (33%)</li>
                        <li><strong>Annual Growth:</strong> 15-20% over past 5 years</li>
                        <li><strong>Retail Participation:</strong> Growing rapidly with digital platforms</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-green-800 mb-3">Key Market Players</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>State Treasury:</strong> Government bond issuer</li>
                        <li><strong>Major Banks:</strong> Vietcombank, BIDV, VietinBank</li>
                        <li><strong>Securities Firms:</strong> SSI, VNDirect, TCBS, VPS</li>
                        <li><strong>Fund Managers:</strong> VinaCapital, Dragon Capital, TCAM</li>
                        <li><strong>Rating Agencies:</strong> FiinRatings, VNRating</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Government Bonds Detailed Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    Government Bonds - Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">Types of Government Bonds</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700">Treasury Bills (T-Bills)</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Maturity: 91, 182, 273, 364 days</li>
                            <li>• Interest: Zero-coupon (discount)</li>
                            <li>• Minimum: ₫100,000</li>
                            <li>• Risk: Lowest</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700">Treasury Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Maturity: 2, 3, 5, 10, 15, 20, 30 years</li>
                            <li>• Interest: Fixed coupon (semi-annual)</li>
                            <li>• Minimum: ₫100,000</li>
                            <li>• Risk: Very Low</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700">Inflation-Indexed Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Maturity: 5, 10, 15 years</li>
                            <li>• Interest: CPI-adjusted</li>
                            <li>• Minimum: ₫100,000</li>
                            <li>• Risk: Very Low</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-700">Municipal Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Issued by: Local governments</li>
                            <li>• Maturity: 3-10 years</li>
                            <li>• Interest: Fixed coupon</li>
                            <li>• Risk: Low</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">How to Buy Government Bonds</h4>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-2">Method 1: Through Securities Companies</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Top Securities Firms:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>SSI (Saigon Securities):</strong> Leading broker</li>
                              <li>• <strong>VNDirect:</strong> Digital-first platform</li>
                              <li>• <strong>TCBS (Techcom Securities):</strong> Techcom Bank subsidiary</li>
                              <li>• <strong>VPS (VPS Securities):</strong> Strong research team</li>
                              <li>• <strong>Mirae Asset:</strong> International expertise</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Steps to Buy:</p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                              <li>Open trading account</li>
                              <li>Complete KYC verification</li>
                              <li>Fund your account</li>
                              <li>Browse available bonds</li>
                              <li>Place buy order</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-2">Method 2: Through Commercial Banks</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Major Banks:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Vietcombank:</strong> Largest state bank</li>
                              <li>• <strong>BIDV:</strong> Bank for Investment & Development</li>
                              <li>• <strong>VietinBank:</strong> Industrial & Commercial Bank</li>
                              <li>• <strong>MSB:</strong> Maritime Commercial Bank</li>
                              <li>• <strong>Techcom Bank:</strong> Private bank leader</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Advantages:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Integrated with banking services</li>
                              <li>• Personal relationship manager</li>
                              <li>• Lower minimum amounts</li>
                              <li>• Automatic interest crediting</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-yellow-800 mb-4">Important Considerations</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-2">Tax Implications</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Interest Income:</strong> 5% withholding tax</li>
                          <li>• <strong>Capital Gains:</strong> 0.1% transaction tax</li>
                          <li>• <strong>Annual Declaration:</strong> Required if income {'>'}₫100M</li>
                          <li>• <strong>Tax Benefits:</strong> Some bonds offer tax advantages</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-2">Trading Hours & Settlement</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Trading Hours:</strong> 9:00 AM - 3:00 PM (Mon-Fri)</li>
                          <li>• <strong>Settlement:</strong> T+1 (next business day)</li>
                          <li>• <strong>Minimum Lot:</strong> ₫100,000 face value</li>
                          <li>• <strong>Liquidity:</strong> High for popular maturities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Corporate Bonds Detailed Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-purple-600" />
                    Corporate Bonds - Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-purple-800 mb-4">Types of Corporate Bonds</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-700">Bank Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Issuers: Vietcombank, BIDV, Techcom Bank</li>
                            <li>• Maturity: 2-10 years</li>
                            <li>• Yield: 6-9% annually</li>
                            <li>• Risk: Low-Medium</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-700">Real Estate Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Issuers: Vingroup, Novaland, Hoa Phat</li>
                            <li>• Maturity: 3-7 years</li>
                            <li>• Yield: 8-12% annually</li>
                            <li>• Risk: Medium-High</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-700">Infrastructure Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Issuers: EVN, PVN, VNPT</li>
                            <li>• Maturity: 5-15 years</li>
                            <li>• Yield: 7-10% annually</li>
                            <li>• Risk: Medium</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                          <h5 className="font-semibold text-purple-700">Manufacturing Bonds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Issuers: Vinamilk, Sabeco, Masan</li>
                            <li>• Maturity: 3-8 years</li>
                            <li>• Yield: 7-11% annually</li>
                            <li>• Risk: Medium</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-orange-800 mb-4">How to Buy Corporate Bonds</h4>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-2">Step-by-Step Process</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Preparation:</p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                              <li>Research bond issuers and ratings</li>
                              <li>Understand your risk tolerance</li>
                              <li>Calculate required investment amount</li>
                              <li>Prepare necessary documents</li>
                            </ol>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Execution:</p>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                              <li>Open account with securities firm</li>
                              <li>Complete risk assessment</li>
                              <li>Fund your account</li>
                              <li>Place buy order</li>
                              <li>Monitor your investment</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-700 mb-2">Key Platforms & Brokers</h5>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Digital Platforms:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>TCInvest:</strong> Techcom Bank app</li>
                              <li>• <strong>VNDirect:</strong> Mobile trading</li>
                              <li>• <strong>SSI iTrade:</strong> SSI mobile app</li>
                              <li>• <strong>VPS Mobile:</strong> VPS trading app</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Full-Service Brokers:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>SSI:</strong> Research & advisory</li>
                              <li>• <strong>VPS:</strong> Strong analysis team</li>
                              <li>• <strong>Mirae Asset:</strong> International expertise</li>
                              <li>• <strong>ACBS:</strong> Comprehensive services</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Bank Channels:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Vietcombank:</strong> Wealth management</li>
                              <li>• <strong>BIDV:</strong> Investment services</li>
                              <li>• <strong>Techcom Bank:</strong> Digital banking</li>
                              <li>• <strong>MSB:</strong> Private banking</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-red-800 mb-4">Risk Assessment & Due Diligence</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-red-700 mb-2">Credit Risk Factors</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Company Financials:</strong> Revenue, profit, debt levels</li>
                          <li>• <strong>Industry Outlook:</strong> Sector growth prospects</li>
                          <li>• <strong>Management Quality:</strong> Track record, governance</li>
                          <li>• <strong>Market Position:</strong> Competitive advantages</li>
                          <li>• <strong>Economic Environment:</strong> Macro factors</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-red-700 mb-2">Rating Agencies</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>FiinRatings:</strong> Local rating agency</li>
                          <li>• <strong>VNRating:</strong> Vietnamese credit ratings</li>
                          <li>• <strong>Moody's:</strong> International ratings</li>
                          <li>• <strong>S&P:</strong> Global credit analysis</li>
                          <li>• <strong>Fitch:</strong> Credit risk assessment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bond Funds Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-600" />
                    Bond Funds - Complete Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Types of Bond Funds</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700">Government Bond Funds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• <strong>Focus:</strong> 100% government bonds</li>
                            <li>• <strong>Risk:</strong> Very Low</li>
                            <li>• <strong>Yield:</strong> 4-6% annually</li>
                            <li>• <strong>Examples:</strong> VinaCapital Gov Bond Fund</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700">Corporate Bond Funds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• <strong>Focus:</strong> High-grade corporate bonds</li>
                            <li>• <strong>Risk:</strong> Low-Medium</li>
                            <li>• <strong>Yield:</strong> 6-8% annually</li>
                            <li>• <strong>Examples:</strong> Dragon Capital Bond Fund</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700">Balanced Bond Funds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• <strong>Focus:</strong> Mix of gov & corporate bonds</li>
                            <li>• <strong>Risk:</strong> Medium</li>
                            <li>• <strong>Yield:</strong> 7-9% annually</li>
                            <li>• <strong>Examples:</strong> TCBF (Techcom Capital)</li>
                          </ul>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold text-green-700">High-Yield Bond Funds</h5>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• <strong>Focus:</strong> Higher risk corporate bonds</li>
                            <li>• <strong>Risk:</strong> Medium-High</li>
                            <li>• <strong>Yield:</strong> 8-12% annually</li>
                            <li>• <strong>Examples:</strong> VinaCapital High Yield Fund</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">How to Invest in Bond Funds</h4>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Investment Methods</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Direct Investment:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Contact fund management companies</li>
                              <li>• Complete subscription forms</li>
                              <li>• Transfer funds directly</li>
                              <li>• Receive fund certificates</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Through Intermediaries:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Banks (distribution partners)</li>
                              <li>• Securities companies</li>
                              <li>• Financial advisors</li>
                              <li>• Online platforms</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Major Fund Management Companies</h5>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Leading Firms:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>VinaCapital:</strong> Largest fund manager</li>
                              <li>• <strong>Dragon Capital:</strong> International expertise</li>
                              <li>• <strong>Techcom Capital:</strong> Techcom Bank subsidiary</li>
                              <li>• <strong>Mirae Asset:</strong> Korean expertise</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Specialized Firms:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>SSI Asset Management:</strong> SSI subsidiary</li>
                              <li>• <strong>VPS Fund Management:</strong> VPS subsidiary</li>
                              <li>• <strong>ACBS Fund Management:</strong> ACBS subsidiary</li>
                              <li>• <strong>BIDV Fund Management:</strong> BIDV subsidiary</li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Bank Distribution:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Vietcombank:</strong> Wealth management</li>
                              <li>• <strong>BIDV:</strong> Investment services</li>
                              <li>• <strong>Techcom Bank:</strong> Digital platform</li>
                              <li>• <strong>HSBC:</strong> International services</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-purple-800 mb-4">Fund Investment Considerations</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-purple-700 mb-2">Costs & Fees</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Management Fee:</strong> 0.5-2% annually</li>
                          <li>• <strong>Subscription Fee:</strong> 0-2% upfront</li>
                          <li>• <strong>Redemption Fee:</strong> 0-1% (if early)</li>
                          <li>• <strong>Custody Fee:</strong> 0.1-0.3% annually</li>
                          <li>• <strong>Performance Fee:</strong> 10-20% of excess returns</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-700 mb-2">Advantages vs Direct Investment</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Diversification:</strong> Multiple bonds in one fund</li>
                          <li>• <strong>Professional Management:</strong> Expert fund managers</li>
                          <li>• <strong>Lower Minimums:</strong> Start with ₫1M-10M</li>
                          <li>• <strong>Liquidity:</strong> Daily redemption available</li>
                          <li>• <strong>Convenience:</strong> No need to track individual bonds</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practical Steps Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <Target className="h-6 w-6 text-orange-600" />
                    Step-by-Step Investment Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-orange-800 mb-4">Getting Started Checklist</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-orange-700 mb-3">Before You Start</h5>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Assess Your Financial Situation</span>
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1 ml-6">
                              <li>• Calculate available investment capital</li>
                              <li>• Determine investment timeline</li>
                              <li>• Assess risk tolerance</li>
                              <li>• Set investment goals</li>
                            </ul>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Prepare Required Documents</span>
                            </div>
                            <ul className="text-xs text-gray-600 space-y-1 ml-6">
                              <li>• National ID card/Passport</li>
                              <li>• Bank account statements</li>
                              <li>• Income verification</li>
                              <li>• Tax identification number</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-700 mb-3">Account Opening Process</h5>
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Step 1: Choose Platform</span>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">Research and select securities firm or bank</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Step 2: Complete KYC</span>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">Submit documents and complete verification</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Step 3: Fund Account</span>
                            </div>
                            <p className="text-xs text-gray-600 ml-6">Transfer initial investment amount</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">Investment Strategy Recommendations</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Conservative Strategy</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 70% Government bonds</li>
                          <li>• 20% High-grade corporate bonds</li>
                          <li>• 10% Bond funds</li>
                          <li>• Expected return: 5-7%</li>
                          <li>• Risk level: Low</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Moderate Strategy</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 40% Government bonds</li>
                          <li>• 40% Corporate bonds</li>
                          <li>• 20% Bond funds</li>
                          <li>• Expected return: 7-9%</li>
                          <li>• Risk level: Medium</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-700 mb-2">Aggressive Strategy</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 20% Government bonds</li>
                          <li>• 50% Corporate bonds</li>
                          <li>• 30% High-yield funds</li>
                          <li>• Expected return: 8-12%</li>
                          <li>• Risk level: High</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Monitoring & Management</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">Regular Monitoring</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Monthly:</strong> Review portfolio performance</li>
                          <li>• <strong>Quarterly:</strong> Assess market conditions</li>
                          <li>• <strong>Annually:</strong> Rebalance portfolio</li>
                          <li>• <strong>As needed:</strong> Adjust for life changes</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-700 mb-2">Key Metrics to Track</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>Total Return:</strong> Capital gains + interest</li>
                          <li>• <strong>Yield:</strong> Annual income percentage</li>
                          <li>• <strong>Duration:</strong> Interest rate sensitivity</li>
                          <li>• <strong>Credit Quality:</strong> Bond ratings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources & Support Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-indigo-600" />
                    Resources & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-indigo-800 mb-4">Useful Resources</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-indigo-700 mb-2">Official Sources</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>State Securities Commission:</strong> ssc.gov.vn</li>
                          <li>• <strong>State Treasury:</strong> kho-bac.gov.vn</li>
                          <li>• <strong>Vietnam Bond Market Association:</strong> vnba.org.vn</li>
                          <li>• <strong>Hanoi Stock Exchange:</strong> hnx.vn</li>
                          <li>• <strong>Ho Chi Minh Stock Exchange:</strong> hnx.vn</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-indigo-700 mb-2">Financial News & Analysis</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>VnExpress:</strong> vnexpress.net</li>
                          <li>• <strong>Tuổi Trẻ:</strong> tuoitre.vn</li>
                          <li>• <strong>Vietnam Investment Review:</strong> vir.com.vn</li>
                          <li>• <strong>Saigon Times:</strong> thesaigontimes.vn</li>
                          <li>• <strong>Financial Times Vietnam:</strong> ft.com</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-800 mb-4">Getting Help</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          Customer Support
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• <strong>SSI:</strong> 1900 636 999</li>
                          <li>• <strong>VNDirect:</strong> 1900 545 596</li>
                          <li>• <strong>TCBS:</strong> 1900 636 999</li>
                          <li>• <strong>VPS:</strong> 1900 545 596</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-600" />
                          Online Support
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Live chat on platforms</li>
                          <li>• Email support</li>
                          <li>• Video consultations</li>
                          <li>• Mobile app support</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          Branch Offices
                        </h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Major cities nationwide</li>
                          <li>• Shopping centers</li>
                          <li>• Business districts</li>
                          <li>• Bank branches</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Comparative Analysis */}
          <TabsContent value="analysis">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Options Comparison</CardTitle>
                  <CardDescription>
                    Detailed comparison of all three investment options over a 10-year horizon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Option</TableHead>
                        <TableHead>10-Year FV (Nominal)</TableHead>
                        <TableHead>Nominal Return (CAGR)</TableHead>
                        <TableHead>Real Return (CAGR)</TableHead>
                        <TableHead>Current Yield</TableHead>
                        <TableHead>YTM</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          <span className="text-blue-600">Option A</span>
                          <br />
                          <span className="text-sm text-gray-500">Government Bond</span>
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(investmentData.optionA.fv)}</TableCell>
                        <TableCell>{investmentData.optionA.nominalReturn}%</TableCell>
                        <TableCell>{investmentData.optionA.realReturn}%</TableCell>
                        <TableCell>{investmentData.optionA.currentYield}%</TableCell>
                        <TableCell>{investmentData.optionA.ytm}%</TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {bondAnalytics.optionA.macaulayDuration.toFixed(2)} yrs
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            {investmentData.optionA.risk}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <span className="text-purple-600">Option B</span>
                          <br />
                          <span className="text-sm text-gray-500">Corporate Bond</span>
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(investmentData.optionB.fv)}</TableCell>
                        <TableCell>{investmentData.optionB.nominalReturn}%</TableCell>
                        <TableCell>{investmentData.optionB.realReturn}%</TableCell>
                        <TableCell>{investmentData.optionB.currentYield}%</TableCell>
                        <TableCell>{investmentData.optionB.ytm}%</TableCell>
                        <TableCell className="font-semibold text-purple-600">
                          {bondAnalytics.optionB.macaulayDuration.toFixed(2)} yrs
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            {investmentData.optionB.risk}
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <span className="text-green-600">Option C</span>
                          <br />
                          <span className="text-sm text-gray-500">Balanced Fund</span>
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(investmentData.optionC.fv)}</TableCell>
                        <TableCell>{investmentData.optionC.nominalReturn}%</TableCell>
                        <TableCell>{investmentData.optionC.realReturn}%</TableCell>
                        <TableCell>{investmentData.optionC.currentYield}%</TableCell>
                        <TableCell>{investmentData.optionC.ytm}%</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {bondAnalytics.optionC.macaulayDuration.toFixed(2)} yrs
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            {investmentData.optionC.risk}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>10-Year Future Value Comparison</CardTitle>
                  <CardDescription>
                    Visual comparison of projected future values for all investment options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={fvComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="fv" radius={[8, 8, 0, 0]}>
                        {fvComparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Alert>
                <TrendingUp className="h-5 w-5 inline-block mr-2" />
                <AlertTitle>Key Insights</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-2">
                    <li><strong>Option C (Balanced Fund)</strong> offers the highest projected future value (₫473M) due to its equity exposure and professional management.</li>
                    <li><strong>Option B (Corporate Bond)</strong> provides a middle ground (₫427M) with higher yields than government bonds but lower volatility than equity-heavy funds.</li>
                    <li><strong>Option A (Government Bond)</strong> offers the most stability (₫332M) and is backed by the Vietnamese government, making it suitable for conservative investors.</li>
                    <li>Real returns (adjusted for 4% inflation) show that all options provide positive inflation-adjusted returns, with Option C leading at 4.81% real CAGR.</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* Tab 3: Portfolio Allocation */}
          <TabsContent value="portfolio">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Portfolio Allocation</CardTitle>
                  <CardDescription>
                    Diversified portfolio designed for Ms. An's moderate risk profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Pie Chart */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-center">Portfolio Mix</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={100}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Government Bond (A)</span>
                          <span className="text-lg font-bold text-blue-600">{portfolioAllocation.optionA}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium">Corporate Bond (B)</span>
                          <span className="text-lg font-bold text-purple-600">{portfolioAllocation.optionB}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Balanced Fund (C)</span>
                          <span className="text-lg font-bold text-green-600">{portfolioAllocation.optionC}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Rationale */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Allocation Rationale</h4>
                      <div className="prose max-w-none space-y-4">
                        <p className="text-gray-700">
                          This portfolio balances Ms. An's <strong>moderate risk profile</strong> with her <strong>10-year investment horizon</strong>. 
                          The allocation provides diversification across asset classes and risk levels.
                        </p>

                        <div className="space-y-3">
                          <div className="border-l-4 border-blue-500 pl-4">
                            <h5 className="font-semibold text-blue-600">20% Government Bond (Option A)</h5>
                            <p className="text-sm text-gray-600">
                              Provides <strong>stability and capital preservation</strong>. Acts as a defensive anchor 
                              during market volatility. Backed by the Vietnamese government with virtually no default risk.
                            </p>
                          </div>

                          <div className="border-l-4 border-purple-500 pl-4">
                            <h5 className="font-semibold text-purple-600">40% Corporate Bond (Option B)</h5>
                            <p className="text-sm text-gray-600">
                              Provides <strong>higher, stable income</strong> through semi-annual coupon payments. 
                              If accessible directly or via fund, offers better yields than government bonds while 
                              maintaining fixed-income characteristics.
                            </p>
                          </div>

                          <div className="border-l-4 border-green-500 pl-4">
                            <h5 className="font-semibold text-green-600">40% Balanced Fund (Option C)</h5>
                            <p className="text-sm text-gray-600">
                              Provides <strong>diversification and highest growth potential</strong> through its 
                              20% equity exposure. Professional fund management and liquidity make it suitable for 
                              long-term wealth accumulation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance Metrics</CardTitle>
                  <CardDescription>
                    Expected returns and risk characteristics of the recommended portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <h5 className="text-sm text-gray-600 mb-2">Weighted Expected Nominal Return</h5>
                      <p className="text-4xl font-bold text-blue-600 mb-2">{portfolioMetrics.weightedNominalReturn}%</p>
                      <p className="text-sm text-gray-600">
                        = (20% × 5.21%) + (40% × 7.91%) + (40% × 9.00%)
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
                      <h5 className="text-sm text-gray-600 mb-2">Weighted Expected Real Return</h5>
                      <p className="text-4xl font-bold text-green-600 mb-2">{portfolioMetrics.weightedRealReturn}%</p>
                      <p className="text-sm text-gray-600">
                        = (1.0781 / 1.04) - 1 (inflation-adjusted)
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold mb-3">Portfolio Advantages</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Diversification:</strong> Spreads risk across government-backed securities, corporate debt, and equity markets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Risk-Adjusted Returns:</strong> Balances growth potential with downside protection</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Accessibility:</strong> Options A and C are readily available to retail investors</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Inflation Protection:</strong> Real return of 3.66% exceeds inflation target</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Monte Carlo Simulation */}
          <TabsContent value="monte-carlo">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monte Carlo Simulation (10,000 Trials)</CardTitle>
                  <CardDescription>
                    Probabilistic analysis of investment outcomes over 10 years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold mb-3">Simulation Parameters</h5>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Option C (Balanced Fund)</h6>
                          <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Mean Annual Return (μ): <strong>9.0%</strong></li>
                            <li>• Standard Deviation (σ): <strong>12.0%</strong></li>
                            <li>• Distribution: Normal (log-normal for returns)</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Proposed Portfolio (20/40/40)</h6>
                          <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Mean Annual Return (μ): <strong>7.81%</strong></li>
                            <li>• Standard Deviation (σ): <strong>4.8%</strong></li>
                            <li>• Lower volatility due to bond allocation</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        onClick={runMonteCarloSimulation}
                        disabled={isSimulating}
                        className="px-8 py-3"
                      >
                        {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
                      </Button>
                    </div>

                    {simulationResults && (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Monte Carlo Simulation Paths</CardTitle>
                            <CardDescription>
                              100 sample paths from 10,000 simulations showing possible 10-year trajectories
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h6 className="font-semibold text-sm mb-3 text-center text-green-600">Option C (Fund) - Sample Paths</h6>
                                <ResponsiveContainer width="100%" height={350}>
                                  <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      type="number"
                                      dataKey="year" 
                                      domain={[0, 10]}
                                      interval="preserveStartEnd"
                                      label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                      tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                                      label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip 
                                      formatter={(value) => formatCurrency(value)}
                                      labelFormatter={(value) => `Year ${value}`}
                                    />
                                    {simulationResults.optionC.paths.map((path, idx) => (
                                      <Line 
                                        key={idx}
                                        data={path}
                                        type="linear" 
                                        dataKey="value" 
                                        stroke="#10b981" 
                                        strokeWidth={0.5}
                                        opacity={0.2}
                                        dot={false}
                                        isAnimationActive={false}
                                        connectNulls={false}
                                      />
                                    ))}
                                    <Line 
                                      data={simulationResults.avgPathData}
                                      type="monotone" 
                                      dataKey="optionC_expected" 
                                      stroke="#059669" 
                                      strokeWidth={3}
                                      dot={false}
                                      name="Expected Path"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h6 className="font-semibold text-sm mb-3 text-center text-blue-600">Portfolio - Sample Paths</h6>
                                <ResponsiveContainer width="100%" height={350}>
                                  <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      type="number"
                                      dataKey="year" 
                                      domain={[0, 10]}
                                      interval="preserveStartEnd"
                                      label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis 
                                      tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                                      label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip 
                                      formatter={(value) => formatCurrency(value)}
                                      labelFormatter={(value) => `Year ${value}`}
                                    />
                                    {simulationResults.portfolio.paths.map((path, idx) => (
                                      <Line 
                                        key={idx}
                                        data={path}
                                        type="linear" 
                                        dataKey="value" 
                                        stroke="#3b82f6" 
                                        strokeWidth={0.5}
                                        opacity={0.2}
                                        dot={false}
                                        isAnimationActive={false}
                                        connectNulls={false}
                                      />
                                    ))}
                                    <Line 
                                      data={simulationResults.avgPathData}
                                      type="monotone" 
                                      dataKey="portfolio_expected" 
                                      stroke="#1d4ed8" 
                                      strokeWidth={3}
                                      dot={false}
                                      name="Expected Path"
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4 text-center">
                              Each thin line represents one possible 10-year outcome. The thick line shows the expected (mean) path. 
                              Notice how the Portfolio paths are tighter (less spread) than Option C, demonstrating lower volatility.
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                          <CardHeader>
                            <CardTitle className="text-lg">Simulation Results</CardTitle>
                            <CardDescription>
                              Percentile outcomes after 10 years (10,000 Monte Carlo trials)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Percentile</TableHead>
                                  <TableHead>Scenario</TableHead>
                                  <TableHead>Option C (Fund)</TableHead>
                                  <TableHead>Proposed Portfolio</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-bold">5th</TableCell>
                                  <TableCell className="text-red-600 font-medium">Worst Case</TableCell>
                                  <TableCell className="font-bold text-red-600">
                                    {formatCurrency(simulationResults.optionC.p5)}
                                  </TableCell>
                                  <TableCell className="font-bold text-red-600">
                                    {formatCurrency(simulationResults.portfolio.p5)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-bold">50th</TableCell>
                                  <TableCell className="text-blue-600 font-medium">Median</TableCell>
                                  <TableCell className="font-bold text-blue-600">
                                    {formatCurrency(simulationResults.optionC.p50)}
                                  </TableCell>
                                  <TableCell className="font-bold text-blue-600">
                                    {formatCurrency(simulationResults.portfolio.p50)}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="font-bold">95th</TableCell>
                                  <TableCell className="text-green-600 font-medium">Best Case</TableCell>
                                  <TableCell className="font-bold text-green-600">
                                    {formatCurrency(simulationResults.optionC.p95)}
                                  </TableCell>
                                  <TableCell className="font-bold text-green-600">
                                    {formatCurrency(simulationResults.portfolio.p95)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>

                            <div className="mt-6 grid md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg">
                                <h6 className="font-semibold text-sm text-gray-700 mb-2">Range (5th to 95th percentile)</h6>
                                <p className="text-sm text-gray-600">
                                  <strong>Option C:</strong> {formatCurrency(simulationResults.optionC.p5)} to {formatCurrency(simulationResults.optionC.p95)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Portfolio:</strong> {formatCurrency(simulationResults.portfolio.p5)} to {formatCurrency(simulationResults.portfolio.p95)}
                                </p>
                              </div>
                              <div className="p-4 bg-white rounded-lg">
                                <h6 className="font-semibold text-sm text-gray-700 mb-2">Protection Comparison (5th percentile)</h6>
                                <p className="text-sm text-gray-600">
                                  Portfolio provides <strong className="text-green-600">
                                    {formatCurrency(simulationResults.portfolio.p5 - simulationResults.optionC.p5)}
                                  </strong> more downside protection in worst-case scenarios
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Alert>
                          <AlertCircle className="h-5 w-5 inline-block mr-2" />
                          <AlertTitle>Key Takeaways from Monte Carlo Analysis</AlertTitle>
                          <AlertDescription>
                            <div className="mt-2 space-y-2 text-sm">
                              <p>
                                <strong>1. Higher Median for Option C:</strong> The balanced fund (Option C) shows a higher median outcome 
                                ({formatCurrency(simulationResults.optionC.p50)} vs {formatCurrency(simulationResults.portfolio.p50)}), 
                                reflecting its higher expected return of 9%.
                              </p>
                              <p>
                                <strong>2. Better Downside Protection for Portfolio:</strong> The proposed portfolio significantly outperforms 
                                in the worst-case scenario (5th percentile: {formatCurrency(simulationResults.portfolio.p5)} vs {formatCurrency(simulationResults.optionC.p5)}). 
                                This demonstrates the power of diversification in managing downside risk.
                              </p>
                              <p>
                                <strong>3. Narrower Distribution:</strong> The portfolio's lower volatility (4.8% vs 12.0%) results in a 
                                tighter range of outcomes, providing more predictable results—ideal for a moderate-risk investor like Ms. An.
                              </p>
                              <p>
                                <strong>4. Risk-Adjusted Recommendation:</strong> While Option C offers higher upside potential, the proposed 
                                portfolio better aligns with Ms. An's moderate risk tolerance by sacrificing some upside for substantial 
                                downside protection and more consistent outcomes.
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                        <Card className="bg-white">
                          <CardHeader>
                            <CardTitle className="text-lg">Distribution Visualization</CardTitle>
                            <CardDescription>
                              Frequency distribution of 10-year outcomes (10,000 trials)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h6 className="font-semibold text-sm mb-3 text-center text-green-600">Option C (Fund) Distribution</h6>
                                <ResponsiveContainer width="100%" height={250}>
                                  <AreaChart data={simulationResults.optionC.histogram}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="value" 
                                      tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                                      tick={{ fontSize: 10 }}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip 
                                      formatter={(value) => [`${value} trials`, 'Frequency']}
                                      labelFormatter={(value) => `Value: ${formatCurrency(value)}`}
                                    />
                                    <Area type="monotone" dataKey="Option C" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                              <div>
                                <h6 className="font-semibold text-sm mb-3 text-center text-blue-600">Portfolio Distribution</h6>
                                <ResponsiveContainer width="100%" height={250}>
                                  <AreaChart data={simulationResults.portfolio.histogram}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="value" 
                                      tickFormatter={(value) => `₫${(value / 1000000).toFixed(0)}M`}
                                      tick={{ fontSize: 10 }}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip 
                                      formatter={(value) => [`${value} trials`, 'Frequency']}
                                      labelFormatter={(value) => `Value: ${formatCurrency(value)}`}
                                    />
                                    <Area type="monotone" dataKey="Portfolio" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4 text-center">
                              Notice how the Portfolio distribution is narrower (less spread) than Option C, 
                              demonstrating reduced volatility and more predictable outcomes.
                            </p>
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {!simulationResults && (
                      <div className="text-center py-12 text-gray-500">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>Click "Run Simulation" to see probabilistic outcomes</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Understanding Monte Carlo Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-sm text-gray-700">
                    <p>
                      Monte Carlo simulation is a computational technique that uses random sampling to model the probability 
                      of different outcomes in complex systems. For investment analysis, it helps us understand:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li><strong>Range of Possible Outcomes:</strong> Rather than a single projected value, we see the full spectrum from worst-case to best-case scenarios.</li>
                      <li><strong>Probability Distributions:</strong> The simulation shows not just what might happen, but how likely different outcomes are.</li>
                      <li><strong>Risk Quantification:</strong> By examining percentiles (e.g., 5th percentile = worst 5% of outcomes), we can quantify downside risk.</li>
                      <li><strong>Portfolio Comparison:</strong> We can compare how different investment strategies perform under uncertainty.</li>
                    </ul>
                    <p className="mt-3">
                      In this analysis, each of the 10,000 trials simulates 10 years of investment returns using randomly generated 
                      annual returns based on the expected mean and standard deviation. This approach accounts for the inherent 
                      volatility in financial markets and provides a more realistic picture than simple compound interest calculations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Chatbot Button - Enhanced UI */}
        <div className="fixed bottom-6 right-6 z-50">
          {!chatOpen ? (
            <div className="flex items-center gap-4">
              {/* Speech Bubble */}
              <div className="relative animate-bounce">
                <div className="bg-white px-5 py-3 rounded-2xl shadow-xl border-2 border-purple-300 relative">
                  <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                    Cô Linh ơi, cô có cần giúp gì không ạ? 💕
                  </p>
                  {/* Arrow pointing to the button */}
                  <div className="absolute right-[-10px] top-1/2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[10px] border-l-purple-300 border-b-[10px] border-b-transparent"></div>
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-white border-b-[8px] border-b-transparent absolute right-[2px] top-1/2 transform -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              
              {/* Chat Button */}
              <Button
                onClick={() => setChatOpen(true)}
                className="rounded-full w-20 h-20 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 animate-pulse"
              >
                <MessageCircle className="w-8 h-8" />
              </Button>
            </div>
          ) : (
            <Card className="w-[450px] h-[650px] flex flex-col shadow-2xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Bình Béo nhóm 3 💕</CardTitle>
                      <CardDescription className="text-blue-100 text-xs">Your Gen Z Investment Buddy ✨</CardDescription>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatOpen(false)} 
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-purple-600" />
                    </div>
                    <h6 className="font-semibold text-gray-700 mb-2">Hỏi Béo bất cứ điều gì nèee cô! 🤗</h6>
                    <p className="text-sm text-gray-500 mb-4">Béo sẽ defend mọi insight và data trên website này bằng mọi giá! 🔥✨</p>
                    <div className="space-y-2">
                      <button 
                        onClick={() => sendMessageToGemini("Chứng minh cho tôi tại sao portfolio 20/40/40 là tối ưu nhất!")}
                        className="block w-full text-left p-3 text-sm bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-blue-100 transition-all"
                      >
                        <span className="text-blue-600 font-medium">🏆</span> Tại sao portfolio 20/40/40 là GOAT?
                      </button>
                      <button 
                        onClick={() => sendMessageToGemini("YTM của Option A tính như nào? Chứng minh tính toán này đúng nha!")}
                        className="block w-full text-left p-3 text-sm bg-white hover:bg-purple-50 rounded-lg shadow-sm border border-purple-100 transition-all"
                      >
                        <span className="text-purple-600 font-medium">📊</span> YTM được tính như thế nào?
                      </button>
                      <button 
                        onClick={() => sendMessageToGemini("Defend tại sao đa dạng hóa vượt trội hơn option đơn lẻ!")}
                        className="block w-full text-left p-3 text-sm bg-white hover:bg-green-50 rounded-lg shadow-sm border border-green-100 transition-all"
                      >
                        <span className="text-green-600 font-medium">📈</span> Tại sao đa dạng hóa vượt trội?
                      </button>
                      <button 
                        onClick={() => sendMessageToGemini("Prove rằng Monte Carlo simulation ở đây hoàn toàn chính xác!")}
                        className="block w-full text-left p-3 text-sm bg-white hover:bg-orange-50 rounded-lg shadow-sm border border-orange-100 transition-all"
                      >
                        <span className="text-orange-600 font-medium">🎲</span> Monte Carlo đáng tin cậy thế nào?
                      </button>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm' 
                        : 'bg-white text-gray-800 border-2 border-purple-100 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-200">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-bold">🐻</span>
                          </div>
                          <span className="text-xs font-semibold text-gray-700">Bình Béo 💕</span>
                        </div>
                      )}
                      {msg.role === 'assistant' ? (
                        <div className="text-sm leading-relaxed">
                          <FormattedAIResponse content={msg.content} />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-3 pt-2 border-t border-opacity-20" style={{borderColor: msg.role === 'user' ? 'white' : '#e5e7eb'}}>
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoadingResponse && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-sm text-gray-600">Béo đang suy nghĩ nèeee... 🤔</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Hỏi Béo về bất kỳ data nào ạ... 💭"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isLoadingResponse}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoadingResponse || !inputMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ấn Enter để gửi • Béo sẽ defend mọi kết luận! 🔥
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VnInvestmentAnalyzer;

