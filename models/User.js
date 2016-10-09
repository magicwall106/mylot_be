
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const MongooseRole = require('mongoose-role');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  phone: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: Boolean,

  facebook: String,
  twitter: String,
  google: String,
  github: String,
  instagram: String,
  linkedin: String,
  steam: String,
  tokens: Array,
  realAwards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lottery" }],
  tryAwards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recommendation" }],
  profile: {
    firstname: String,
    lastname: String,
    gender: String,
    dob: Date,
    address: String,
    city: String,
    location: String,
    website: String,
    picture: String
  }
}, { timestamps: true });

//add role to user
userSchema.plugin(MongooseRole, {
  roles: ['public', 'user', 'admin', 'superuser'],
  accessLevels: {
    'public': ['public', 'user', 'admin', 'superuser'],
    'anon': ['public'],
    'user': ['user', 'admin', 'superuser'],
    'admin': ['admin', 'superuser'],
    'superuser': ['superuser']
  }
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size) {
  size = 200;
  console.log('size', size);
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;