'use strict';

angular.module('codeSearchApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'About',
      'link': '/about'
    }];

    $scope.logout = function() {
      Auth.logout()
      .then(function() {
        $location.path('/');
      });
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
