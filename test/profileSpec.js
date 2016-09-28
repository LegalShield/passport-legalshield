var LegalSheild = require('../'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    nock = require('nock');

describe('userProfile', function () {
  var strategy, options, verify, info, profile, err, token;

  beforeEach(function () {
    strategy = new LegalSheild.Strategy({ userType: 'membership', clientID: 'my-client-id', clientSecret: 'my-client-secret' }, function () {});
  });

  describe('failure', function () {
    it('passes the error through', function (done) {
      sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
        cb(new Error('oops'));
      });

      strategy.userProfile('token', function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql('failed to fetch user profile');
        expect(err.oauthError).to.exist;
        expect(err.oauthError.message).to.eql('oops');
        done();
      });
    });

    it('catches errors and passes them through', function (done) {
      sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
        cb(null, "This isn't JSON");
      });

      token = [ 'algo', (new Buffer(JSON.stringify({ }))).toString('base64'), 'sig' ].join('.');
      strategy.userProfile(token, function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql('Unexpected token T in JSON at position 0');
        done();
      });
    });
  });

  describe('success', function () {
    context('common', function () {
      beforeEach(function (done) {
        info = {
          first_name: 'Harland',
          last_name: 'Stonecipher',
          membership_number: 01234567890,
          email_address: 'jon@example.com',
        };

        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify([ info ]));
        });

        token = [ 'algo', (new Buffer(JSON.stringify({ account_id: info.membership_number }))).toString('base64'), 'sig' ].join('.');
        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('makes the call to the profileURL', function () {
        expect(strategy._oauth2.get.getCall(0).args[0]).to.eql(strategy._profileURL);
        expect(strategy._oauth2.get.getCall(0).args[1]).to.eql(token);
        expect(strategy._oauth2.get.getCall(0).args[2]).to.be.a('function');
      });

      it('sets the provider', function () {
        expect(profile.provider).to.eql('legalshield');
      });

      it('sets the id', function () {
        expect(profile.id).to.eql(01234567890);
      });

      it('sets _json', function () {
        expect(profile._json).to.eql([ info ]);
      });

      it('sets _raw', function () {
        expect(profile._raw).to.eql(JSON.stringify([ info ]));
      });
    });

    context('membership', function () {
      beforeEach(function (done) {
        info = {
          first_name: 'Harland',
          last_name: 'Stonecipher',
          membership_number: 01234567890,
          email_address: 'harland@example.com',
        };

        token = [ 'algo', (new Buffer(JSON.stringify({ account_id: info.membership_number, }))).toString('base64'), 'sig' ].join('.');
        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify([ info ]));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('sets the displayName', function () {
        expect(profile.displayName).to.eql('Harland Stonecipher');
      });

      it('sets the name', function () {
        expect(profile.name.givenName).to.eql('Harland');
        expect(profile.name.middleName).to.eql('');
        expect(profile.name.familyName).to.eql('Stonecipher');
      });

      it('sets the emails', function () {
        expect(profile.emails[0].type).to.eql('home');
        expect(profile.emails[0].value).to.eql(info.email_address);
      });
    });

    context('associate', function () {
      beforeEach(function (done) {
        info = {
          id: 123456789,
          first_name: 'Harland',
          last_name: 'Stonecipher',
          email: 'harland@example.com',
        };

        token = [ 'algo', (new Buffer(JSON.stringify({ account_id: info.id, }))).toString('base64'), 'sig' ].join('.');
        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify(info));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('sets the displayName', function () {
        expect(profile.displayName).to.eql('Harland Stonecipher');
      });

      it('sets the name', function () {
        expect(profile.name.givenName).to.eql('Harland');
        expect(profile.name.middleName).to.eql('');
        expect(profile.name.familyName).to.eql('Stonecipher');
      });

      it('sets the emails', function () {
        expect(profile.emails[0].type).to.eql('home');
        expect(profile.emails[0].value).to.eql(info.email);
      });
    });

    context('admin', function () {
      beforeEach(function (done) {
        info = {
          id: 123456789,
          first_name: 'Harland',
          last_name: 'Stonecipher'
        };

        token = [ 'algo', (new Buffer(JSON.stringify({ account_id: info.id, }))).toString('base64'), 'sig' ].join('.');
        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify(info));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('sets the displayName', function () {
        expect(profile.displayName).to.eql('Harland Stonecipher');
      });

      it('sets the name', function () {
        expect(profile.name.givenName).to.eql('Harland');
        expect(profile.name.middleName).to.eql('');
        expect(profile.name.familyName).to.eql('Stonecipher');
      });
    });
  });
});
