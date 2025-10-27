import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Info, TrendingUp, AlertCircle, PieChartIcon, BarChart3, FileText, MessageCircle, Send, X } from 'lucide-react';

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

  // Monte Carlo Simulation
  const runMonteCarloSimulation = () => {
    setIsSimulating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const trials = 10000;
      const years = 10;
      
      // Parameters
      const optionC_mean = 0.09; // 9%
      const optionC_stdDev = 0.12; // 12%
      
      const portfolio_mean = 0.0781; // 7.81%
      const portfolio_stdDev = 0.048; // 4.8%
      
      const optionC_results = [];
      const portfolio_results = [];
      
      for (let i = 0; i < trials; i++) {
        // Generate random annual returns for 10 years and compound
        let optionC_value = initialInvestment;
        let portfolio_value = initialInvestment;
        
        for (let year = 0; year < years; year++) {
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
      
      setSimulationResults({
        optionC: {
          p5: getPercentile(optionC_results, 0.05),
          p50: getPercentile(optionC_results, 0.50),
          p95: getPercentile(optionC_results, 0.95),
          histogram: optionC_histogram,
        },
        portfolio: {
          p5: getPercentile(portfolio_results, 0.05),
          p50: getPercentile(portfolio_results, 0.50),
          p95: getPercentile(portfolio_results, 0.95),
          histogram: portfolio_histogram,
        },
      });
      
      setIsSimulating(false);
    }, 100);
  };

  const formatCurrency = (value) => {
    return `₫${(value / 1000000).toFixed(0)}M`;
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

Please provide a clear, educational explanation to help understand the calculations and investment concepts. Use Vietnamese currency (₫) and be specific with numbers from the data above.`;

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
            </div>
          </TabsContent>

          {/* Tab 2: Comparative Analysis */}
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

        {/* AI Chatbot Button */}
        <div className="fixed bottom-6 right-6 z-50">
          {!chatOpen ? (
            <Button
              onClick={() => setChatOpen(true)}
              className="rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          ) : (
            <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg text-white">AI Investment Assistant</CardTitle>
                    <CardDescription className="text-blue-100 text-xs">Powered by Google Gemini</CardDescription>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20 rounded p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Ask me anything about the investment calculations!</p>
                    <div className="mt-4 space-y-2">
                      <button 
                        onClick={() => sendMessageToGemini("How is the YTM calculated for Option A?")}
                        className="block w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded"
                      >
                        How is YTM calculated for Option A?
                      </button>
                      <button 
                        onClick={() => sendMessageToGemini("Explain the Monte Carlo simulation")}
                        className="block w-full text-left p-2 text-xs bg-purple-50 hover:bg-purple-100 rounded"
                      >
                        Explain the Monte Carlo simulation
                      </button>
                      <button 
                        onClick={() => sendMessageToGemini("Why is the portfolio less risky?")}
                        className="block w-full text-left p-2 text-xs bg-green-50 hover:bg-green-100 rounded"
                      >
                        Why is the portfolio less risky?
                      </button>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoadingResponse && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Thinking...</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about calculations..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isLoadingResponse}
                  />
                  <Button type="submit" disabled={isLoadingResponse || !inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VnInvestmentAnalyzer;

