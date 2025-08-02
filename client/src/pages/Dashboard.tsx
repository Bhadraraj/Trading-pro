import React from 'react';
import Navbar from '../components/Navbar';
import TradingChart from '../components/TradingChart';
import AdvancedTradePanel from '../components/AdvancedTradePanel';
import OrderHistory from '../components/OrderHistory';
import OrderBook from '../components/OrderBook';
import Portfolio from '../components/Portfolio';
import { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [currentPrice, setCurrentPrice] = useState(43000);
  
  const tradingPairs = [
    'BTC/USDT',
    'ETH/USDT', 
    'BNB/USDT',
    'ADA/USDT',
    'SOL/USDT'
  ];

  useEffect(() => {
    // Fetch current price for selected pair
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const data = await response.json();
        setCurrentPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Advanced Trading Dashboard</h1>
            <p className="text-gray-400">Professional trading platform with advanced features</p>
          </div>
          
          {/* Pair Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-gray-400 text-sm">Trading Pair:</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tradingPairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Trading Chart - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <TradingChart pair={selectedPair} height={500} />
          </div>

          {/* Advanced Trade Panel */}
          <div className="lg:col-span-1">
            <AdvancedTradePanel pair={selectedPair} currentPrice={currentPrice} />
          </div>

          {/* Order Book */}
          <div className="lg:col-span-1">
            <OrderBook pair={selectedPair} />
          </div>
        </div>

        {/* Secondary Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio Management */}
          <div className="lg:col-span-1">
            <Portfolio />
          </div>

          {/* Order History - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <OrderHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;