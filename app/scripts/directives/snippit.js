'use strict';

angular.module('codeSearchApp')
  .directive('snippit', function () {
    return {
      template: '<pre>{{snip}}</pre>',
      restrict: 'E',
      scope: {
        snip: '=snip'
      }
    };
  });
