import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalBalance: {
    type: Number,
    default: 10000,
    min: 0,
  },
  availableBalance: {
    type: Number,
    default: 10000,
    min: 0,
  },
  lockedBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalPnL: {
    type: Number,
    default: 0,
  },
  dailyPnL: {
    type: Number,
    default: 0,
  },
  positions: [{
    pair: {
      type: String,
      required: true,
    },
    side: {
      type: String,
      enum: ['long', 'short'],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      default: 0,
    },
    unrealizedPnL: {
      type: Number,
      default: 0,
    },
    realizedPnL: {
      type: Number,
      default: 0,
    },
    leverage: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    marginUsed: {
      type: Number,
      default: 0,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }],
  assets: [{
    symbol: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    locked: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageCost: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    pnl: {
      type: Number,
      default: 0,
    },
    pnlPercentage: {
      type: Number,
      default: 0,
    },
  }],
  statistics: {
    totalTrades: {
      type: Number,
      default: 0,
    },
    winningTrades: {
      type: Number,
      default: 0,
    },
    losingTrades: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    averageWin: {
      type: Number,
      default: 0,
    },
    averageLoss: {
      type: Number,
      default: 0,
    },
    profitFactor: {
      type: Number,
      default: 0,
    },
    sharpeRatio: {
      type: Number,
      default: 0,
    },
    maxDrawdown: {
      type: Number,
      default: 0,
    },
    maxDrawdownDate: Date,
  },
  riskManagement: {
    maxPositionSize: {
      type: Number,
      default: 1000,
    },
    maxDailyLoss: {
      type: Number,
      default: 500,
    },
    maxLeverage: {
      type: Number,
      default: 10,
    },
    stopLossPercentage: {
      type: Number,
      default: 2,
    },
    takeProfitPercentage: {
      type: Number,
      default: 4,
    },
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
portfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total portfolio value
portfolioSchema.methods.calculateTotalValue = function () {
  let totalValue = this.availableBalance + this.lockedBalance;
  
  this.assets.forEach(asset => {
    totalValue += asset.currentValue;
  });
  
  this.positions.forEach(position => {
    totalValue += position.unrealizedPnL;
  });
  
  this.totalBalance = totalValue;
  return totalValue;
};

// Update position PnL
portfolioSchema.methods.updatePositionPnL = function (pair, currentPrice) {
  const position = this.positions.find(p => p.pair === pair);
  if (position) {
    position.currentPrice = currentPrice;
    const priceDiff = position.side === 'long' 
      ? currentPrice - position.entryPrice 
      : position.entryPrice - currentPrice;
    position.unrealizedPnL = (priceDiff / position.entryPrice) * position.size * position.leverage;
    position.lastUpdated = Date.now();
  }
};

// Calculate win rate
portfolioSchema.methods.calculateWinRate = function () {
  const totalTrades = this.statistics.totalTrades;
  if (totalTrades === 0) return 0;
  
  this.statistics.winRate = (this.statistics.winningTrades / totalTrades) * 100;
  return this.statistics.winRate;
};

export default mongoose.model('Portfolio', portfolioSchema);