'use strict';

angular.module('codeSearchApp')
  .factory('apiRequest', function ($http, $rootScope, $timeout, codeParser) {
    var apiRequest = {};

    var searchOptions;
    var searchQuery;
    var library = "";
    var libFunction = "";

    var maxFiles = 500;

    var getDepVar = function(lib, file) {
      var parsedData = esprima.tokenize(file);

      for ( var i = 0; i < parsedData.length; i++ ) {
        var o = parsedData[i];

        if ( o.type === 'String' &&
             o.value.substring(1, o.value.length - 1 ) === lib &&
             parsedData[ i+1 ].type === 'Punctuator' &&
             parsedData[ i+1 ].value === ')' &&
             parsedData[ i-1 ].type === 'Punctuator' &&
             parsedData[ i-1 ].value === '(' &&
             parsedData[ i-2 ].type === 'Identifier' &&
             parsedData[ i-2 ].value === 'require' &&
             parsedData[ i-3 ].type === 'Punctuator' &&
             parsedData[ i-3 ].value === '=' &&
             parsedData[ i-4 ].type === 'Identifier' ) {

          return parsedData[ i-4 ].value;
        }
      }
    };

    var snippIterator = function(doc, callback) {

      var docContent = doc.contents;
      var repoUrl = doc.repoUrl || "";
      var filePath = doc.filePath || "";
      var snippitRatings = doc.snippitRatings ?
                            doc.snippitRatings[libFunction] : {};

      // Get variable assigned to dependency

      var dep;

      if ( library.length > 0 && libFunction.length > 0 ) {
        dep = getDepVar( library, docContent );

        if ( dep ) {
          searchQuery = dep + '.' + libFunction;
        }
      }

      // Extract the snippit using code Parser

      var snippit = codeParser(docContent, searchQuery, searchOptions);

      // Restructuring snippits into objects with pertinant info

      var resultsArr = [];
      snippit.forEach(function(snippit) {
        // console.log(snippit.length);
        var snippitObj = {
          repoUrl: repoUrl,
          filePath: filePath,
          snippit: snippit,
          docContent: docContent
        };
        resultsArr.push(snippitObj);
      });
      callback(null, resultsArr);
    };

    apiRequest.findCode = function (lib, func) {
      $timeout(function() {
        $rootScope.statusMsg.msg = "Parsing through files for example snippets...";
      }, 3000);

      return $http({
        method:'GET',
        url:'/api/findFile',
        params: {
          library: lib,
          libFunction: func
        }
      })
      .then(function(data) {

        searchOptions = data.data.searchOptions;
        searchQuery = data.data.searchQuery;
        library = lib;
        libFunction = func;

        var allFiles = data.data.files;

        console.log('files', allFiles[0].score);
        console.log('sOpts', searchOptions);
        console.log('sQuer', searchQuery);
        // console.log($rootScope.statusMsg.msg);

        // Sort files by Mongo Textsearch Score

        allFiles.sort(function(a, b) {
          if (a.score < b.score) {
            return 1;
          } else if (a.score > b.score) {
            return -1;
          } else {
            return 0;
          }
        });

        console.log('files', allFiles[0].score);

        var end = allFiles.length <= maxFiles ? allFiles.length : maxFiles;

        // Removing lowest scored files

        var files = allFiles.slice(0, end);

        var snippitPaths = [];
        var snippitsArray;

        // Parse each file into snippets with Esprima

        async.map(files, snippIterator, function(err, snippitsArr) {
          snippitsArr = _.flatten(snippitsArr);
          console.log('done iterating through snippits', snippitsArr.length);
          console.log('populating snippit ids');

          // Get file paths of all snippets into an array

          snippitsArr.forEach(function(el) {
            snippitPaths.push({
              filePath: el.filePath
            });
          });
          snippitsArray = snippitsArr;
        });

        return [snippitsArray, snippitPaths];
      })
      .then(function(results) {

        return $http.post('/api/popSnips',
          {data: results[1]})
        .then(function(data) {
          var parsedData = angular.fromJson(data);
          var popSnippits = parsedData.data.snippits;
          var snippitsArr = results[0];

          // Iterate through snippets to assign scores or assign
          // a score of 0 if they have no votes

          for ( var i = 0; i < popSnippits.length; i++ ) {
            if ( popSnippits[i].pops &&
                 popSnippits[i].pops.length > 0 ) {

              for (var j = 0; j < popSnippits[i].pops.length; j++) {
                if (snippitsArr[i].snippit === popSnippits[i].pops[j].snippit) {
                  snippitsArr[i].snippitScore = popSnippits[i].pops[j].score;
                  snippitsArr[i].snippitVoters = popSnippits[i].pops[j].github_id;
                }
              }

            } else {
              snippitsArr[i].snippitScore = 0;
              snippitsArr[i].snippitVoters = {};
            }
          }

          // Sort based on voting score

          snippitsArr.sort(function(a, b) {
            if (a.snippitScore < b.snippitScore) {
              return 1;
            } else if (a.snippitScore > b.snippitScore) {
              return -1;
            } else {
              return 0;
            }
          });

          var snippitsReturned = {};
          snippitsReturned.codeSnippits = snippitsArr;

          var pages = Math.ceil(snippitsReturned.codeSnippits.length / 10 );
          snippitsReturned.pageArray = [];

          for ( var i = 0; i < pages; i++ ) {
            snippitsReturned.pageArray.push(i);
          }

          return snippitsReturned;
        });

      });
    };

    return apiRequest

  });

