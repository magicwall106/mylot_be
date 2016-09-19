const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const lotterySchema = new mongoose.Schema({
  result: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Result'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  condition: Array,
  status: String,
  award: {
    type: Number,
    enum: [0, 1, 2, 3, 4],
    default: 0
  },
  nums: {
    num1: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Boolean
    },
    num2: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Boolean
    },
    num3: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Boolean
    },
    num4: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Boolean
    },
    num5: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Boolean
    },
    num6: {
      value: Number,
      rate: { type: Number, default: 0 },
      status: Number
    }
  }
}, { timestamps: true });
lotterySchema.plugin(mongoosePaginate);
/**
 * Password hash middleware.
 */
lotterySchema.pre('save', function (next) {
  console.log('INFO-LOTTERY: Saving lottery date: ');
  next();
});

const Lottery = mongoose.model('Lottery', lotterySchema);

module.exports = Lottery;