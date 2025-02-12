import { useEffect, useRef } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi,
  CandlestickData,
  Time,
  DeepPartial,
  ChartOptions,
  ISeriesApi,
  SeriesOptionsCommon
} from 'lightweight-charts';

interface ChartProps {
  data: CandlestickData<Time>[];
  onPatternDetected?: (pattern: string) => void;
}

export function CandlestickChart({ data, onPatternDetected }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: 'transparent' 
        },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.8)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = candlestickSeries;

    candlestickSeries.setData(data);

    // Pattern Detection
    const detectPatterns = () => {
      for (let i = 3; i < data.length; i++) {
        // Bullish Engulfing
        if (
          data[i-1].close < data[i-1].open && // Previous red candle
          data[i].close > data[i].open && // Current green candle
          data[i].open < data[i-1].close && // Current opens below prev close
          data[i].close > data[i-1].open // Current closes above prev open
        ) {
          onPatternDetected?.('Bullish Engulfing');
          const marker = {
            time: data[i].time,
            position: 'belowBar' as const,
            color: '#26a69a',
            shape: 'arrowUp' as const,
            text: 'BE',
          };
          candlestickSeries.setMarkers([marker]);
        }

        // Bearish Engulfing
        if (
          data[i-1].close > data[i-1].open && // Previous green candle
          data[i].close < data[i].open && // Current red candle
          data[i].open > data[i-1].close && // Current opens above prev close
          data[i].close < data[i-1].open // Current closes below prev open
        ) {
          onPatternDetected?.('Bearish Engulfing');
          const marker = {
            time: data[i].time,
            position: 'aboveBar' as const,
            color: '#ef5350',
            shape: 'arrowDown' as const,
            text: 'BE',
          };
          candlestickSeries.setMarkers([marker]);
        }
      }
    };

    detectPatterns();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, onPatternDetected]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-[600px]"
      style={{ backgroundColor: '#131722' }}
    />
  );
}