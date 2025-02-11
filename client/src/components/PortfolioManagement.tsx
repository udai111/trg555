import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Portfolio {
  id: number;
  name: string;
  cash_balance: number;
  total_value: number;
  holdings: StockHolding[];
  performance: PerformanceData[];
}

interface StockHolding {
  symbol: string;
  company: string;
  quantity: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

interface PerformanceData {
  date: string;
  value: number;
}

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const mockPortfolio: Portfolio = {
      id: 1,
      name: "Growth & Tech Portfolio",
      cash_balance: 25478.92,
      total_value: 157892.45,
      holdings: [
        {
          symbol: "AAPL",
          company: "Apple Inc.",
          quantity: 85,
          current_price: 187.68,
          total_value: 15952.80,
          profit_loss: 3245.60,
          profit_loss_percentage: 25.5
        },
        {
          symbol: "MSFT",
          company: "Microsoft Corporation",
          quantity: 45,
          current_price: 420.55,
          total_value: 18924.75,
          profit_loss: 4567.25,
          profit_loss_percentage: 31.8
        },
        {
          symbol: "GOOGL",
          company: "Alphabet Inc.",
          quantity: 32,
          current_price: 142.85,
          total_value: 45712.00,
          profit_loss: 8923.84,
          profit_loss_percentage: 15.2
        },
        {
          symbol: "NVDA",
          company: "NVIDIA Corporation",
          quantity: 65,
          current_price: 721.28,
          total_value: 46883.20,
          profit_loss: 12445.85,
          profit_loss_percentage: 42.3
        }
      ],
      performance: generatePerformanceData(),
    };
    setPortfolios([mockPortfolio]);
    setSelectedPortfolio(mockPortfolio);
  }, []);

  const StockHoldingCard = ({ holding }: { holding: StockHolding }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{holding.symbol}</h3>
          <p className="text-sm text-muted-foreground">
            {holding.company}
          </p>
          <p className="text-sm mt-1">
            {holding.quantity} shares @ ${holding.current_price.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${holding.total_value.toLocaleString()}</p>
          <div className={`flex items-center justify-end gap-1 text-sm ${holding.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <span>{holding.profit_loss >= 0 ? '+' : ''}{holding.profit_loss.toLocaleString()}</span>
            <span>({holding.profit_loss_percentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>
        <Button>
          <Wallet className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              ${selectedPortfolio?.total_value.toLocaleString()}
            </p>
            <p className="text-sm text-green-500">+28.4% all time</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Cash Balance</h3>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              ${selectedPortfolio?.cash_balance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Available for trading</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Today's Change</h3>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-500">+$3,892.50</p>
            <p className="text-sm text-muted-foreground">+2.8% today</p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedPortfolio?.performance}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="holdings">
          <div className="space-y-4">
            {selectedPortfolio?.holdings.map((holding, index) => (
              <StockHoldingCard key={index} holding={holding} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {generateMockTransactions().map((transaction, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{transaction.type} {transaction.symbol}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${transaction.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{transaction.shares} shares @ ${transaction.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to generate performance data
const generatePerformanceData = () => {
  const baseValue = 140000;
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: baseValue + Math.random() * 20000 + i * 1000,
  }));
};

// Helper function to generate mock transactions
const generateMockTransactions = () => [
  {
    type: "Buy",
    symbol: "NVDA",
    shares: 15,
    price: 715.45,
    amount: 10731.75,
    date: "2024-02-10"
  },
  {
    type: "Sell",
    symbol: "AAPL",
    shares: 10,
    price: 185.85,
    amount: 1858.50,
    date: "2024-02-09"
  },
  {
    type: "Buy",
    symbol: "MSFT",
    shares: 8,
    price: 415.25,
    amount: 3322.00,
    date: "2024-02-08"
  }
];

export default PortfolioManagement;