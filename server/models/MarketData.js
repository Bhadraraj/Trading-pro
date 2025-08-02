import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  volume24h: {
    type: Number,
    default: 0,
  },
  change24h: {
    type: Number,
    default: 0,
  },
  changePercent24h: {
    type: Number,
    default: 0,
  },
  high24h: {
    type: Number,
    default: 0,
  },
  low24h: {
    type: Number,
    default: 0,
  },
  marketCap: Number,
  circulatingSupply: Number,
  totalSupply: Number,
  bid: Number,
  ask: Number,
  spread: Number,
  lastTrade: {
    price: Number,
    quantity: Number,
    timestamp: Date,
  },
  ohlcv: [{
    timestamp: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
  }],
  orderBook: {
    bids: [{
      price: Number,
      quantity: Number,
    }],
    asks: [{
      price: Number,
      quantity: Number,
    }],
    lastUpdated: Date,
  },
  technicalIndicators: {
    rsi: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number,
    },
    movingAverages: {
      sma20: Number,
      sma50: Number,
      sma200: Number,
      ema20: Number,
      ema50: Number,
    },
    bollinger: {
      upper: Number,
      middle: Number,
      lower: Number,
    },
  },
  sentiment: {
    fearGreedIndex: Number,
    socialVolume: Number,
    newsScore: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
marketDataSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate spread
marketDataSchema.methods.calculateSpread = function () {
  if (this.bid && this.ask) {
    this.spread = ((this.ask - this.bid) / this.ask) * 100;
  }
  return this.spread;
};

// Index for better query performance
marketDataSchema.index({ pair: 1, createdAt: -1 });
marketDataSchema.index({ updatedAt: -1 });

export default mongoose.model('MarketData', marketDataSchema);