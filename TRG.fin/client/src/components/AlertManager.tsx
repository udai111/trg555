import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export interface AlertManagerProps {
  symbol: string;
}

export const AlertManager = ({ symbol }: AlertManagerProps) => {
  const [priceAlerts, setPriceAlerts] = useState({
    upperLimit: "",
    lowerLimit: "",
    isEnabled: true
  });

  const [volumeAlert, setVolumeAlert] = useState({
    threshold: "",
    isEnabled: false
  });

  const handleSaveAlerts = () => {
    // Implement alert saving logic
    console.log("Saving alerts for", symbol, { priceAlerts, volumeAlert });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Price Alerts</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Enable Price Alerts</span>
          <Switch
            checked={priceAlerts.isEnabled}
            onCheckedChange={(checked) => setPriceAlerts(prev => ({ ...prev, isEnabled: checked }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Upper Limit (₹)</label>
          <Input
            type="number"
            value={priceAlerts.upperLimit}
            onChange={(e) => setPriceAlerts(prev => ({ ...prev, upperLimit: e.target.value }))}
            placeholder="Enter upper limit"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Lower Limit (₹)</label>
          <Input
            type="number"
            value={priceAlerts.lowerLimit}
            onChange={(e) => setPriceAlerts(prev => ({ ...prev, lowerLimit: e.target.value }))}
            placeholder="Enter lower limit"
          />
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Volume Alert</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Enable Volume Alert</span>
              <Switch
                checked={volumeAlert.isEnabled}
                onCheckedChange={(checked) => setVolumeAlert(prev => ({ ...prev, isEnabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm">Volume Threshold</label>
              <Input
                type="number"
                value={volumeAlert.threshold}
                onChange={(e) => setVolumeAlert(prev => ({ ...prev, threshold: e.target.value }))}
                placeholder="Enter volume threshold"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveAlerts} className="w-full mt-4">
          Save Alerts
        </Button>
      </div>
    </Card>
  );
}; 