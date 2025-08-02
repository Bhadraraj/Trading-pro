import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Shield, Award } from 'lucide-react';

interface PortfolioData {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalPnL: number;
  dailyPnL: number;
  positions: any[];
  assets: any[];
  statistics: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  riskManagement: {
    maxPositionSize: number;
    maxDailyLoss: number;
    maxLeverage: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
  };
}

const Portfolio: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'statistics' | 'risk'>('overview');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trades/positions');
      if (response.data.success) {
        setPortfolioData(response.data);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      // Generate mock data for demo
      setPortfolioData({
        totalBalance: 10500,
        availableBalance: 8500,
        lockedBalance: 2000,
        totalPnL: 500,
        dailyPnL: 150,
        positions: [],
        assets: [
          { symbol: 'USDT', balance: 8500, locked: 2000, currentValue: 10500, pnl: 500, pnlPercentage: 5 },
        ],
        statistics: {
          totalTrades: 25,
          winningTrades: 15,
          losingTrades: 10,
          winRate: 60,
          averageWin: 120,
          averageLoss: 80,
          profitFactor: 1.5,
          sharpeRatio: 1.2,
          maxDrawdown: 5.5,
        },
        riskManagement: {
          maxPositionSize: 1000,
          maxDailyLoss: 500,
          maxLeverage: 10,
          stopLossPercentage: 2,
          takeProfitPercentage: 4,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="text-center text-gray-400">
          <p>Unable to load portfolio data</p>
        </div>
      </div>
    );
  }

  const balanceData = [
    { name: 'Available', value: portfolioData?.availableBalance || 0, color: '#10B981' },
    { name: 'Locked', value: portfolioData?.lockedBalance || 0, color: '#F59E0B' },
  ];

  const performanceData = [
    { name: 'Wins', value: portfolioData?.statistics?.winningTrades || 0, color: '#10B981' },
    { name: 'Losses', value: portfolioData?.statistics?.losingTrades || 0, color: '#EF4444' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'positions', label: 'Positions', icon: Target },
    { id: 'statistics', label: 'Statistics', icon: Award },
    { id: 'risk', label: 'Risk Management', icon: Shield },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6">Portfolio Management</h3>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    ${portfolioData?.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total P&L</p>
                  <p className={`text-2xl font-bold font-mono ${
                    (portfolioData?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(portfolioData?.totalPnL || 0) >= 0 ? '+' : ''}${(portfolioData?.totalPnL || 0).toFixed(2)}
                  </p>
                </div>
                {(portfolioData?.totalPnL || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Daily P&L</p>
                  <p className={`text-2xl font-bold font-mono ${
                    (portfolioData?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(portfolioData?.dailyPnL || 0) >= 0 ? '+' : ''}${(portfolioData?.dailyPnL || 0).toFixed(2)}
                  </p>
                </div>
                {(portfolioData?.dailyPnL || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Distribution */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-4">Balance Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={balanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {balanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-2">
                {balanceData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-4">Win/Loss Ratio</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Bar dataKey="value" fill="#8884d8">
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'positions' && (
        <div className="space-y-4">
          {portfolioData.positions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No open positions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioData.positions.map((position, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{position.pair}</h4>
                      <p className="text-sm text-gray-400">{position.side.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono">{position.size} BTC</p>
                      <p className={`text-sm font-mono ${
                        position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-3">Trading Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades:</span>
                <span className="text-white font-mono">{portfolioData.statistics.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate:</span>
                <span className="text-green-400 font-mono">{portfolioData.statistics.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Win:</span>
                <span className="text-green-400 font-mono">${portfolioData.statistics.averageWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Loss:</span>
                <span className="text-red-400 font-mono">${portfolioData.statistics.averageLoss.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-3">Risk Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Factor:</span>
                <span className="text-white font-mono">{portfolioData.statistics.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio:</span>
                <span className="text-white font-mono">{portfolioData.statistics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Drawdown:</span>
                <span className="text-red-400 font-mono">{portfolioData.statistics.maxDrawdown.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-white font-medium mb-3">Risk Management Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Position Size:</span>
                  <span className="text-white font-mono">${portfolioData.riskManagement.maxPositionSize.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Daily Loss:</span>
                  <span className="text-red-400 font-mono">${portfolioData.riskManagement.maxDailyLoss.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Leverage:</span>
                  <span className="text-white font-mono">{portfolioData.riskManagement.maxLeverage}x</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss %:</span>
                  <span className="text-red-400 font-mono">{portfolioData.riskManagement.stopLossPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Take Profit %:</span>
                  <span className="text-green-400 font-mono">{portfolioData.riskManagement.takeProfitPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;