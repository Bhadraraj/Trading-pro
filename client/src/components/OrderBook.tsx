import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface OrderBookProps {
  pair: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ pair }) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [pair]);

  const fetchOrderBook = async () => {
    try {
      const { api } = await import('../context/AuthContext');
      const response = await api.get(`/trades/orderbook/${pair.replace('/', '%2F')}`);
      if (response.data.success) {
        setOrderBook(response.data.orderBook);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
      // Generate mock data for demo
      generateMockOrderBook();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockOrderBook = () => {
    const basePrice = 43000;
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate bids (buy orders) - prices below current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice - (i + 1) * 10;
      const quantity = Math.random() * 2 + 0.1;
      bids.push({
        price,
        quantity,
        total: price * quantity,
      });
    }

    // Generate asks (sell orders) - prices above current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice + (i + 1) * 10;
      const quantity = Math.random() * 2 + 0.1;
      asks.push({
        price,
        quantity,
        total: price * quantity,
      });
    }

    setOrderBook({ bids, asks });
    setLastUpdate(new Date());
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(5);
  };

  const formatTotal = (total: number) => {
    return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Order Book</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchOrderBook}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 font-medium mb-2 px-2">
        <div className="text-left">Price (USDT)</div>
        <div className="text-center">Amount (BTC)</div>
        <div className="text-right">Total (USDT)</div>
      </div>

      <div className="space-y-4">
        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">Asks</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {orderBook.asks.slice().reverse().map((ask, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 text-sm py-1 px-2 hover:bg-gray-700 rounded transition-colors"
              >
                <div className="text-red-400 font-mono">{formatPrice(ask.price)}</div>
                <div className="text-white font-mono text-center">{formatQuantity(ask.quantity)}</div>
                <div className="text-gray-300 font-mono text-right">{formatTotal(ask.total)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Spread */}
        <div className="border-t border-gray-600 pt-2">
          <div className="text-center text-sm text-gray-400">
            Spread: {orderBook.asks.length > 0 && orderBook.bids.length > 0 
              ? `$${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}`
              : 'N/A'
            }
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">Bids</span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {orderBook.bids.map((bid, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 text-sm py-1 px-2 hover:bg-gray-700 rounded transition-colors"
              >
                <div className="text-green-400 font-mono">{formatPrice(bid.price)}</div>
                <div className="text-white font-mono text-center">{formatQuantity(bid.quantity)}</div>
                <div className="text-gray-300 font-mono text-right">{formatTotal(bid.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-green-900 bg-opacity-20 rounded-lg">
            <p className="text-green-400 font-medium">Best Bid</p>
            <p className="text-white font-mono">
              {orderBook.bids.length > 0 ? `$${formatPrice(orderBook.bids[0].price)}` : 'N/A'}
            </p>
          </div>
          <div className="text-center p-2 bg-red-900 bg-opacity-20 rounded-lg">
            <p className="text-red-400 font-medium">Best Ask</p>
            <p className="text-white font-mono">
              {orderBook.asks.length > 0 ? `$${formatPrice(orderBook.asks[0].price)}` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;