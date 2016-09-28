var util = require('util'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;

var Strategy = function Strategy (options, verify) {
  options = JSON.parse(JSON.stringify(options || {}));

  var userTypesMap = {
    membership: '/v2/my/memberships',
    associate: '/v2/my/associate',
    admin: '/v2/my/admin'
  };

  var userTypes = Object.keys(userTypesMap);

  if (!options.userType || !~userTypes.indexOf(options.userType)) {
    throw(new Error('One of the following is required for userType: ' + userTypes.sort().join(', ')));
  }

  this._baseURL    = options.baseURL    || 'https://api.legalshield.com';
  this._profileURL = options.profileURL || this._baseURL + userTypesMap[options.userType];

  options.authorizationURL = options.authorizationURL || this._baseURL + '/auth/authorize';
  options.tokenURL         = options.tokenURL         || this._baseURL + '/auth/token';

  OAuth2Strategy.call(this, options, verify);

  this.name = options.name || 'legalshield-oauth2';
};

// I don't know how to test this,
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(this._profileURL, accessToken, function (err, body) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var profile = { provider: 'legalshield' };

      var jwtPayload = accessToken.split('.')[1];
      jwtPayload = new Buffer(jwtPayload, 'base64').toString('ascii');
      jwtPayload = JSON.parse(jwtPayload);

      profile.id = jwtPayload.account_id;

      var json = JSON.parse(body);
      var info  = json[0] || json;

      profile.displayName = [
        info .first_name,
        info .last_name
      ].join(' ');

      profile.name = {
        givenName: info .first_name,
        middleName: '',
        familyName: info .last_name
      };

      profile.emails = [
        { value: ( info.email || info.email_address ), type: 'home' }
      ];

      profile._json = json;
      profile._raw = body;

      done(err, profile);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = Strategy;
