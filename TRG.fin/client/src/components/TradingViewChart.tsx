import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

interface TradingViewChartProps {
    symbol: string;
    data: { time: number; value: number }[];
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, data }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chart = useRef<any>(null);
    const series = useRef<any>(null);

    useEffect(() => {
        if (chartContainerRef.current === null) return;

        chart.current = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.offsetWidth,
            height: 480,
            crosshair: { mode: CrosshairMode.Normal },
            priceScale: { borderColor: '#485c7b' },
            timeScale: { borderColor: '#485c7b', timeVisible: true, secondsVisible: false },
            layout: {
                backgroundColor: '#131722',
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
        });

        series.current = chart.current.addLineSeries({ color: '#2962FF', lineWidth: 2 });
        series.current.setData(data);

        return () => {
            if (chart.current) {
                chart.current.remove();
                chart.current = null;
                series.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (series.current) {
            series.current.setData(data);
        }
    }, [data]);

    useEffect(() => {
        if (chart.current && chartContainerRef.current) {
            chart.current.resize(chartContainerRef.current.offsetWidth, 480);
        }
    }, []);

    return <div ref={chartContainerRef} />;
};

export default TradingViewChart; 