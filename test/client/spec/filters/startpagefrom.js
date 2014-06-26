'use strict';

describe('Filter: startPageFrom', function () {

  // load the filter's module
  beforeEach(module('codeSearchApp'));

  // initialize a new instance of the filter before each test
  var startPageFrom;
  beforeEach(inject(function ($filter) {
    startPageFrom = $filter('startPageFrom');
  }));

  it('should return the input prefixed with "startPageFrom filter:"', function () {
    var text = 'angularjs';
    expect(startPageFrom(text)).toBe('startPageFrom filter: ' + text);
  });

});
