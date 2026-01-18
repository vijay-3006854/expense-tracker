const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Healthcare', 'Entertainment', 'Education', 'Salary', 'Freelance', 'Investment', 'Others'],
      message: 'Invalid category'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  receipt: {
    type: String, // URL to uploaded receipt image
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Static method to get user statistics
transactionSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get category-wise expenses
transactionSchema.statics.getCategoryStats = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Transaction', transactionSchema);