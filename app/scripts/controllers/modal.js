'use strict';

angular.module('codeSearchApp')
  .controller('ModalCtrl', function ($scope, $http, $modalInstance, data) {

    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.snippitObj = data.snippitObj;

    $scope.snippit = data.snippitObj.snippit;

  });
