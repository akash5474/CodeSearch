'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.fileUrl = {url: ''};

    $scope.addFile = function () {
      $http.post('/api/addFile', $scope.fileUrl)
        .success(function(data){
          console.log(data)
        })
    };
  });
