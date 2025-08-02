import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'fee', 'bonus', 'refund'],
    required: true,
  },
  subType: {
    type: String,
    enum: ['buy', 'sell', 'transfer_in', 'transfer_out', 'commission', 'spread'],
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USDT',
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed',
  },
  reference: {
    orderId: String,
    tradeId: String,
    withdrawalId: String,
    depositId: String,
  },
  metadata: {
    pair: String,
    price: Number,
    quantity: Number,
    fee: Number,
    source: String,
    description: String,
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
});

// Generate unique transaction ID
transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ type: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);