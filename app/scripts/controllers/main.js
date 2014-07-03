'use strict';

angular.module('codeSearchApp')
  .controller('MainCtrl', function ($rootScope, $scope, $http, $timeout, $modal, $log, apiRequest, Auth) {
    $scope.isCollapsed = {collapse:false};
    $scope.codeSnippits = [];
    $scope.fileUrl = {url: ''};
    $scope.findLibrary = {library:''};
    $scope.findFunction = {libFunction:''};
    $scope.pageArray = [];
    $scope.$on('LOAD', function(){
      $scope.loading=true
    });
    $scope.$on('UNLOAD', function(){
      $scope.loading=false
    });

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

     $scope.$emit('LOAD');
     apiRequest.findCode($scope.findLibrary.library, $scope.findFunction.libFunction).then(function(data){

      $scope.loading = false;
      $scope.codeSnippits = data.codeSnippits;
      $scope.pageArray = data.pageArray;

     })
    };

    $scope.snippitVote = function(votePreference, snippitObj) {
// <<<<<<< HEAD
//       apiRequest.snippitVote(votePreference,snippitObj);
// =======

        var indexPreSort = $scope.codeSnippits.indexOf(snippitObj);
        var scopeSnippit = $scope.codeSnippits[indexPreSort];

      if (!$rootScope.currentUser) {
        scopeSnippit.notSignedIn = true;
        $timeout(function(){
          scopeSnippit.notSignedIn = false;
        }, 3000);
      } else {

        var githubId = $rootScope.currentUser.github_id;
        var snippitScore = scopeSnippit.snippitScore;
        var snippitVoterInfo = scopeSnippit.snippitVoters;

        if (snippitVoterInfo[githubId] === votePreference) {
          scopeSnippit.duplicateVote = true;
          $timeout(function(){
            scopeSnippit.duplicateVote = false;
          }, 3000);
        } else {

          if (typeof snippitVoterInfo[githubId] === 'undefined') {
            console.log('no vote: ', snippitVoterInfo[githubId]);
            snippitVoterInfo[githubId] = 0;
          }

          scopeSnippit.snippitScore += votePreference;
          snippitVoterInfo[githubId] += votePreference;

          console.log(snippitVoterInfo[githubId]);

          var snippit = snippitObj.snippit;
          var filePath = snippitObj.filePath;

          var snippitData = {
            snippit: snippit,
            votePreference: snippitVoterInfo[githubId],
            filePath: filePath
          };
          console.log(snippitData);
          $http.post('/api/snippitVote', snippitData)
          .success(function(data){
            console.log(data);
          });
        }
      }
// >>>>>>> smeidan-master
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
