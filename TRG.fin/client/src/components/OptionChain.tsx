import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

interface OptionData {
  strikePrice: number;
  calls: {
    lastPrice: number;
    change: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  };
  puts: {
    lastPrice: number;
    change: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  };
}

export interface OptionChainProps {
  symbol: string;
}

export const OptionChain = ({ symbol }: OptionChainProps) => {
  const [optionData, setOptionData] = useState<OptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptionChain = async () => {
      try {
        const response = await apiService.options.getOptionChain(symbol);
        setOptionData(response);
      } catch (error) {
        console.error("Error fetching option chain:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptionChain();
  }, [symbol]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Option Chain</h3>
      {isLoading ? (
        <div className="text-center py-4">Loading option chain...</div>
      ) : optionData.length === 0 ? (
        <div className="text-center py-4">No option data available</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">IV</TableHead>
                <TableHead className="text-right">OI</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Strike</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">OI</TableHead>
                <TableHead className="text-right">IV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optionData.map((row) => (
                <TableRow key={row.strikePrice}>
                  <TableCell className="text-right">{row.calls.impliedVolatility.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.calls.openInterest.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.calls.volume.toLocaleString()}</TableCell>
                  <TableCell className={`text-right ${row.calls.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {row.calls.lastPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center font-medium">{row.strikePrice.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${row.puts.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {row.puts.lastPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{row.puts.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.puts.openInterest.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.puts.impliedVolatility.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}; 