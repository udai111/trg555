import { Construction } from "lucide-react";

export default function IntradayProbabilityPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <Construction className="w-16 h-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-lg">
        Our advanced intraday probability analysis tool is under development.
        This feature will help predict market movements with higher accuracy.
      </p>
      <div className="text-sm text-muted-foreground text-center max-w-md">
        <p>
          Stay tuned for revolutionary features including:
        </p>
        <ul className="mt-4 space-y-2">
          <li>• Real-time probability analysis</li>
          <li>• Market sentiment indicators</li>
          <li>• AI-powered trend predictions</li>
          <li>• Custom alert systems</li>
        </ul>
      </div>
    </div>
  );
}
