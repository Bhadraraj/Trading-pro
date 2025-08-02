import Order from '../models/Order.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import marketDataService from './marketDataService.js';
import logger from '../utils/logger.js';

class TradingEngine {
  constructor() {
    this.orderQueue = [];
    this.isProcessing = false;
    this.feeRate = 0.001; // 0.1% trading fee
  }

  async processOrder(orderData, userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get current market price
      const currentPrice = await marketDataService.getCurrentPrice(orderData.pair);
      if (!currentPrice) {
        throw new Error('Unable to get current market price');
      }

      // Create order with current price
      const orderPrice = orderData.orderType === 'market' ? currentPrice : orderData.price;
      const total = orderData.amount * orderPrice;
      const fee = total * this.feeRate;
      const totalWithFee = orderData.type === 'buy' ? total + fee : total - fee;

      // Validate balance for buy orders
      if (orderData.type === 'buy' && user.balance < totalWithFee) {
        throw new Error('Insufficient balance');
      }

      // Create order
      const order = new Order({
        user: userId,
        type: orderData.type,
        side: orderData.type,
        orderType: orderData.orderType || 'market',
        pair: orderData.pair,
        amount: orderData.amount,
        price: orderPrice,
        total: total,
        fee: fee,
        feeRate: this.feeRate,
        status: 'pending',
        ipAddress: orderData.ipAddress,
        userAgent: orderData.userAgent,
      });

      await order.save();

      // Process order immediately for market orders
      if (orderData.orderType === 'market') {
        await this.executeOrder(order._id);
      }

      return order;
    } catch (error) {
      logger.error('Error processing order:', error.message);
      throw error;
    }
  }

  async executeOrder(orderId) {
    try {
      const order = await Order.findById(orderId).populate('user');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending') {
        throw new Error('Order is not in pending status');
      }

      const user = order.user;
      const totalWithFee = order.type === 'buy' ? order.total + order.fee : order.total - order.fee;

      // Update user balance
      if (order.type === 'buy') {
        user.balance -= totalWithFee;
      } else {
        user.balance += totalWithFee;
      }

      await user.save();

      // Update order status
      order.status = 'filled';
      order.filledAmount = order.amount;
      order.averagePrice = order.price;
      order.executedAt = new Date();
      await order.save();

      // Create transaction record
      await this.createTransaction({
        user: user._id,
        type: 'trade',
        subType: order.type,
        amount: order.type === 'buy' ? -totalWithFee : totalWithFee,
        currency: 'USDT',
        balanceBefore: order.type === 'buy' ? user.balance + totalWithFee : user.balance - totalWithFee,
        balanceAfter: user.balance,
        reference: {
          orderId: order._id,
          tradeId: order.orderId,
        },
        metadata: {
          pair: order.pair,
          price: order.price,
          quantity: order.amount,
          fee: order.fee,
          source: 'trading_engine',
        },
      });

      // Update portfolio
      await this.updatePortfolio(user._id, order);

      logger.info(`Order executed: ${order.orderId} for user ${user._id}`);
      return order;
    } catch (error) {
      logger.error('Error executing order:', error.message);
      
      // Mark order as failed
      await Order.findByIdAndUpdate(orderId, { 
        status: 'rejected',
        updatedAt: new Date(),
      });
      
      throw error;
    }
  }

  async createTransaction(transactionData) {
    try {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      return transaction;
    } catch (error) {
      logger.error('Error creating transaction:', error.message);
      throw error;
    }
  }

  async updatePortfolio(userId, order) {
    try {
      let portfolio = await Portfolio.findOne({ user: userId });
      
      if (!portfolio) {
        portfolio = new Portfolio({
          user: userId,
          totalBalance: 10000,
          availableBalance: 10000,
        });
      }

      // Update balance
      const user = await User.findById(userId);
      portfolio.availableBalance = user.balance;
      portfolio.totalBalance = user.balance;

      // Update statistics
      portfolio.statistics.totalTrades += 1;
      
      // Simple P&L calculation (for demo purposes)
      const pnl = order.type === 'sell' ? order.total - order.fee : -(order.total + order.fee);
      portfolio.totalPnL += pnl;
      portfolio.dailyPnL += pnl;

      if (pnl > 0) {
        portfolio.statistics.winningTrades += 1;
        portfolio.statistics.averageWin = 
          (portfolio.statistics.averageWin * (portfolio.statistics.winningTrades - 1) + pnl) / 
          portfolio.statistics.winningTrades;
      } else {
        portfolio.statistics.losingTrades += 1;
        portfolio.statistics.averageLoss = 
          (portfolio.statistics.averageLoss * (portfolio.statistics.losingTrades - 1) + Math.abs(pnl)) / 
          portfolio.statistics.losingTrades;
      }

      // Calculate win rate
      portfolio.calculateWinRate();

      await portfolio.save();
      return portfolio;
    } catch (error) {
      logger.error('Error updating portfolio:', error.message);
      throw error;
    }
  }

  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, user: userId });
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.isActive) {
        throw new Error('Order cannot be cancelled');
      }

      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();

      logger.info(`Order cancelled: ${order.orderId} for user ${userId}`);
      return order;
    } catch (error) {
      logger.error('Error cancelling order:', error.message);
      throw error;
    }
  }

  async getOrderBook(pair) {
    try {
      const buyOrders = await Order.find({
        pair,
        type: 'buy',
        status: 'pending',
        orderType: 'limit',
      }).sort({ price: -1 }).limit(20);

      const sellOrders = await Order.find({
        pair,
        type: 'sell',
        status: 'pending',
        orderType: 'limit',
      }).sort({ price: 1 }).limit(20);

      return {
        bids: buyOrders.map(order => ({
          price: order.price,
          quantity: order.amount - order.filledAmount,
          total: order.total,
        })),
        asks: sellOrders.map(order => ({
          price: order.price,
          quantity: order.amount - order.filledAmount,
          total: order.total,
        })),
      };
    } catch (error) {
      logger.error('Error getting order book:', error.message);
      return { bids: [], asks: [] };
    }
  }

  // Risk management functions
  async checkRiskLimits(userId, orderData) {
    try {
      const portfolio = await Portfolio.findOne({ user: userId });
      if (!portfolio) return true;

      const orderValue = orderData.amount * orderData.price;

      // Check position size limit
      if (orderValue > portfolio.riskManagement.maxPositionSize) {
        throw new Error('Order exceeds maximum position size limit');
      }

      // Check daily loss limit
      if (portfolio.dailyPnL < -portfolio.riskManagement.maxDailyLoss) {
        throw new Error('Daily loss limit reached');
      }

      return true;
    } catch (error) {
      logger.error('Risk check failed:', error.message);
      throw error;
    }
  }
}

export default new TradingEngine();