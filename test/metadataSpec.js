var LegalSheild = require('../'),
    expect = require('chai').expect,
    fs = require('fs');

it('reports the correct package', function () {
  var packageJSON = JSON.parse(fs.readFileSync('./package.json').toString());
  expect(LegalSheild.version).to.eql(packageJSON.version);
});
