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
  quantity: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
}

interface PerformanceData {
  date: string;
  value: number;
}

const PortfolioManagement = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockPortfolio: Portfolio = {
      id: 1,
      name: "My Growth Portfolio",
      cash_balance: 10000,
      total_value: 25000,
      holdings: [
        {
          symbol: "AAPL",
          quantity: 10,
          current_price: 150,
          total_value: 1500,
          profit_loss: 200,
        },
        {
          symbol: "GOOGL",
          quantity: 5,
          current_price: 2800,
          total_value: 14000,
          profit_loss: 1000,
        },
      ],
      performance: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: 20000 + Math.random() * 10000,
      })),
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
            {holding.quantity} shares
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${holding.total_value.toLocaleString()}</p>
          <p className={`text-sm ${holding.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {holding.profit_loss >= 0 ? '+' : ''}{holding.profit_loss.toLocaleString()}
          </p>
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
            <p className="text-sm text-green-500">+15.3% all time</p>
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
            <p className="text-2xl font-bold text-green-500">+$892.50</p>
            <p className="text-sm text-muted-foreground">+3.2% today</p>
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
                  <YAxis />
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
              <p className="text-muted-foreground text-center">
                No recent transactions
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManagement;
