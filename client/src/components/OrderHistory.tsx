import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface Order {
  _id: string;
  type: 'buy' | 'sell';
  pair: string;
  amount: number;
  price: number;
  total: number;
  status: string;
  createdAt: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { api } = await import('../context/AuthContext');
        const response = await api.get('/trades/orders');
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Order History</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-700 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Order History</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet. Start trading to see your history here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div key={order._id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded-full ${
                    order.type === 'buy' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {order.type === 'buy' ? (
                      <TrendingUp className="h-4 w-4 text-white" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <span className={`font-semibold ${
                      order.type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                    <span className="text-gray-300 ml-2">{order.pair}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-400 text-sm font-medium">
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="text-white font-mono">{order.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })} BTC</p>
                </div>
                <div>
                  <p className="text-gray-400">Price</p>
                  <p className="text-white font-mono">${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-white font-mono">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;