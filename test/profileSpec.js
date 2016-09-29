var LegalShield = require('../'),
    expect = require('chai').expect,
    sinon = require('sinon');

describe('userProfile', function () {
  var strategy, options, verify, info, profile, err, token;

  beforeEach(function () {
    strategy = new LegalShield.Strategy({ userType: 'membership', clientID: 'my-client-id', clientSecret: 'my-client-secret' }, function () {});
  });

  describe('failure', function () {
    beforeEach(function () {
      token = [
        'algo',
        (new Buffer(JSON.stringify({
          account_id: 1234,
          account_type: 'Member'
        }))).toString('base64'),
        'sig'
      ].join('.');
    });

    it('passes oauth2 errors through', function (done) {
      sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
        cb(new Error('oops'));
      });

      strategy.userProfile(token, function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql('failed to fetch user profile');
        expect(err.oauthError).to.exist;
        expect(err.oauthError.message).to.eql('oops');
        done();
      });
    });

    it('passes an error when the jwt has an unknown token type', function (done) {
      token = [
        'algo',
        (new Buffer(JSON.stringify({
          account_id: 1234,
          account_type: 'Unknown'
        }))).toString('base64'),
        'sig'
      ].join('.');

      strategy.userProfile(token, function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql("Unknown token type 'Unknown' was found. Please use a supported type: Admin, Associate, Member");
        done();
      });
    });

    it('catches errors when parsing the profile response', function (done) {
      sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
        cb(null, "This isn't JSON");
      });

      strategy.userProfile(token, function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql('Error building the Profile');
        expect(err.orignal_error).to.exist;
        expect(err.orignal_error.message).to.eql('Unexpected token T in JSON at position 0');
        done();
      });
    });

    it('catches errors when parsing the jwt fails', function (done) {
      sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
        cb(null, "This isn't JSON");
      });

      strategy.userProfile('not a token', function (err, profile) {
        expect(err).to.exist;
        expect(err.message).to.eql('Error parsing the JWT');
        expect(err.orignal_error).to.exist;
        expect(err.orignal_error.message).to.eql('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
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

        token = [
          'algo',
          (new Buffer(JSON.stringify({
            account_id: info.membership_number,
            account_type: 'Member'
          }))).toString('base64'),
          'sig'
        ].join('.');

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('sets the provider', function () {
        expect(profile.provider).to.eql('legalshield');
      });

      it('sets the id', function () {
        expect(profile.id).to.eql(01234567890);
      });

      it('sets the account_type', function () {
        expect(profile.account_type).to.eql('Member');
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

        token = [
          'algo',
          (new Buffer(JSON.stringify({
            account_id: info.membership_number,
            account_type: 'Member'
          }))).toString('base64'),
          'sig'
        ].join('.');

        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify([ info ]));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('makes the call to the profileURL', function () {
        expect(strategy._oauth2.get.getCall(0).args[0]).to.eql('https://api.legalshield.com/v2/my/memberships');
        expect(strategy._oauth2.get.getCall(0).args[1]).to.eql(token);
        expect(strategy._oauth2.get.getCall(0).args[2]).to.be.a('function');
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

        token = [
          'algo',
          (new Buffer(JSON.stringify({
            account_id: info.id,
            account_type: 'Associate'
          }))).toString('base64'),
          'sig'
        ].join('.');

        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify(info));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('makes the call to the profileURL', function () {
        expect(strategy._oauth2.get.getCall(0).args[0]).to.eql('https://api.legalshield.com/v2/my/associate');
        expect(strategy._oauth2.get.getCall(0).args[1]).to.eql(token);
        expect(strategy._oauth2.get.getCall(0).args[2]).to.be.a('function');
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

        token = [
          'algo',
          (new Buffer(JSON.stringify({
            account_id: info.id,
            account_type: 'Admin'
          }))).toString('base64'),
          'sig'
        ].join('.');

        sinon.stub(strategy._oauth2, 'get', function (url, accessToken, cb) {
          cb(null, JSON.stringify(info));
        });

        strategy.userProfile(token, function (_err, _profile) {
          err     = _err;
          profile = _profile
          done();
        });
      });

      it('makes the call to the profileURL', function () {
        expect(strategy._oauth2.get.getCall(0).args[0]).to.eql('https://api.legalshield.com/v2/admin/me');
        expect(strategy._oauth2.get.getCall(0).args[1]).to.eql(token);
        expect(strategy._oauth2.get.getCall(0).args[2]).to.be.a('function');
      });

      it('sets the displayName', function () {
        expect(profile.displayName).to.eql('Harland Stonecipher');
      });

      it('sets the name', function () {
        expect(profile.name.givenName).to.eql('Harland');
        expect(profile.name.middleName).to.eql('');
        expect(profile.name.familyName).to.eql('Stonecipher');
      });

      it('does not set the email', function () {
        expect(profile.emails).to.not.exist;
      });
    });
  });
});
