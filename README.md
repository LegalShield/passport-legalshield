# passport-legalshield

[Passport](http://passportjs.org/) strategy for authenticating with [LegalShield](https://legalshield.com/)
using the OAuth 2.0 API.

This module lets you authenticate using LegalShield in your Node.js applications.
By plugging into Passport, LegalShield authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install
    $ npm install passport-legalshield

## Usage
### Configure Strategy

The LegalShield authentication strategy authenticates users using a LegalShield account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a API version, client ID, client secret, and callback URL.

    passport.use(new LegalShieldAuthStrategy({
        clientID: LEGALSHIELD_CLIENT_ID,
        clientSecret: LEGALSHIElD_CLIENT_SECRET,
        callbackURL: "https://www.example.net/auth/legalshield/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ providerId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

### Authenticate Requests
Use `passport.authenticate()`, specifying the `'legalshield'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/legalshield',
      passport.authenticate('legalshield'));

    app.get('/auth/legalshield/callback', 
      passport.authenticate('legalshield', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples
Examples not yet provided

## Tests
`npm test`


## Prior work
This strategy is based on Jared Hanson's GitHub strategy for passport: [Jared Hanson](http://github.com/jaredhanson)