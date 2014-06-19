'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.fileUrl = {url: ''};
    $scope.findLibrary = {library:''}
    $scope.findFunction = {function:''}

    $scope.addFile = function () {
      $http.post('/api/addFile', $scope.fileUrl)
        .success(function(data){
          console.log(data)
        })
    };

    $scope.findCode = function () {
      $http.get('/api/findFile', $scope.findLibrary)
        .success(function(data){
          console.log(data)
        })
    };
  });
