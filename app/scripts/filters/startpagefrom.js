'use strict';

angular.module('codeSearchApp')
  .filter('startPageFrom', function () {
    return function (input, start) {
      if ( input ) {
        start = +start;
        return input.slice(start);
      }
    };
  });
