import express from 'express';
import { 
  createOrder, 
  getOrders, 
  cancelOrder,
  getOrder,
  getPositions, 
  getTradingHistory,
  getMarketData,
  getOrderBook,
  getTradingStatistics
} from '../controllers/tradeController.js';
import { protect } from '../middleware/auth.js';
import { tradeLimiter } from '../middleware/security.js';
import { validateTrade, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.use(protect); // All trade routes are protected

router.post('/order', tradeLimiter, validateTrade, handleValidationErrors, createOrder);
router.get('/orders', getOrders);
router.get('/order/:id', getOrder);
router.delete('/order/:id', cancelOrder);
router.get('/positions', getPositions);
router.get('/history', getTradingHistory);
router.get('/market/:pair?', getMarketData);
router.get('/orderbook/:pair(*)', getOrderBook);
router.get('/statistics', getTradingStatistics);

export default router;