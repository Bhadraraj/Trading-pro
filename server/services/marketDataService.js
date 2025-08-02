import axios from 'axios';
import MarketData from '../models/MarketData.js';
import logger from '../utils/logger.js';

class MarketDataService {
  constructor() {
    this.supportedPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
    this.updateInterval = 10000; // 10 seconds
    this.isRunning = false;
  }

  async fetchCoinGeckoData() {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin,ethereum,binancecoin,cardano,solana',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
        timeout: 5000,
      });

      const data = response.data;
      const marketUpdates = [];

      // Bitcoin
      if (data.bitcoin) {
        marketUpdates.push({
          pair: 'BTC/USDT',
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change || 0,
          volume24h: data.bitcoin.usd_24h_vol || 0,
          marketCap: data.bitcoin.usd_market_cap || 0,
        });
      }

      // Ethereum
      if (data.ethereum) {
        marketUpdates.push({
          pair: 'ETH/USDT',
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change || 0,
          volume24h: data.ethereum.usd_24h_vol || 0,
          marketCap: data.ethereum.usd_market_cap || 0,
        });
      }

      // Binance Coin
      if (data.binancecoin) {
        marketUpdates.push({
          pair: 'BNB/USDT',
          price: data.binancecoin.usd,
          change24h: data.binancecoin.usd_24h_change || 0,
          volume24h: data.binancecoin.usd_24h_vol || 0,
          marketCap: data.binancecoin.usd_market_cap || 0,
        });
      }

      // Cardano
      if (data.cardano) {
        marketUpdates.push({
          pair: 'ADA/USDT',
          price: data.cardano.usd,
          change24h: data.cardano.usd_24h_change || 0,
          volume24h: data.cardano.usd_24h_vol || 0,
          marketCap: data.cardano.usd_market_cap || 0,
        });
      }

      // Solana
      if (data.solana) {
        marketUpdates.push({
          pair: 'SOL/USDT',
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change || 0,
          volume24h: data.solana.usd_24h_vol || 0,
          marketCap: data.solana.usd_market_cap || 0,
        });
      }

      return marketUpdates;
    } catch (error) {
      logger.error('Error fetching CoinGecko data:', error.message);
      return [];
    }
  }

  async updateMarketData() {
    try {
      const marketUpdates = await this.fetchCoinGeckoData();
      
      for (const update of marketUpdates) {
        await MarketData.findOneAndUpdate(
          { pair: update.pair },
          {
            ...update,
            changePercent24h: update.change24h,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      }

      logger.info(`Updated market data for ${marketUpdates.length} pairs`);
    } catch (error) {
      logger.error('Error updating market data:', error.message);
    }
  }

  async getMarketData(pair = null) {
    try {
      const query = pair ? { pair } : {};
      const data = await MarketData.find(query).sort({ updatedAt: -1 });
      return data;
    } catch (error) {
      logger.error('Error getting market data:', error.message);
      return [];
    }
  }

  async getCurrentPrice(pair) {
    try {
      const marketData = await MarketData.findOne({ pair }).sort({ updatedAt: -1 });
      return marketData ? marketData.price : null;
    } catch (error) {
      logger.error('Error getting current price:', error.message);
      return null;
    }
  }

  startRealTimeUpdates() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Starting real-time market data updates');
    
    // Initial update
    this.updateMarketData();
    
    // Set up interval
    this.updateInterval = setInterval(() => {
      this.updateMarketData();
    }, this.updateInterval);
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    logger.info('Stopped real-time market data updates');
  }

  // Generate mock OHLCV data for charts
  generateMockOHLCV(pair, intervals = 100) {
    const data = [];
    const basePrice = 43000; // Starting price for BTC
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = intervals; i >= 0; i--) {
      const timestamp = new Date(now - (i * 60000)); // 1 minute intervals
      const volatility = 0.02; // 2% volatility
      
      const change = (Math.random() - 0.5) * volatility;
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000;
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });
      
      currentPrice = close;
    }
    
    return data;
  }
}

export default new MarketDataService();