import { Construction } from "lucide-react";

export default function CandlestickPatternsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <Construction className="w-16 h-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
        Our advanced candlestick pattern recognition tool is under development.
        This feature will help identify potential market reversals with higher accuracy.
      </p>
      <div className="text-sm text-muted-foreground text-center max-w-md">
        <p>
          Stay tuned for revolutionary features including:
        </p>
        <ul className="mt-4 space-y-2">
          <li>• Advanced Pattern Recognition</li>
          <li>• Multi-timeframe Analysis</li>
          <li>• Success Rate Statistics</li>
          <li>• Real-time Pattern Alerts</li>
          <li>• Educational Resources</li>
        </ul>
      </div>
    </div>
  );
}
