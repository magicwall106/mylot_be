/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const resultController = require('./controllers/result');
const rateController = require('./controllers/rate');
const recommendationController = require('./controllers/recommendation');
const lotteryController = require('./controllers/lottery');
const socialController = require('./controllers/social');
const customValidators = require('./controllers/customValidator');
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!', chalk.green('✓'));
});
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(customValidators.customValidators);

var sessionOption = {
  name: 'mylot.sid',
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}; 
var sessionMiddleware = session( sessionOption );
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (/^\/api\//.test(req.path) /*req.path === '/api/upload'*/) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(function (req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(function (req, res, next) {
  var allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://mylot-expressapp.rhcloud.com','http://129.vn/mylot.html','http://mylotfe-expressapp.rhcloud.com',];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }

  //res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials",true);
  res.header("Allow","GET, HEAD, POST, PUT, DELETE");
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
/*app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

app.get('/result', passportConfig.isAuthenticated, resultController.getResult);
app.get('/result/add', passportConfig.isAuthenticated, resultController.getAddResult);
app.get('/recommendation', passportConfig.isAuthenticated, recommendationController.getRecommendation);
app.get('/recommendation/add', passportConfig.isAuthenticated, recommendationController.getAddRecommendation);
app.get('/lottery', passportConfig.isAuthenticated, lotteryController.getLottery);
app.get('/lottery/add', passportConfig.isAuthenticated, lotteryController.getAddLottery);*/

/*USER API****************/
app.post('/api/login', userController.postApiLogin);
app.get('/api/logout', userController.getApiLogout);
app.post('/api/signup', userController.postApiSignup);
app.get('/api/account/profile', passportConfig.isApiAuthenticated, userController.getApiProfile);
app.post('/api/account/profile', passportConfig.isApiAuthenticated, userController.postApiUpdateProfile);
app.post('/api/account/password', passportConfig.isApiAuthenticated, userController.postApiUpdatePassword);
app.get('/api/account/unlink/:provider', passportConfig.isApiAuthenticated, userController.getApiOauthUnlink);
app.get('/api/account/activate', userController.getApiActive);
app.get('/api/reset/init', userController.getApiReset);
app.post('/api/reset/finish', userController.postApiReset);
app.post('/api/forgot', userController.postApiForgot);

app.post('/api/contact', contactController.postApiContact);

/**
 * API result.
 */
app.get('/api/result', resultController.getApiResult);
app.put('/api/result', resultController.putApiResult);
app.post('/api/result', resultController.postApiResult);
app.delete('/api/result/:id', resultController.deleteApiResult);

/**
 * API recommendation.
 */
app.get('/api/recommendation', passportConfig.isApiAuthenticated, recommendationController.getApiRecommendation);
app.put('/api/recommendation', passportConfig.isApiAuthenticated, recommendationController.putApiRecommendation);
app.post('/api/recommendation', passportConfig.isApiAuthenticated, recommendationController.postApiRecommendation);
app.delete('/api/recommendation/:id', passportConfig.isApiAuthenticated, recommendationController.deleteApiRecommendation);

/**
 * API lottery.
 */
app.get('/api/lottery', passportConfig.isApiAuthenticated, lotteryController.getApiLottery);
app.put('/api/lottery', passportConfig.isApiAuthenticated, lotteryController.putApiLottery);
app.post('/api/lottery', passportConfig.isApiAuthenticated, lotteryController.postApiLottery);
app.delete('/api/lottery/:id', passportConfig.isApiAuthenticated, lotteryController.deleteApiLottery);

/**
 * API rate.
 */
app.get('/api/rate', rateController.getApiRate);
app.put('/api/rate', passportConfig.isApiAuthenticated, rateController.putApiRate);
app.post('/api/rate', passportConfig.isApiAuthenticated, rateController.postApiRate);
app.delete('/api/rate/:id', passportConfig.isApiAuthenticated, rateController.deleteApiRate);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/google-maps', apiController.getGoogleMaps);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.post('/api/auth/facebook/token', passport.authenticate('facebook-token'),
  function (req, res) {
    res.status(200).json(req.user);
  }
);

app.post('/api/auth/facebook', socialController.postApiAuthFacebook);
app.post('/api/auth/provider', socialController.postAuthSocial);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 3000;
/*app.listen(app.get('port'), () => {
  console.log('%s Express server listening on port %d in %s mode.', chalk.green('✓'), app.get('port'), app.get('env'));
});*/
app.listen(PORT, IP_ADDRESS, function () {
  console.log("Express server listening on port %d in %s mode", PORT, app.settings.env);
});

module.exports = app;
