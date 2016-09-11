const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
	condition: Array,
  nums: {
    num1:{
      value: Number,
      rate: Number 
    },
    num2:{
      value: Number,
      rate: Number 
    },
    num3:{
      value: Number,
      rate: Number 
    },
    num4:{
      value: Number,
      rate: Number 
    },
    num5:{
      value: Number,
      rate: Number 
    },
    num6:{
      value: Number,
      rate: Number 
    }
  }
}, { timestamps: true });

recommendationSchema.pre('save', function (next) {
  console.log('INFO-RECOMMENDATION: Saving recommendation date: ');
  next();
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;