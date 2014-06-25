'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
    $scope.codeSnippets = [];
    $scope.fileUrl = {url: ''};
    $scope.findLibrary = {library:''};
    $scope.findFunction = {libFunction:''};

    $scope.addFile = function () {
      $http.post('/api/addFile', $scope.fileUrl)
        .success(function(data){
          console.log(data);
        })
    };

    $scope.testDirectorySearch = function () {
      $http.post('/api/testDirectorySearch', {})
        .success(function(data){
          console.log(data);
        })
    }

    $scope.findCode = function () {
      $http({
          method:'GET',
          url:'/api/findFile',
          params: {library: $scope.findLibrary.library,
                 libFunction: $scope.findFunction.libFunction}
      })
      .success(function(data){
        var parsedData = angular.fromJson(data);
        console.log(parsedData);
        $timeout(function(){
          $scope.codeSnippits = parsedData.snippits;
        }, 100);
      });
    };
  });
