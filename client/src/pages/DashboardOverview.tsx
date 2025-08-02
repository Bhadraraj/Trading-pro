import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Target,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TradingChart from '../components/TradingChart';
import PriceChart from '../components/PriceChart';

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState({
    btc: { price: 43250.50, change: 2.45 },
    eth: { price: 2650.30, change: -1.23 },
    bnb: { price: 315.80, change: 3.67 },
  });

  const stats = [
    {
      title: 'Total Balance',
      value: `$${user?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`,
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Total P&L',
      value: '+$1,250.00',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Active Positions',
      value: '3',
      change: '+1',
      changeType: 'positive' as const,
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Win Rate',
      value: '68.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Award,
      color: 'yellow'
    },
  ];

  const recentTrades = [
    { id: 1, pair: 'BTC/USDT', type: 'buy', amount: 0.025, price: 43200, time: '2 min ago', pnl: '+$125.50' },
    { id: 2, pair: 'ETH/USDT', type: 'sell', amount: 1.5, price: 2645, time: '15 min ago', pnl: '-$45.20' },
    { id: 3, pair: 'BNB/USDT', type: 'buy', amount: 10, price: 314.50, time: '1 hour ago', pnl: '+$89.30' },
  ];

  const topMovers = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$43,250.50', change: '+2.45%', changeType: 'positive' as const },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,650.30', change: '-1.23%', changeType: 'negative' as const },
    { symbol: 'BNB', name: 'Binance Coin', price: '$315.80', change: '+3.67%', changeType: 'positive' as const },
    { symbol: 'ADA', name: 'Cardano', price: '$0.485', change: '+5.12%', changeType: 'positive' as const },
    { symbol: 'SOL', name: 'Solana', price: '$98.45', change: '-2.89%', changeType: 'negative' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          Here's your trading overview for today. Markets are looking active with great opportunities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-600 bg-opacity-20`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-500`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Chart */}
        <div className="lg:col-span-2">
          <TradingChart pair="BTC/USDT" height={400} />
        </div>

        {/* Price Overview */}
        <div className="space-y-6">
          <PriceChart />
          
          {/* Quick Actions */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Quick Buy</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <TrendingDown className="h-4 w-4" />
                <span>Quick Sell</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <BarChart3 className="h-4 w-4" />
                <span>View Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
          </div>
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    trade.type === 'buy' ? 'bg-green-600 bg-opacity-20' : 'bg-red-600 bg-opacity-20'
                  }`}>
                    {trade.type === 'buy' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{trade.pair}</p>
                    <p className="text-gray-400 text-sm">{trade.amount} @ ${trade.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trade.pnl}
                  </p>
                  <p className="text-gray-400 text-sm">{trade.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Movers</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View Market</button>
          </div>
          <div className="space-y-3">
            {topMovers.map((coin, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{coin.symbol}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{coin.symbol}</p>
                    <p className="text-gray-400 text-sm">{coin.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono">{coin.price}</p>
                  <p className={`text-sm font-medium ${
                    coin.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {coin.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;