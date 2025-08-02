import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

interface ChartData {
  timestamp: string;
  price: number;
  volume: number;
}

interface TradingChartProps {
  pair: string;
  height?: number;
}

const TradingChart: React.FC<TradingChartProps> = ({ pair, height = 400 }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [timeframe, setTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateMockData();
  }, [pair, timeframe]);

  const generateMockData = () => {
    setIsLoading(true);
    
    // Generate mock OHLCV data
    const data: ChartData[] = [];
    const basePrice = 43000;
    let currentPrice = basePrice;
    const intervals = timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : 1440;
    
    for (let i = intervals; i >= 0; i--) {
      const timestamp = new Date(Date.now() - (i * 60000)).toISOString();
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice * (1 + change);
      
      data.push({
        timestamp,
        price: currentPrice,
        volume: Math.random() * 1000000,
      });
    }
    
    setChartData(data);
    setIsLoading(false);
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white">{pair}</h3>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span className="text-2xl font-bold text-white font-mono">
              {formatPrice(currentPrice)}
            </span>
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'area' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'line' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {['1h', '4h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={formatPrice}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number, name: string) => [
                  name === 'price' ? formatPrice(value) : formatVolume(value),
                  name === 'price' ? 'Price' : 'Volume'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={formatPrice}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: isPositive ? "#10B981" : "#EF4444" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <p className="text-gray-400">24h High</p>
          <p className="text-green-400 font-mono font-semibold">
            {formatPrice(Math.max(...chartData.map(d => d.price)))}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <p className="text-gray-400">24h Low</p>
          <p className="text-red-400 font-mono font-semibold">
            {formatPrice(Math.min(...chartData.map(d => d.price)))}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <p className="text-gray-400">24h Volume</p>
          <p className="text-white font-mono font-semibold">
            {formatVolume(chartData.reduce((sum, d) => sum + d.volume, 0))}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-700 rounded-lg">
          <p className="text-gray-400">Change</p>
          <p className={`font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;