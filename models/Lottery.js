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
  nums: [{
    value: { type: Number, required: true },
    rate: { type: Number, default: 0 },
    status: Boolean
  }]
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