const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const resultSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  budget: Number,
  resultDate: Date,
  nums: {
    num1: Number,
    num2: Number,
    num3: Number,
    num4: Number,
    num5: Number,
    num6: Number,
  },
  awards: {
    award1: Number,
    award2: Number,
    award3: Number,
    award4: Number
  },
  rates: Array
}, { timestamps: true });
resultSchema.plugin(mongoosePaginate);
/**
 * Password hash middleware.
 */
resultSchema.pre('save', function (next) {
  console.log('INFO-RESULT: Saving result date: ' + this.resultDate + ' | value: ' + this.nums);
  next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;