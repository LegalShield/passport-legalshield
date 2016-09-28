var LegalSheild = require('../'),
    expect = require('chai').expect;

it('exports the Strategy', function () {
  expect(LegalSheild.Strategy).to.exist;
});

describe('config', function () {
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

  describe('name', function () {
    it('defaults correctly', function () {
      expect(strategy.name).to.eql('legalshield-oauth2');
    });

    it('can be overwritten', function () {
      options.name = 'auth';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy.name).to.eql('auth');
    });
  });

  describe('userType', function () {
    beforeEach(function () {
      delete options.userType;
    });

    it('requires the userType to be passed in', function () {
      expect(function () {
        new LegalSheild.Strategy(options, verify);
      }).to.throw(Error, 'One of the following is required for userType: admin, associate, membership');
    });

    it('requires the userType to be on the white list', function () {
      options.userType = 'wrong';
      expect(function () {
        new LegalSheild.Strategy(options, verify);
      }).to.throw(Error, 'One of the following is required for userType: admin, associate, membership');
    });
  });

  describe('_baseURL', function () {
    it('defaults correct', function () {
      expect(strategy._baseURL).to.eql('https://api.legalshield.com');
    });

    it('can be overwritten', function () {
      options.baseURL = 'base';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._baseURL).to.eql('base');
    });
  });

  describe('_profileURL', function () {
    it('is set correctly for userType membership', function () {
      options.userType = 'membership';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._profileURL).to.eql('https://api.legalshield.com/v2/my/memberships');
    });

    it('is set correctly for userType associate', function () {
      options.userType = 'associate';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._profileURL).to.eql('https://api.legalshield.com/v2/my/associate');
    });

    it('is set correctly for userType admin', function () {
      options.userType = 'admin';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._profileURL).to.eql('https://api.legalshield.com/v2/my/admin');
    });

    it('can be overwritten', function () {
      options.userType = 'admin';
      options.profileURL = '/test';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._profileURL).to.eql('/test');
    });

    it('is built from the baseURL', function () {
      options.userType = 'admin';
      options.baseURL = 'https://www.google.com';
      strategy = new LegalSheild.Strategy(options, verify);
      expect(strategy._profileURL).to.eql('https://www.google.com/v2/my/admin');
    });
  });
});
