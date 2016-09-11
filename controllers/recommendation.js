const async = require('async');
const nodemailer = require('nodemailer');
const Recommendation = require('../models/Recommendation');

/**
 * GET /recommendation
 * Result Index Page.
 */
exports.getResult = (req, res) => {
  Result.find({},function(err,data){
      if (err) {
        res.render('error', {
            status: 500
        });
      } else {
        res.render('result/index', {
          title: 'Result',
          listResult: data
        });
      }
  });
};

/**
 * POST /results
 * Add single||multiple results.
 */

exports.postResult = (req, res, next) => {
  req.assert('code', 'Code is required').notEmpty();
  req.assert('resultDate', 'Date is invalid').notEmpty().isDate();
  req.assert('num1','Number is invalid').notEmpty().isInt();
  req.assert('num2','Number is invalid').notEmpty().isInt();
  req.assert('num3','Number is invalid').notEmpty().isInt();
  req.assert('num4','Number is invalid').notEmpty().isInt();
  req.assert('num5','Number is invalid').notEmpty().isInt();
  req.assert('num6','Number is invalid').notEmpty().isInt();
  //req.assert('award1','Number is invalid').notEmpty().isInt();
  //req.assert('award2','Number is invalid').notEmpty().isInt();
  //req.assert('award3','Number is invalid').notEmpty().isInt();
  //req.assert('award4','Number is invalid').notEmpty().isInt();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/result/add');
  }

  if(req.user){
    const result = new Result({
      code: req.body.code,
      resultDate: req.body.resultDate,
      nums: {
        num1: req.body.num1,
        num2: req.body.num2,
        num3: req.body.num3,
        num4: req.body.num4,
        num5: req.body.num5,
        num6: req.body.num6,
      },
      awards: {
        award1: req.body.award1,
        award2: req.body.award2,
        award3: req.body.award3,
        award4: req.body.award4
      }
    });
    //res.jsonp(result);
    result.save((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });

  } else {
    res.render('account/login', {
      title: 'Login',
      message: "Login first! You don't have permission to access this URL!"
    });
  }
};

/**
 * GET /results
 * Result Index Page.
 */
exports.getAddResult = (req, res) => {
  res.render('result/add', {
    title: 'Add New Result'
  });
};

/**
 * GET /api/results
 * Result Json: Get all results
 */
exports.getApiResult = (req, res) => {
  Result.find({},function(err,data){
      if (err) {
        res.render('error', {
            status: 500
        });
      } else {
        res.jsonp(data);
      }
  });
};
