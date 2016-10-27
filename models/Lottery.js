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
    value: { type: Number, required: true, max:45, min:1 },
    rate: { type: Number, default: 0 },
    status: Boolean
  }]
}, { timestamps: true });
lotterySchema.plugin(mongoosePaginate);

lotterySchema.pre('save', function (next) {
  this.nums.sort(compare);
  console.log('INFO-LOTTERY: Saving lottery date: ');
  next();
});

function compare(a, b) {
  if (a.value < b.value)
    return -1;
  if (a.value > b.value)
    return 1;
  return 0;
}

const Lottery = mongoose.model('Lottery', lotterySchema);

module.exports = Lottery;