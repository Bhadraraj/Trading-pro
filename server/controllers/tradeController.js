import Order from '../models/Order.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import tradingEngine from '../services/tradingEngine.js';
import marketDataService from '../services/marketDataService.js';
import logger from '../utils/logger.js';

// @desc    Create new order
// @route   POST /api/trades/order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { type, pair, amount, price, orderType = 'market' } = req.body;
    
    // Add request metadata
    const orderData = {
      type,
      pair,
      amount: parseFloat(amount),
      price: parseFloat(price),
      orderType,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Check risk limits
    await tradingEngine.checkRiskLimits(req.user.id, orderData);
    
    // Process order through trading engine
    const order = await tradingEngine.processOrder(orderData, req.user.id);
    
    // Get updated user balance
    const user = await User.findById(req.user.id);
    res.status(201).json({
      success: true,
      order,
      balance: user.balance,
      message: 'Order processed successfully',
    });
  } catch (error) {
    logger.error('Order creation failed:', error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/trades/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, pair, type } = req.query;
    
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (pair) query.pair = pair;
    if (type) query.type = type;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/trades/order/:id
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await tradingEngine.cancelOrder(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/trades/order/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// @desc    Get user positions summary
// @route   GET /api/trades/positions
// @access  Private
const getPositions = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(200).json({
        success: true,
        positions: [],
        statistics: {},
      });
    }

    res.status(200).json({
      success: true,
      positions: portfolio.positions,
      assets: portfolio.assets,
      statistics: portfolio.statistics,
      riskManagement: portfolio.riskManagement,
      totalBalance: portfolio.totalBalance,
      availableBalance: portfolio.availableBalance,
      lockedBalance: portfolio.lockedBalance,
      totalPnL: portfolio.totalPnL,
      dailyPnL: portfolio.dailyPnL,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get trading history
// @route   GET /api/trades/history
// @access  Private
const getTradingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    
    const query = { user: req.user.id };
    if (type) query.type = type;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get market data
// @route   GET /api/trades/market/:pair?
// @access  Private
const getMarketData = async (req, res) => {
  try {
    const { pair } = req.params;
    const marketData = await marketDataService.getMarketData(pair);
    
    res.status(200).json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order book
// @route   GET /api/trades/orderbook/:pair
// @access  Private
const getOrderBook = async (req, res) => {
  try {
    let { pair } = req.params;
    // Handle URL encoded pair (BTC%2FUSDT -> BTC/USDT)
    pair = decodeURIComponent(pair);
    
    const orderBook = await tradingEngine.getOrderBook(pair);
    
    res.status(200).json({
      success: true,
      orderBook,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get trading statistics
// @route   GET /api/trades/statistics
// @access  Private
const getTradingStatistics = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1h':
        dateFilter = { createdAt: { $gte: new Date(now - 60 * 60 * 1000) } };
        break;
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
    }
    
    const orders = await Order.find({ 
      user: req.user.id, 
      status: 'filled',
      ...dateFilter 
    });
    
    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'trade',
      ...dateFilter
    });
    
    const stats = {
      totalTrades: orders.length,
      totalVolume: orders.reduce((sum, order) => sum + order.total, 0),
      totalFees: orders.reduce((sum, order) => sum + order.fee, 0),
      buyOrders: orders.filter(order => order.type === 'buy').length,
      sellOrders: orders.filter(order => order.type === 'sell').length,
      averageOrderSize: orders.length > 0 ? orders.reduce((sum, order) => sum + order.amount, 0) / orders.length : 0,
      pnl: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    };
    
    res.status(200).json({
      success: true,
      timeframe,
      statistics: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { 
  createOrder, 
  getOrders, 
  cancelOrder,
  getOrder,
  getPositions, 
  getTradingHistory,
  getMarketData,
  getOrderBook,
  getTradingStatistics
};