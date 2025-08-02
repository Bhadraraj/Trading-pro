import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradeData {
  type: 'buy' | 'sell';
  amount: string;
  currentPrice: number;
}

const TradePanel: React.FC = () => {
  const { user, updateBalance } = useAuth();
  const [tradeData, setTradeData] = useState<TradeData>({
    type: 'buy',
    amount: '',
    currentPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const data = await response.json();
        setTradeData(prev => ({ ...prev, currentPrice: data.bitcoin.usd }));
      } catch (error) {
        console.error('Error fetching price:', error);
        setTradeData(prev => ({ ...prev, currentPrice: 43250.50 })); // Fallback price
      }
    };

    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(tradeData.amount);
    if (!amount || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    const total = amount * tradeData.currentPrice;
    
    if (tradeData.type === 'buy' && user && user.balance < total) {
      setMessage('Insufficient balance for this trade');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { api } = await import('../context/AuthContext');
      const response = await api.post('/trades/order', {
        type: tradeData.type,
        pair: 'BTC/USDT',
        amount: amount,
        price: tradeData.currentPrice,
      });

      if (response.data.success) {
        // Update balance based on trade type
        const newBalance = tradeData.type === 'buy' 
          ? (user?.balance || 0) - total 
          : (user?.balance || 0) + total;
        
        updateBalance(newBalance);
        
        setMessage(`${tradeData.type.toUpperCase()} order executed successfully!`);
        setTradeData(prev => ({ ...prev, amount: '' }));
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Trade execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const total = parseFloat(tradeData.amount || '0') * tradeData.currentPrice;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Trade</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trade Type Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTradeData(prev => ({ ...prev, type: 'buy' }))}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              tradeData.type === 'buy' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>BUY</span>
          </button>
          <button
            type="button"
            onClick={() => setTradeData(prev => ({ ...prev, type: 'sell' }))}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              tradeData.type === 'sell' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>SELL</span>
          </button>
        </div>

        {/* Current Price Display */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Current Price:</span>
            <span className="text-white font-mono font-semibold">
              ${tradeData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (BTC)
          </label>
          <input
            type="number"
            step="0.00001"
            value={tradeData.amount}
            onChange={(e) => setTradeData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00000"
          />
        </div>

        {/* Total Display */}
        {tradeData.amount && (
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total (USDT):</span>
              <span className="text-white font-mono font-semibold">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !tradeData.amount}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            tradeData.type === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </span>
          ) : (
            `${tradeData.type.toUpperCase()} BTC`
          )}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-900 text-green-200' 
              : 'bg-red-900 text-red-200'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default TradePanel;