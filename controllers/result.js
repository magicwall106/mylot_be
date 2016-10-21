const Result = require('../models/Result');
const Lottery = require('../models/Lottery');
const async = require('async');
const queryResultField = 'code budget resultDate nums awards createdAt';

/**
 * GET /result
 * Result Index Page.
 */
exports.getResult = (req, res) => {
  Result.find().exec(function (err, data) {
    if (err) {
      res.render('error', {
        status: 400
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
 * GET /result
 * Result Index Page.
 */
exports.getAddResult = (req, res) => {
  res.render('result/add', {
    title: 'Add New Result'
  });
};

/**
 * POST /result
 * API Add single||multiple results.
 */

exports.postApiResult = (req, res, next) => {
  req.assert('code', 'Code is required').notEmpty();
  req.assert('budget', 'Budget is invalid').notEmpty().isInt();
  req.assert('resultDate', 'Result Date is invalid').notEmpty().isDate();
  req.assert('nums', 'Ticket is invalid').isArray().isTicket();
  req.assert('award1', 'Award 1 is invalid').isInt();
  req.assert('award2', 'Award 2 is invalid').isInt();
  req.assert('award3', 'Award 3 is invalid').isInt();
  req.assert('award4', 'Award 4 is invalid').isInt();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }

  if (req.user) {
    const result = new Result({
      code: req.body.code,
      budget: req.body.budget,
      resultDate: req.body.resultDate,
      nums: req.body.nums.sort(compare),
      awards: {
        award1: req.body.award1,
        award2: req.body.award2,
        award3: req.body.award3,
        award4: req.body.award4
      }
    });
    result.save((err) => {
      if (err) { return res.status(400).json(err); }
      return res.status(200).json('saved');
    });

  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};

/**
 * PUT /result
 * Update result.
 */
exports.putApiResult = (req, res, next) => {
  req.assert('id', 'Did not found ID result').notEmpty();
  req.assert('budget', 'Budget is invalid').isInt();
  req.assert('resultDate', 'Result Date is invalid').isDate();
  req.assert('nums', 'Ticket is invalid').isArray().isTicket();
  req.assert('award1', 'Award 1 is invalid').isInt();
  req.assert('award2', 'Award 2 is invalid').isInt();
  req.assert('award3', 'Award 3 is invalid').isInt();
  req.assert('award4', 'Award 4 is invalid').isInt();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }
  const id = req.body.id;
  if (req.user && id) {
    Result.update({ _id: id }, {
      $set: {
        resultDate: req.body.resultDate,
        budget: req.body.budget,
        nums: req.body.nums.sort(compare),
        awards: {
          award1: req.body.award1,
          award2: req.body.award2,
          award3: req.body.award3,
          award4: req.body.award4
        }
      }
    }, function (err) {
      if (!err) { return res.status(400).json(err); }
      res.status(200).send('notification!');
    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};

/**
 * DELETE /result
 * delete result.
 */
exports.deleteApiResult = (req, res, next) => {
  const id = req.params.id;
  if (req.user && id) {
    Result.remove({ _id: id }, function (err) {
      if (err) { return res.status(400).json(err); }
      return res.status(200).send('deleted!');
    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};

/**
 * GET /api/result
 * Result Json: Get all results
 */
exports.getApiResult = (req, res) => {
  const limit = Math.max(1, +req.query.limit || 0);
  const page = Math.max(0, +req.query.page - 1 || 0);
  const sort = { resultDate: 'desc' };
  const latest = req.query.latest || false;
  if (!latest) {
    Result.paginate({}, { offset: limit * page, limit: limit, sort: sort, select: queryResultField }, function (err, result) {
      if (err) { return res.status(400).json(err); }
      return res.status(200).json(result);
    });
  } else {
    async.waterfall([
      function (done) {
        Result.findOne().select(queryResultField).sort({ "resultDate": -1 }).exec(function (err, result) {
          done(err, result);
        });
      },
      function (result, done) {
        if (result) {
          Lottery.count({ result: result._id }, function (err, c) {
            return res.status(200).json({ docs: [result], currentLots: c });
          });
        }
      }
    ], (err) => {
      if (err) { return res.status(400).json(err) }
    });

  }
};

function compare(a, b) {
  if (a.rate < b.rate)
    return 1;
  if (a.rate > b.rate)
    return -1;
  return 0;
}