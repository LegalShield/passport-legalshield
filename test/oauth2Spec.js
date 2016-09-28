var LegalSheild = require('../'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    nock = require('nock');

describe('oauth2 config', function () {
  var strategy, options, verify;

  beforeEach(function () {
    options = {
      userType: 'admin',
      clientID: 'my-client-id',
      clientSecret: 'my-client-secret'
    };
    verify = function () {};
    strategy = new LegalSheild.Strategy(options, verify);
  });

  it('configs the oauth2 module', function () {
    expect(strategy._oauth2).to.exist;
  });

  it('set clientID correctly', function () {
    expect(strategy._oauth2._clientId).to.eql('my-client-id');
  });

  it('set clientSecret correctly', function () {
    expect(strategy._oauth2._clientSecret).to.eql('my-client-secret');
  });

  describe('authorizationURL', function () {
    it('is defaulted correctly', function () {
      expect(strategy._oauth2._authorizeUrl).to.eql('https://api.legalshield.com/auth/authorize');
    });

    it('is based off the baseURL', function () {
      options.baseURL = 'https://api.staging.legalshield.com';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._oauth2._authorizeUrl).to.eql('https://api.staging.legalshield.com/auth/authorize');
    });

    it('can be overwritten', function () {
      options.authorizationURL = 'hey mama';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._oauth2._authorizeUrl).to.eql('hey mama');
    });
  });

  describe('tokenURL', function () {
    it('is defaulted correctly', function () {
      expect(strategy._oauth2._accessTokenUrl).to.eql('https://api.legalshield.com/auth/token');
    });

    it('is based off the baseURL', function () {
      options.baseURL = 'https://api.staging.legalshield.com';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._oauth2._accessTokenUrl).to.eql('https://api.staging.legalshield.com/auth/token');
    });

    it('can be overwritten', function () {
      options.tokenURL = 'tokenz';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._oauth2._accessTokenUrl).to.eql('tokenz');
    });
  });

  describe('verify', function () {
    it('passes the verify callback through correctly', function (done) {
      strategy = new LegalSheild.Strategy(options, done);
      strategy._verify();
    });
  });
});

describe('inherited properties', function () {
  // I don't know how to test this,
  it('inherits from OAuth2Strategy');
});
