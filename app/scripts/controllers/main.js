'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
    $scope.isCollapsed = {collapse:false};
    $scope.codeSnippits = [];
    $scope.fileUrl = {url: ''};
    $scope.findLibrary = {library:''};
    $scope.findFunction = {libFunction:''};
    $scope.pageArray = [];

    $scope.page = {
      currPage: 0,
      resultsPerPage: 10
    };

    $scope.getNumPages = function() {
      return Math.ceil( $scope.codeSnippits.length / $scope.page.resultsPerPage );
    };

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
          params: { libFunction: $scope.findFunction.libFunction }
      })
      .success(function(data){
        var parsedData = angular.fromJson(data);
        console.log(parsedData);
        $timeout(function(){
          $scope.codeSnippits = parsedData.snippits;
          var pages = Math.ceil( $scope.codeSnippits.length / $scope.page.resultsPerPage );
          $scope.pageArray = [];
          for ( var i = 0; i < pages; i++ ) {
            $scope.pageArray.push(i);
          }
        }, 100);
      });
    };

  });
