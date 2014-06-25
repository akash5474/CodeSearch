'use strict';

describe('Directive: snippit', function () {

  // load the directive's module
  beforeEach(module('codeSearchApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<snippit></snippit>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the snippit directive');
  }));
});
