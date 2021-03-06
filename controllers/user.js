const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

const queryUserField = 'email profile active google facebook realAwards tryAwards role';
/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * POST /api/login
 * API Sign in using email and password.
 */
exports.postApiLogin = (req, res, next) => {
  var a = req.body.email;
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return res.status(400).json(err); }
    if (!user) {
      return res.status(400).json(info);
    }
    req.logIn(user, (err) => {
      if (err) { return res.status(400).json(err); }
      return res.status(200).json({ msg: 'Logged in succesfully' });
    });
  })(req, res, next);
};



/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /api/logout
 * API Log out.
 */
exports.getApiLogout = (req, res) => {
  req.logout();
  return res.status(200).json({ msg: 'Logout Success' });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone || '',
    role: process.env.ROLE_USER
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * POST /api/signup
 * API Create a new local account.
 */
exports.postApiSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(401).json(errors);
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone || '',
    role: process.env.ROLE_USER
  });

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (existingUser) {
          return res.status(400).json({ msg: 'Account with that email address already exists.' });
        }
        user.activeKey = token;
        user.active = false;
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERID,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylot@starter.com',
        subject: 'Activate your account on Mylot',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${req.headers.referer}#/activate?key=${token}\n\n 
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        done(err);
        User.findById(user._id, queryUserField, (err, account) => {
          return res.status(200).json(account);
        });
      });
    }
  ], (err) => {
    if (err) { return res.status(400).json(err) }
    //return res.status(400).json({ msg: '/login' });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * Get /api/account/profile
 * API get profile information.
 */
exports.getApiProfile = (req, res, next) => {
  User.findById(req.user.id, queryUserField, (err, user) => {
    if (err) { return res.status(400).json(err); }
    return res.status(200).json(user);
  });
};

/**
 * POST /api/account/profile
 * API Update profile information.
 */
exports.postApiUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(401).json(errors);
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return res.status(400).json(err); }
    user.email = req.body.email || '';
    user.phone = req.body.phone || '';
    user.profile.dob = req.body.profile.dob || '';
    user.profile.firstname = req.body.profile.firstname || '';
    user.profile.lastname = req.body.profile.lastname || '';
    user.profile.gender = req.body.profile.gender || '';
    user.profile.address = req.body.profile.address || '';
    user.profile.city = req.body.profile.city || '';
    user.profile.website = req.body.profile.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          return res.status(400).json({ msg: 'The email address you have entered is already associated with an account.' });
        }
        return res.status(400).json(err);;
      }
      return res.status(200).json(user);
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /api/account/password
 * API Update current password.
 */
exports.postApiUpdatePassword = (req, res, next) => {
  req.assert('newPassword', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.newPassword);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(401).json(errors);
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return res.status(400).json(err); }
    user.password = req.body.newPassword;
    user.save((err) => {
      if (err) { return res.status(400).json(err); }
      return res.status(200).json({ msg: 'Password has been changed.' });
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /api/account/unlink/:provider
 * API Unlink OAuth provider.
 */
exports.getApiOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return res.status(400).json(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return res.status(400).json(err); }
      return res.status(200).json({ msg: `${provider} account has been unlinked.` })
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function (done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERID,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylot@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /api/reset/init?token=xxx
 * API Reset Password page.
 */
exports.getApiReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(400).json({ msg: 'Account is logged by someone' });
  }
  User
    .findOne({ passwordResetToken: req.query.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return res.status(400).json({ msg: 'Something went wrong' }) }
      if (!user) {
        return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
      }
      return res.status(200).json({ msg: 'Process setting new password' });
    });
};

/**
 * POST /api/reset/finish
 * API Process the reset password request.
 */
exports.postApiReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    return res.status(401).json(errors);
  }

  async.waterfall([
    function (done) {
      User
        .findOne({ passwordResetToken: req.body.key })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return res.status(400).json(err); }
          if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return res.status(400).json(err) }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERID,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylot@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        done(err);
        return res.status(200).json({ msg: 'Success! Your password has been changed.' })
      });
    }
  ], (err) => {
    if (err) { return res.status(400).json(err) }
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERID,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylot@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${req.headers.referer}reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};

/**
 * POST /api/forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postApiForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.status(401).json(errors);
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          return res.status(400).json({ msg: 'Account with that email address does not exist.' });
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERID,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'mylot@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${req.headers.referer}#/reset/finish?key=${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        done(err);
        return res.status(200).json({ msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      });
    }
  ], (err) => {
    if (err) { return res.status(400).json(err) }
    //return res.status(400).json({ msg: '/forgot' });
  });
};

exports.getApiActive = (req, res, next) => {
  const activeKey = req.query.key;
  User.findOne({ activeKey: activeKey }, queryUserField, (err, user) => {
    if (err) { return res.status(400).json(err) }
    if (!user) {
      return res.status(400).json({ msg: 'Activate key does not exist.' });
    }
    if (user.active === true) {
      return res.status(400).json({ msg: 'Account has been active' });
    }
    user.active = true;
    user.save((err) => {
      if (err) { return res.status(400).json(err) }
      return res.status(200).json(user);
    });
  });

}