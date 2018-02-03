var util = require('util'),
    url = require('url'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;

var Strategy = function Strategy (options, verify) {
  options = JSON.parse(JSON.stringify(options || {}));

  var uri = url.parse(options.baseURL || 'https://api.legalshield.com');
  this._baseURL = url.format(uri);

  uri.pathname = '/auth/authorize';
  options.authorizationURL = options.authorizationURL || url.format(uri);

  uri.pathname = '/auth/token';
  options.tokenURL = options.tokenURL || url.format(uri);

  OAuth2Strategy.call(this, options, verify);
  this._oauth2.useAuthorizationHeaderforGET(true);

  this.name = options.name || 'legalshield-oauth2';
};

// I don't know how to test this,
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function (accessToken, done) {
  var userTypesMap, userTypes, jwtPayload, profile, profileURL, json, email;

  userTypesMap = {
    Member: '/v2/my/membership',
    Associate: '/v2/my/associate',
    Admin: '/v2/admin/me'
  };
  userTypes = Object.keys(userTypesMap);

  try {
    jwtPayload = accessToken.split('.')[1];
    jwtPayload = new Buffer(jwtPayload, 'base64').toString('ascii');
    jwtPayload = JSON.parse(jwtPayload);
  } catch (e) {
    var error = new Error('Error parsing the JWT');
    error.orignal_error = e;
    return done(error);
  }

  if (!~userTypes.indexOf(jwtPayload.account_type)) {
    var error = new Error("Unknown token type '" + jwtPayload.account_type + "' was found. Please use a supported type: " + userTypes.sort().join(', '));
    return done(error);
  }

  profile = {
    id: jwtPayload.account_id,
    account_type: jwtPayload.account_type,
    provider: 'legalshield'
  };

  var uri = url.parse(this._baseURL);
  uri.pathname = userTypesMap[jwtPayload.account_type]
  profileURL = url.format(uri);

  this._oauth2.get(profileURL, accessToken, function (err, body) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      json = JSON.parse(body);

      profile.displayName = [
        json.first_name,
        json.last_name
      ].join(' ');

      profile.name = {
        givenName: json.first_name,
        middleName: '',
        familyName: json.last_name
      };

      if (email = (json.email || json.email_address)) {
        profile.emails = [ { value: email, type: 'home' } ];
      }

      profile._json = json;
      profile._raw = body;

      done(err, profile);
    } catch (e) {
      var error = new Error('Error building the Profile');
      error.orignal_error = e;
      done(error);
    }
  });
};

module.exports = Strategy;
