'use strict';

angular.module('codeSearchApp')
  .factory('apiRequest', function ($http, $timeout, codeParser) {
    var apiRequest = {};

    var searchOptions;
    var searchQuery;
    var library;
    var libFunction;

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

      var dep;
      if ( library.length > 0 && libFunction.length > 0 ) {
        dep = getDepVar( library, docContent );

        if ( dep ) {
          searchQuery = dep + '.' + libFunction;
        }
      }

      var snippit = codeParser(docContent, searchQuery, searchOptions);

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

        var files = data.data.files;

        console.log('files', files.length);
        console.log('sOpts', searchOptions);
        console.log('sQuer', searchQuery);

        var snippitPaths = [];
        var snippitsArray;

        async.map(files, snippIterator, function(err, snippitsArr) {
          snippitsArr = _.flatten(snippitsArr);
          console.log('done iterating through snippits', snippitsArr.length);
          console.log('populating snippit ids');

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

          return snippitsReturned
        });

      });
    };

    return apiRequest

  });

