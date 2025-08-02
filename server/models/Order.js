import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop', 'stop-limit'],
    default: 'market',
  },
  pair: {
    type: String,
    required: true,
    default: 'BTC/USDT',
  },
  amount: {
    type: Number,
    required: true,
    min: 0.001,
  },
  filledAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  limitPrice: Number,
  stopPrice: Number,
  averagePrice: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  feeRate: {
    type: Number,
    default: 0.001, // 0.1% default fee
  },
  status: {
    type: String,
    enum: ['pending', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired'],
    default: 'pending',
  },
  timeInForce: {
    type: String,
    enum: ['GTC', 'IOC', 'FOK'], // Good Till Cancelled, Immediate or Cancel, Fill or Kill
    default: 'GTC',
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
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
  pnl: {
    type: Number,
    default: 0,
  },
  commission: {
    type: Number,
    default: 0,
  },
  notes: String,
  ipAddress: String,
  userAgent: String,
  expiresAt: Date,
  fills: [{
    price: Number,
    quantity: Number,
    timestamp: { type: Date, default: Date.now },
    tradeId: String,
  }],
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web',
    },
    version: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  executedAt: {
    type: Date,
  },
  cancelledAt: Date,
});

// Update the updatedAt field before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique order ID
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Calculate total with fees
orderSchema.methods.calculateTotal = function () {
  const baseTotal = this.amount * this.price;
  this.fee = baseTotal * this.feeRate;
  this.total = this.type === 'buy' ? baseTotal + this.fee : baseTotal - this.fee;
  return this.total;
};

// Check if order is active
orderSchema.virtual('isActive').get(function () {
  return ['pending', 'partially_filled'].includes(this.status);
});

// Check if order is completed
orderSchema.virtual('isCompleted').get(function () {
  return ['filled', 'cancelled', 'rejected', 'expired'].includes(this.status);
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ pair: 1, type: 1 });
orderSchema.index({ orderId: 1 });

export default mongoose.model('Order', orderSchema);