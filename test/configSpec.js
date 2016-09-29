var LegalShield = require('../'),
    expect = require('chai').expect;

it('exports the Strategy', function () {
  expect(LegalShield.Strategy).to.exist;
});

describe('config', function () {
  var strategy, options, verify;

  beforeEach(function () {
    options = {
      clientID: 'my-client-id',
      clientSecret: 'my-client-secret'
    };
    verify = function () {};
    strategy = new LegalShield.Strategy(options, verify);
  });

  describe('name', function () {
    it('defaults correctly', function () {
      expect(strategy.name).to.eql('legalshield-oauth2');
    });

    it('can be overwritten', function () {
      options.name = 'auth';
      strategy = new LegalShield.Strategy(options, verify);
      expect(strategy.name).to.eql('auth');
    });
  });

  describe('_baseURL', function () {
    it('defaults correct', function () {
      expect(strategy._baseURL).to.eql('https://api.legalshield.com');
    });

    it('can be overwritten', function () {
      options.baseURL = 'base';
      strategy = new LegalShield.Strategy(options, verify);
      expect(strategy._baseURL).to.eql('base');
    });
  });
});
