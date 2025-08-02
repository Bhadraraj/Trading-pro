import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { TrendingUp, TrendingDown, AlertCircle, Settings, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

interface TradeData {
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop-limit';
  amount: string;
  price: string;
  stopPrice: string;
  limitPrice: string;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  leverage: number;
}

interface AdvancedTradePanelProps {
  pair: string;
  currentPrice: number;
}

const AdvancedTradePanel: React.FC<AdvancedTradePanelProps> = ({ pair, currentPrice }) => {
  const { user, updateBalance } = useAuth();
  const [tradeData, setTradeData] = useState<TradeData>({
    type: 'buy',
    orderType: 'market',
    amount: '',
    price: currentPrice.toString(),
    stopPrice: '',
    limitPrice: '',
    timeInForce: 'GTC',
    leverage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [riskCalculation, setRiskCalculation] = useState({
    total: 0,
    fee: 0,
    margin: 0,
    liquidationPrice: 0,
  });

  useEffect(() => {
    setTradeData(prev => ({ ...prev, price: currentPrice.toString() }));
  }, [currentPrice]);

  useEffect(() => {
    calculateRisk();
  }, [tradeData, currentPrice]);

  const calculateRisk = () => {
    const amount = parseFloat(tradeData.amount || '0');
    const price = tradeData.orderType === 'market' ? currentPrice : parseFloat(tradeData.price || '0');
    const leverage = tradeData.leverage;
    
    const total = amount * price;
    const fee = total * 0.001; // 0.1% fee
    const margin = total / leverage;
    
    // Simple liquidation price calculation
    const liquidationPrice = tradeData.type === 'buy' 
      ? price * (1 - (1 / leverage) * 0.8) // 80% of margin
      : price * (1 + (1 / leverage) * 0.8);

    setRiskCalculation({
      total,
      fee,
      margin,
      liquidationPrice,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(tradeData.amount);
    const price = tradeData.orderType === 'market' ? currentPrice : parseFloat(tradeData.price);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (tradeData.orderType !== 'market' && (!price || price <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }

    const totalCost = riskCalculation.total + riskCalculation.fee;
    
    if (tradeData.type === 'buy' && user && user.balance < totalCost) {
      toast.error('Insufficient balance for this trade');
      return;
    }

    setIsLoading(true);

    try {
      const { api } = await import('../context/AuthContext');
      const response = await api.post('/trades/order', {
        type: tradeData.type,
        orderType: tradeData.orderType,
        pair: pair,
        amount: amount,
        price: price,
        stopPrice: tradeData.stopPrice ? parseFloat(tradeData.stopPrice) : undefined,
        limitPrice: tradeData.limitPrice ? parseFloat(tradeData.limitPrice) : undefined,
        timeInForce: tradeData.timeInForce,
        leverage: tradeData.leverage,
      });

      if (response.data.success) {
        updateBalance(response.data.balance);
        toast.success(`${tradeData.type.toUpperCase()} order placed successfully!`);
        setTradeData(prev => ({ ...prev, amount: '' }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Trade execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const orderTypes = [
    { value: 'market', label: 'Market' },
    { value: 'limit', label: 'Limit' },
    { value: 'stop', label: 'Stop' },
    { value: 'stop-limit', label: 'Stop-Limit' },
  ];

  const timeInForceOptions = [
    { value: 'GTC', label: 'Good Till Cancelled' },
    { value: 'IOC', label: 'Immediate or Cancel' },
    { value: 'FOK', label: 'Fill or Kill' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Advanced Trading</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      
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

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Order Type
          </label>
          <select
            value={tradeData.orderType}
            onChange={(e) => setTradeData(prev => ({ ...prev, orderType: e.target.value as any }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {orderTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
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

        {/* Price Input (for non-market orders) */}
        {tradeData.orderType !== 'market' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (USDT)
            </label>
            <input
              type="number"
              step="0.01"
              value={tradeData.price}
              onChange={(e) => setTradeData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Stop Price (for stop orders) */}
        {(tradeData.orderType === 'stop' || tradeData.orderType === 'stop-limit') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stop Price (USDT)
            </label>
            <input
              type="number"
              step="0.01"
              value={tradeData.stopPrice}
              onChange={(e) => setTradeData(prev => ({ ...prev, stopPrice: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-white">Advanced Options</h4>
            
            {/* Time in Force */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time in Force
              </label>
              <select
                value={tradeData.timeInForce}
                onChange={(e) => setTradeData(prev => ({ ...prev, timeInForce: e.target.value as any }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeInForceOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leverage: {tradeData.leverage}x
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={tradeData.leverage}
                onChange={(e) => setTradeData(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>
          </div>
        )}

        {/* Risk Calculation */}
        {tradeData.amount && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-medium text-white">Order Summary</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-mono">${riskCalculation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee (0.1%):</span>
                <span className="text-white font-mono">${riskCalculation.fee.toFixed(2)}</span>
              </div>
              {tradeData.leverage > 1 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Margin Required:</span>
                    <span className="text-white font-mono">${riskCalculation.margin.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Liquidation Price:</span>
                    <span className="text-red-400 font-mono">${riskCalculation.liquidationPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
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
            `${tradeData.type.toUpperCase()} ${pair.split('/')[0]}`
          )}
        </button>
      </form>
    </div>
  );
};

export default AdvancedTradePanel;