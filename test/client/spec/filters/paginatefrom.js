'use strict';

describe('Filter: paginateFrom', function () {

  // load the filter's module
  beforeEach(module('codeSearchApp'));

  // initialize a new instance of the filter before each test
  var paginateFrom;
  beforeEach(inject(function ($filter) {
    paginateFrom = $filter('paginateFrom');
  }));

  it('should return the input prefixed with "paginateFrom filter:"', function () {
    var text = 'angularjs';
    expect(paginateFrom(text)).toBe('paginateFrom filter: ' + text);
  });

});
