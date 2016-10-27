const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const resultSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  budget: Number,
  resultDate: Date,
  nums: [{
    value: { type: Number, required: true, max:45, min:1 },
    rate: { type: Number, default: 0 },
    status: Boolean
  }],
  awards: {
    award1: Number,
    award2: Number,
    award3: Number,
    award4: Number
  }
}, { timestamps: true });
resultSchema.plugin(mongoosePaginate);

function compare(a, b) {
  if (a.rate < b.rate)
    return 1;
  if (a.rate > b.rate)
    return -1;
  return 0;
}

resultSchema.pre('save', function (next) {
  this.nums.sort(compare);
  console.log('INFO-RESULT: Saving result date: ' + this.resultDate + ' | value: ' + this.nums);
  next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;