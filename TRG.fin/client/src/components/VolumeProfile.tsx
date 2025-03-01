import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: VolumeProfileData;
  }>;
}

interface VolumeProfileData {
  priceLevel: number;
  volume: number;
  buySellRatio: number;
  valueArea: boolean;
  poc: boolean; // Point of Control
}

interface VolumeData {
  price: number;
  volume: number;
  timestamp: string;
}

interface VolumeProfileProps {
  data: VolumeData[];
}

const VolumeProfile: React.FC<VolumeProfileProps> = ({ data }) => {
  // Process data to create volume profile
  const processVolumeProfile = (data: VolumeData[]): VolumeProfileData[] => {
    if (!data.length) return [];

    // Find price range
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const levels = 20; // Number of price levels
    const step = priceRange / levels;

    // Create price levels
    const volumeByPrice = new Map<number, { volume: number; buys: number; sells: number }>();
    for (let i = 0; i < levels; i++) {
      const priceLevel = minPrice + (i * step);
      volumeByPrice.set(priceLevel, { volume: 0, buys: 0, sells: 0 });
    }

    // Aggregate volume by price level
    data.forEach(({ price, volume }) => {
      const priceLevel = minPrice + (Math.floor((price - minPrice) / step) * step);
      const current = volumeByPrice.get(priceLevel);
      if (current) {
        current.volume += volume;
        if (price > data[data.length - 1].price) {
          current.buys += volume;
        } else {
          current.sells += volume;
        }
      }
    });

    // Convert to array and calculate POC and value area
    const profileData = Array.from(volumeByPrice.entries())
      .map(([priceLevel, { volume, buys, sells }]) => ({
        priceLevel,
        volume,
        buySellRatio: buys / (buys + sells) || 0.5,
        valueArea: false,
        poc: false
      }))
      .sort((a, b) => b.volume - a.volume);

    // Mark POC (Point of Control)
    if (profileData.length > 0) {
      profileData[0].poc = true;
    }

    // Mark Value Area (70% of total volume)
    const totalVolume = profileData.reduce((sum, d) => sum + d.volume, 0);
    let cumulativeVolume = 0;
    for (const point of profileData) {
      cumulativeVolume += point.volume;
      point.valueArea = cumulativeVolume <= totalVolume * 0.7;
    }

    return profileData.sort((a, b) => a.priceLevel - b.priceLevel);
  };

  const volumeProfile = processVolumeProfile(data);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="text-sm">Price: ₹{data.priceLevel.toFixed(2)}</p>
        <p className="text-sm">Volume: {formatVolume(data.volume)}</p>
        <p className="text-sm">Buy/Sell Ratio: {(data.buySellRatio * 100).toFixed(1)}%</p>
        {data.poc && <p className="text-sm font-bold">Point of Control</p>}
        {data.valueArea && <p className="text-sm">Value Area</p>}
      </div>
    );
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={volumeProfile}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 'auto']} />
          <YAxis
            dataKey="priceLevel"
            type="number"
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            name="Volume Profile"
            dataKey="volume"
            fill="#8884d8"
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#8884d8] mr-1" /> Regular Volume
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-[#ff4d4f] mr-1" /> POC
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-[#1890ff] mr-1" /> Value Area
        </div>
      </div>
    </div>
  );
};

export default VolumeProfile;
