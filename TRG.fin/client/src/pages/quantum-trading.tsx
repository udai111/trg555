import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brain, Cpu, Database, GitBranch, LineChart, Network, Settings, Zap } from "lucide-react";
import QuantumChart from "@/components/QuantumChart";
import QuantumOptimizer from "@/components/QuantumOptimizer";
import QuantumSignals from "@/components/QuantumSignals";

interface QuantumStrategy {
  name: string;
  description: string;
  parameters: {
    entanglement: number;
    superposition: number;
    interference: number;
  };
}

const quantumStrategies: QuantumStrategy[] = [
  {
    name: "Quantum Momentum",
    description: "Uses quantum superposition for momentum detection",
    parameters: { entanglement: 0.7, superposition: 0.8, interference: 0.6 }
  },
  {
    name: "Quantum Mean Reversion",
    description: "Applies quantum entanglement for mean reversion",
    parameters: { entanglement: 0.8, superposition: 0.6, interference: 0.7 }
  },
  {
    name: "Quantum Arbitrage",
    description: "Quantum interference patterns for arbitrage opportunities",
    parameters: { entanglement: 0.9, superposition: 0.7, interference: 0.8 }
  }
];

export default function QuantumTrading() {
  const [selectedStrategy, setSelectedStrategy] = useState<QuantumStrategy>(quantumStrategies[0]);
  const [parameters, setParameters] = useState(selectedStrategy.parameters);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState("BTCUSDT");

  const handleOptimize = () => {
    setIsOptimizing(true);
    // Implement quantum optimization logic
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  return (
    <div className="p-4 h-screen bg-background">
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Left Sidebar - Quantum Strategies */}
        <Card className="col-span-2 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Quantum Strategies</h2>
          </div>
          <div className="space-y-2">
            {quantumStrategies.map((strategy) => (
              <Button
                key={strategy.name}
                variant={selectedStrategy.name === strategy.name ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedStrategy(strategy);
                  setParameters(strategy.parameters);
                }}
              >
                <Brain className="w-4 h-4 mr-2" />
                {strategy.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Main Quantum View */}
        <div className="col-span-7 space-y-4">
          {/* Quantum Chart */}
          <Card className="p-4 h-[60%]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quantum State Visualization</h3>
              <Button variant="outline" size="sm">
                <GitBranch className="w-4 h-4 mr-2" />
                Fork State
              </Button>
            </div>
            <QuantumChart
              strategy={selectedStrategy}
              parameters={parameters}
              symbol={activeSymbol}
            />
          </Card>

          {/* Quantum Analysis Tabs */}
          <Card className="p-4 h-[38%]">
            <Tabs defaultValue="optimizer">
              <TabsList>
                <TabsTrigger value="optimizer">
                  <Zap className="w-4 h-4 mr-2" />
                  Quantum Optimizer
                </TabsTrigger>
                <TabsTrigger value="signals">
                  <Network className="w-4 h-4 mr-2" />
                  Quantum Signals
                </TabsTrigger>
                <TabsTrigger value="data">
                  <Database className="w-4 h-4 mr-2" />
                  Quantum Data
                </TabsTrigger>
              </TabsList>
              <TabsContent value="optimizer">
                <QuantumOptimizer
                  strategy={selectedStrategy}
                  parameters={parameters}
                  isOptimizing={isOptimizing}
                />
              </TabsContent>
              <TabsContent value="signals">
                <QuantumSignals symbol={activeSymbol} strategy={selectedStrategy} />
              </TabsContent>
              <TabsContent value="data">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Entanglement Score</h4>
                    <div className="text-2xl font-bold text-primary">
                      {(parameters.entanglement * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Interference Pattern</h4>
                    <div className="text-2xl font-bold text-primary">
                      {(parameters.interference * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar - Parameters */}
        <Card className="col-span-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quantum Parameters</h2>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Entanglement Level
                <Slider
                  value={[parameters.entanglement * 100]}
                  onValueChange={(value) => setParameters({ ...parameters, entanglement: value[0] / 100 })}
                  max={100}
                  step={1}
                />
              </label>

              <label className="text-sm font-medium">
                Superposition States
                <Slider
                  value={[parameters.superposition * 100]}
                  onValueChange={(value) => setParameters({ ...parameters, superposition: value[0] / 100 })}
                  max={100}
                  step={1}
                />
              </label>

              <label className="text-sm font-medium">
                Interference Pattern
                <Slider
                  value={[parameters.interference * 100]}
                  onValueChange={(value) => setParameters({ ...parameters, interference: value[0] / 100 })}
                  max={100}
                  step={1}
                />
              </label>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleOptimize}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <Cpu className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Quantum Optimization
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full">
                <LineChart className="w-4 h-4 mr-2" />
                Save Quantum State
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 