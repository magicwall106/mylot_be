const expressValidator = require('express-validator');

exports.customValidators = expressValidator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    gte: function (param, num) {
      return param >= num;
    }
  }
})