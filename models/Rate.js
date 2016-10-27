const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const rateSchema = new mongoose.Schema({
  result: { type: mongoose.Schema.Types.ObjectId, ref: "Result" },
  rates: Array
}, { timestamps: true });
rateSchema.plugin(mongoosePaginate);

rateSchema.pre('save', function (next) {
  this.rates.sort(compare);
  console.log('INFO-RATE: Saving rates numbers: ' + this.rates.length);
  next();
});

function compare(a, b) {
  if (a.rate < b.rate)
    return 1;
  if (a.rate > b.rate)
    return -1;
  return 0;
}

const Rate = mongoose.model('Rate', rateSchema);

module.exports = Rate;