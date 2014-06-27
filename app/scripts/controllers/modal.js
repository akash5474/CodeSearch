'use strict';

angular.module('codeSearchApp')
  // .filter('snippitHighlight', function($sce) {
  //       return function(content, snippit) {
  //         // var text = content.replace(snippit, '<span>"hello"</span>')
          // var snippitStartIdx = content.indexOf(snippit);
          // var snippitEndIdx = snippitStartIdx + snippit.length;

  //         var snippitSubStr = content.substring(snippitStartIdx, snippitEndIdx);
  //         var preSnippitBody = content.substring(0, snippitStartIdx);
  //         var postSnippitBody = content.substring(snippitEndIdx);

  //         return $sce.trustAsHtml('<strong>HELLLLO</strong>');
  //       };
  // })
  .controller('ModalCtrl', function ($scope, $http, $modalInstance, $location, $anchorScroll, $timeout, data) {

    $scope.dismissModal = function () {
      $modalInstance.dismiss('require');
    };

    $scope.goToSnippit = function() {
      console.log('anchor scrolling!');
      $location.hash('snip-highlight');
      $anchorScroll();
    };

    $scope.snippitObj = data.snippitObj;


    var content = data.snippitObj.docContent;
    var snippit = data.snippitObj.snippit;

    var snippitStartIdx = content.indexOf(snippit);
    var snippitEndIdx = snippitStartIdx + snippit.length;

    $scope.snippitSubStr = content.substring(snippitStartIdx, snippitEndIdx);
    $scope.preSnippitBody = content.substring(0, snippitStartIdx);
    $scope.postSnippitBody = content.substring(snippitEndIdx);

    $timeout( $scope.goToSnippit, 200 );
  });

