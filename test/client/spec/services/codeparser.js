'use strict';

describe('Service: codeParser', function () {

  // load the service's module
  beforeEach(module('codeSearchApp'));

  // instantiate service
  var codeParser;
  beforeEach(inject(function (_codeParser_) {
    codeParser = _codeParser_;
  }));

  it('should do something', function () {
    expect(!!codeParser).toBe(true);
  });

});
