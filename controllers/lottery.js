const Lottery = require('../models/Lottery');
const async = require('async');
const queryRateField = '_id result condition status award nums';
/****************************WEBPAGE SESSION********************************/
/**
 * GET /lottery by user | Lottery Index Page.
 */
exports.getLottery = (req, res) => {
  var paramSearch = { 'user': req.user.id };
  Lottery.find(paramSearch, function (err, data) {
    if (err) {
      res.render('error', {
        status: 400
      });
    } else {
      res.render('lottery/index', {
        title: 'Lottery',
        listLottery: data
      });
    }
  });
};

/**
 * GET /lottery/add | Add Lottery Page.
 */
exports.getAddLottery = (req, res) => {
  res.render('lottery/add', {
    title: 'Add New Lottery'
  });
};

/****************************API SESSION********************************/
/**
 * GET /api/lottery
 * Lottery Json: Get all lotteries
 */
exports.getApiLottery = (req, res) => {
  const limit = Math.max(10, req.query.limit || 0);
  const page = Math.max(0, req.query.page || 0);
  var paramSearch = { 'user': req.user.id };
  const sort = { updatedAt: 'desc' };
  Lottery.paginate(paramSearch, { offset: limit * page, limit: limit, sort: sort, select: queryRateField }, function (err, result) {
    if (err) { res.status(400).json(err); }
    res.status(200).json(result);
  });
};

/**
 * POST /lottery
 * Add single||multiple lottery.
 */
exports.postApiLottery = (req, res, next) => {
  req.assert('form', 'Form is invalid').isArray().isListTicket();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }

  if (req.user) {
    var form = req.body.form;
    async.waterfall([
      function (done) {
        var lotteries = [];
        var err = [];
        for (var i = 0; i < form.length; i++) {
          if (form[i]) {
            form[i].user = req.user.id;
            form[i].nums = numsToArray(form[i].nums);
            form[i].status = '';
            lotteries.push(new Lottery(form[i]));
          } else {
            err.push({ itemNum: i, msg: 'Ticket index(' + i + ') id null' })
            continue;
          }
        }
        done(err.length == 0 ? null : err, lotteries);
      },
      function (lotteries, done) {
        if (lotteries) {
          var functions = [];
          for (var i = 0; i < lotteries.length; i++) {
            functions.push((function (doc) {
              return function (callback) {
                doc.save(callback);
              };
            })(lotteries[i]));
          }
          done(null, functions);
        }
      },
      function (functions, done) {
        async.parallel(functions, function (errors, results) {
          return res.status(200).json(results);
        });
      }
    ], (err) => {
      if (err) { return res.status(400).json(err) }
    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
}

/**
 * POST /lottery
 * Add single||multiple lottery.
 */
/*exports.postApiLottery = (req, res, next) => {
  req.assert('form', 'Form is invalid').isArray();
  req.assert('condition', 'Condition is required').notEmpty();
  req.assert('nums', 'Your ticket is invalid').isArray().isTicket();
  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }

  if (req.user) {
    const lottery = new Lottery({
      user: req.user.id,
      result: req.body.result,
      status: '',
      condition: req.body.condition,
      nums: req.body.nums.sort(compare)
    });
    lottery.save((err) => {
      if (err) { return res.status(400).json(err); }
      return res.status(200).send('saved');
    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};*/

/**
 * PUT api/lottery
 * Update Lottery.
 */
exports.putApiLottery = (req, res, next) => {
  req.assert('condition', 'Condition is required').notEmpty();
  req.assert('status', 'Status is required').notEmpty();
  req.assert('nums', 'Your ticket is invalid').isArray().isTicket();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }
  const id = req.body.id;
  if (req.user && id) {
    Lottery.update({ _id: id }, {
      $set: {
        condition: req.body.condition,
        status: req.body.status,
        result: req.body.result,
        nums: req.body.nums
      }
    }, function (err) {
      if (err) { return res.status(400).json(err); }
      return res.status(200).send('updated!');

    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};

/**
 * DELETE /lottery
 * delete lottery.
 */
exports.deleteApiLottery = (req, res, next) => {
  const id = req.params.id;
  if (req.user && id) {
    Lottery.remove({ _id: id }, function (err) {
      if (err) { return res.status(400).json(err); }
      return res.status(200).send('notification!');
    });
  } else {
    res.status(400).json({
      title: 'Login',
      msg: "Login first! You don't have permission to access this URL!"
    });
  }
};

function numsToArray(nums) {
  return Object.keys(nums).map(function (key) { return nums[key]; });

}