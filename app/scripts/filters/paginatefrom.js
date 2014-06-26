'use strict';

angular.module('codeSearchApp')
  .filter('paginateFrom', function () {
    return function (input, start) {
      return input.slice( Math.floor(start / 10) * 10 );
    };
  });
