const Lottery = require('../models/Lottery');

/****************************WEBPAGE SESSION********************************/
/**
 * GET /lottery by user | Lottery Index Page.
 */
exports.getLottery = (req, res) => {
  var paramSearch = { 'user': req.user.id };
  Lottery.find(paramSearch, function (err, data) {
    if (err) {
      res.render('error', {
        status: 500
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
  const sort = {updatedAt: 'desc'};
  Lottery.paginate(paramSearch, { offset: limit * page, limit: limit, sort: sort }, function(err, result) {
    if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).json(result);
      }
  });
};

/**
 * POST /lottery
 * Add single||multiple lottery.
 */

exports.postApiLottery = (req, res, next) => {
  req.assert('result', 'Result is required').notEmpty();
  req.assert('condition', 'Condition is required').notEmpty();
  req.assert('num1', 'Number 1 is invalid').notEmpty().isInt();
  req.assert('rate1', 'Rating of Number 1 is invalid').isInt();
  req.assert('num2', 'Number 2 is invalid').notEmpty().isInt();
  req.assert('rate2', 'Rating of Number 2 is invalid').isInt();
  req.assert('num3', 'Number 3 is invalid').notEmpty().isInt();
  req.assert('rate3', 'Rating of Number 3 is invalid').isInt();
  req.assert('num4', 'Number 4 is invalid').notEmpty().isInt();
  req.assert('rate4', 'Rating of Number 4 is invalid').isInt();
  req.assert('num5', 'Number 5 is invalid').notEmpty().isInt();
  req.assert('rate5', 'Rating of Number 5 is invalid').isInt();
  req.assert('num6', 'Number 6 is invalid').notEmpty().isInt();
  req.assert('rate6', 'Rating of Number 6 is invalid').isInt();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/lottery/add');
  }

  if (req.user) {
    const lottery = new Lottery({
      user: req.user.id,
      result: req.body.result,
      status: '',
      condition: req.body.condition,
      nums: {
        num1: {
          value: req.body.num1,
          rate: req.body.rate1
        },
        num2: {
          value: req.body.num2,
          rate: req.body.rate2
        },
        num3: {
          value: req.body.num3,
          rate: req.body.rate3
        },
        num4: {
          value: req.body.num4,
          rate: req.body.rate4
        },
        num5: {
          value: req.body.num5,
          rate: req.body.rate5
        },
        num6: {
          value: req.body.num6,
          rate: req.body.rate6
        }
      }
    });
    lottery.save((err) => {
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
 * PUT /lottery
 * Update Lottery.
 */
exports.putApiLottery = (req, res, next) => {
  req.assert('condition', 'Condition is required').notEmpty();
  req.assert('status', 'Status is required').notEmpty();
  req.assert('num1', 'Number 1 is invalid').notEmpty().isInt();
  req.assert('rate1', 'Rating of Number 1 is invalid').isInt();
  req.assert('num2', 'Number 2 is invalid').notEmpty().isInt();
  req.assert('rate2', 'Rating of Number 2 is invalid').isInt();
  req.assert('num3', 'Number 3 is invalid').notEmpty().isInt();
  req.assert('rate3', 'Rating of Number 3 is invalid').isInt();
  req.assert('num4', 'Number 4 is invalid').notEmpty().isInt();
  req.assert('rate4', 'Rating of Number 4 is invalid').isInt();
  req.assert('num5', 'Number 5 is invalid').notEmpty().isInt();
  req.assert('rate5', 'Rating of Number 5 is invalid').isInt();
  req.assert('num6', 'Number 6 is invalid').notEmpty().isInt();
  req.assert('rate6', 'Rating of Number 6 is invalid').isInt();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.status(500).json(errors);
  }
  const id = req.body.id;
  if (req.user && id) {
    Lottery.update({ _id: id }, {
      $set: {
        condition: req.body.condition,
        status: req.body.status,
        result: req.body.result,
        nums: {
          num1: {
            value: req.body.num1,
            rate: req.body.rate1
          },
          num2: {
            value: req.body.num2,
            rate: req.body.rate2
          },
          num3: {
            value: req.body.num3,
            rate: req.body.rate3
          },
          num4: {
            value: req.body.num4,
            rate: req.body.rate4
          },
          num5: {
            value: req.body.num5,
            rate: req.body.rate5
          },
          num6: {
            value: req.body.num6,
            rate: req.body.rate6
          }
        }
      }
    }, function (err) {
      if (!err) {
        res.status(200).send('notification!');
      }
      else {
        res.status(500).json(err);
      }
    });
  } else {
    res.render('account/login', {
      title: 'Login',
      message: "Login first! You don't have permission to access this URL!"
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
      if (!err) {
        res.status(200).send('notification!');
      }
      else {
        res.status(500).json(err);
      }
    });
  } else {
    res.render('account/login', {
      title: 'Login',
      message: "Login first! You don't have permission to access this URL!"
    });
  }
};