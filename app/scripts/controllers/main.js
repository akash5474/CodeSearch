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
        console.log(parsedData.snippits);
        parsedData.snippits.sort(function(a, b) {
          if (a.snippitScore < b.snippitScore) {
            return 1;
          } else if (a.snippitScore > b.snippitScore) {
            return -1;
          } else {
            return 0;
          }
        });
        $timeout(function(){
          $scope.codeSnippits = parsedData.snippits;
          console.log($scope.codeSnippits);
          var pages = Math.ceil( $scope.codeSnippits.length / $scope.page.resultsPerPage );
          $scope.pageArray = [];
          for ( var i = 0; i < pages; i++ ) {
            $scope.pageArray.push(i);
          }
        }, 100);
      });
    };

    $scope.snippitVote = function(votePreference, snippitObj) {

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
            votePreference: votePreference,
            filePath: filePath
          };
          console.log(snippitData);
          $http.post('/api/snippitVote', snippitData)
          .success(function(data){
            console.log(data);
          });
        }
      }
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
