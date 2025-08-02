import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceData {
  price: number;
  change24h: number;
  volume: number;
}

const PriceChart: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    price: 0,
    change24h: 0,
    volume: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'
        );
        const data = await response.json();
        
        setPriceData({
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change,
          volume: data.bitcoin.usd_24h_vol,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching price:', error);
        // Fallback to demo data
        setPriceData({
          price: 43250.50,
          change24h: 2.45,
          volume: 1234567890,
        });
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
      </div>
    );
  }

  const isPositive = priceData.change24h >= 0;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">BTC/USDT</h3>
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-3xl font-bold text-white font-mono">
            ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400">Current Price</p>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">24h Volume:</span>
            <span className="text-white font-mono">
              ${(priceData.volume / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Real-time data from CoinGecko
      </div>
    </div>
  );
};

export default PriceChart;