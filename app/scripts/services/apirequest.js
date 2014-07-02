'use strict';

angular.module('codeSearchApp')
  .factory('apiRequest', function ($http, $timeout) {
    // Service logic
    // ...
    var apiRequest = {};

    // Public API here

    apiRequest.findCode = function (lib, func) {
      return $http({
        method:'GET',
        url:'/api/findFile',
        params: {
          library: lib,
          libFunction: func
        }
      }).then(function(data){
        var parsedData = angular.fromJson(data);
        var snippitsReturned = {};
        snippitsReturned.codeSnippits = parsedData.data.snippits;

        var pages = Math.ceil(snippitsReturned.codeSnippits.length / 10 );
        snippitsReturned.pageArray = [];

        for ( var i = 0; i < pages; i++ ) {
          snippitsReturned.pageArray.push(i);
        }

        return snippitsReturned
      })
    }


    apiRequest.snippitVote = function (vote, snippitObj) {
      return $http.post('/api/snippitVote', {
        snippit: snippitObj.snippit,
        votePreference: vote,
        filePath: snippitObj.filePath
      });
    }


    return apiRequest

  });

