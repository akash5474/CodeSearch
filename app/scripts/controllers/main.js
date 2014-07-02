'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $timeout, $modal, $log) {
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
          params: {
            library: $scope.findLibrary.library,
            libFunction: $scope.findFunction.libFunction
          }
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

    $scope.tempId = 1234;

    $scope.snippitVote = function(votePreference, snippitObj) {
      // if (!$rootScope.currentUser) {
      //   $scope.notSignedIn = true;
      //   $timeout(function(){
      //     $scope.notSignedIn = false;
      //   }, 3000);
      // }

      var snippit = snippitObj.snippit;
      var filePath = snippitObj.filePath;

      var snippitData = {
        snippit: snippit,
        votePreference: votePreference,
        filePath: filePath
      };
      console.log(snippitData);
      $http.post('/api/snippitVote', snippitData)
      .success(function(data){
        console.log(data);
      });
    };

    $scope.openModal = function(size, snippitObj) {

      var modalInstance = $modal.open({
        templateUrl: '/partials/codesnippetmodal',
        controller: 'ModalCtrl',
        size: size,
        resolve: {
          data: function() {
            return {
              snippitObj: snippitObj
            }
          }
        }
      });

      modalInstance.result.then(function(selectedItem) {
        $scope.selected = selectedItem;

      }, function() {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  });
