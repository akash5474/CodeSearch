'use strict';

angular.module('codeSearchApp')
  .controller('ModalCtrl', function ($scope, $http, $modalInstance, data) {

    $scope.ok = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.snippitData = data.snippitData;

  });
