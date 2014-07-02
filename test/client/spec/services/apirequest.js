'use strict';

describe('Service: apiRequest', function () {

  // load the service's module
  beforeEach(module('codeSearchApp'));

  // instantiate service
  var apiRequest;
  beforeEach(inject(function (_apiRequest_) {
    apiRequest = _apiRequest_;
  }));

  it('should do something', function () {
    expect(!!apiRequest).toBe(true);
  });

});
