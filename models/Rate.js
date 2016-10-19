const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const rateSchema = new mongoose.Schema({
  result: { type: mongoose.Schema.Types.ObjectId, ref: "Result" },
  rates: Array
}, { timestamps: true });
rateSchema.plugin(mongoosePaginate);

rateSchema.pre('save', function (next) {
  console.log('INFO-RATE: Saving rates numbers: ' + this.rates.length);
  next();
});

const Rate = mongoose.model('Rate', rateSchema);

module.exports = Rate;