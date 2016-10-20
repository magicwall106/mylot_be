const expressValidator = require('express-validator');

exports.customValidators = expressValidator({
  customValidators: {
    isArray: function (value) {
      return Array.isArray(value);
    },
    gte: function (param, num) {
      return param >= num;
    },
    isTicket: function (num) {
      return num.length == 6 && num[0].value && num[1].value
        && num[2].value && num[3].value && num[4].value && num[5].value;
    }
  }
});