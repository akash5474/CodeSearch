'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $timeout, $modal, $log, apiRequest) {
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
     apiRequest.findCode($scope.findLibrary.library, $scope.findFunction.libFunction).then(function(data){

      $scope.codeSnippits = data.codeSnippits;
      $scope.pageArray = data.pageArray;

     })
    };

    $scope.tempId = 1234;

    $scope.snippitVote = function(votePreference, snippitObj) {

      var snippit = snippitObj.snippit;
      var filePath = snippitObj.filePath;

      var snippitData = {
        snippit: snippit,
        votePreference: votePreference,
        filePath: filePath
      };

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
