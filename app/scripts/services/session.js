'use strict';

angular.module('codeSearchApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
