var mongoose = require('mongoose');
// var File = mongoose.model('File');
var File = require('../models/file');
var fs = require('fs');
var path = require('path');
var request = require('request');
var codeParser = require('../../codeSnippitExtractor.js');
var async = require('async');
var esprima = require('esprima');
var textSearch = require('mongoose-text-search');
var uu = require('underscore');

var extractDependencies = function(content) {

    var parsedData = esprima.tokenize(content, {range: true});
    var moduleArray = [];

    for (var j = 0; j<parsedData.length; j++){
      var o = parsedData[j];


      if( o.type === 'String' &&
          o.value.indexOf('/') === -1 &&
          parsedData[ j+1 ].value === ')' &&
          parsedData[ j-1 ].value === '(' &&
          parsedData[ j-2 ].value === 'require' &&
          parsedData[ j-3 ].value === '=' &&
          parsedData[ j-4 ].type === 'Identifier' ) {

            var depend = o.value.slice(o.value.indexOf('\'') + 1, o.value.lastIndexOf('/') );
            moduleArray.push(depend);

      }
    };

    return moduleArray;
};

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

exports.addToDB = function(req, res, next) {

  var filePath = req.body.url;
  request(filePath, function(error, response, body) {

    // fs.readFile(filePath, function(err, data) {
    if ( error ) throw error;

    // var content = data.toString();

    var content = body;

    var depsMapped = extractDependencies(content);

    // console.log(depsMapped);

    var newFile = new File({
      contents: content,
      dependencies: depsMapped
    });

    newFile.save(function(err) {
      if ( err ) console.log(err);
    });

  });
  res.send(200);
};

var populateSnippitIds = function(snippitObj, cb) {
  if (snippitObj.snippit) {
    // console.log(snippitObj.filePath);
    File.findOne({ filePath: snippitObj.filePath })
    .populate('_snippitIds')
    .exec(function(err, file) {
      if (err) {
        console.log(err);
        return;
      }

      // console.log(typeof file._snippitIds, ': ', file._snippitIds);
      if (file._snippitIds.length > 0) {
        for (var i = 0; i < file._snippitIds.length; i++){
          if (snippitObj.snippit === file._snippitIds[i].snippit) {
            snippitObj.snippitScore = file._snippitIds[i].score;
            snippitObj.snippitVoters = file._snippitIds[i].github_id;
          }
        }
      }
      if (!snippitObj.snippitScore) {
        snippitObj.snippitScore = 0;
        snippitObj.snippitVoters = null;
      }
      // returnArr.push(snippitObj);
      cb(null, snippitObj);
    });
  }
};

exports.findCode = function(req, res, next) {
  var library = req.query.library || '';
  var libFunction = req.query.libFunction || '';
  library.trim();
  libFunction.trim();

  var searchQuery;
  var searchOptions = {
    library: false,
    func: false
  };

  if ( library.length > 0 && libFunction.length > 0 ) {
    searchQuery = library + '.' + libFunction;
    searchOptions.library = true;
    searchOptions.func = true;
  } else {
    searchQuery = library + libFunction;

    searchOptions.library = library.length > 0 ? true : false;
    searchOptions.func = libFunction.length > 0 ? true : false;
  }

  // console.log('searchQuery', searchQuery);
  // console.log('searchOptions', searchOptions);
  var snippIterator = function (doc, callback) {
    var docContent = doc.obj.contents;
    var repoUrl = doc.obj.repoUrl || "";
    var filePath = doc.obj.filePath || "";
    var snippitRatings = doc.obj.snippitRatings ?
                          doc.obj.snippitRatings[libFunction] : {};

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
      console.log(snippit.length);
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

  File.textSearch(searchQuery, function(err, files) {
    console.log('Grabbing files len', files.results.length);
    async.map(files.results, snippIterator, function(err, snippitsArr) {

      snippitsArr = uu.flatten(snippitsArr);

      async.map(snippitsArr, populateSnippitIds, function(err, data) {
        res.json({ snippits: data });
      });
    });
  });
};

var filesInDirectory = function(dirPath, done) {
  var results = [];
  fs.readdir(dirPath, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function(file) {
      file = path.resolve(dirPath, file);
      fs.stat(file, function(err, stat) {
        if (err) {
          console.log(err);
          return;
        }

        if (stat.isDirectory() && file.indexOf('node_modules') === -1 ) {
          // recursively run function again to find files in directory
          filesInDirectory(file, function(err, res) {
            results = results.concat(res);
            pending--;
            if (!pending) done(null, results);
          });
        } else {
          results.push(file);
          pending--;
          if (!pending) done(null, results);
        }
      });
    });
  });
};

var isValidJSFile = function(file) {
  var dots = file.match(/\./g);
  if (dots && file.indexOf('.js') === (file.length - 3) && dots.length === 1) {
    return true;
  } else {
    return false;
  }
};

// exports.pushFileToDirectory = function(req, res, next){
exports.pushFileToDirectory = function(repoPath, cloneUrl, moduleName){
  // var jsResults = [];

  filesInDirectory(repoPath, function(err, results) {
    // if (err) throw err;
    var jsResults = results.filter(isValidJSFile);

    var depCount = 0;
    var appName = 'CodeSearch';

    async.each(jsResults, function(file, callback) {
      fs.readFile(file, function(err, fileContents) {
        if (err) {
          console.log(err)
          return;
        };
        fileContents = fileContents.toString();

        var pathSliceIndex = file.indexOf(appName) + appName.length;
        var filePath = file.replace(file.substring(0, pathSliceIndex), '');

        var fileDeps;

        try {
          fileDeps = extractDependencies(fileContents);
          depCount++;

          var newFile = new File( {
            repoUrl: cloneUrl.substring( 0, cloneUrl.lastIndexOf('.git') ),
            filePath: filePath.substring( filePath.indexOf(moduleName) ),
            contents: fileContents,
            dependencies: fileDeps,
          } );

          newFile.save(function(err) {
            if (err) {
              console.log('error saving', err);
              callback(err);
            } else {
              callback()
            }
          });
        } catch (e) {
          console.log('ERROR: files.js error in try catch')
          callback(e);
        }
      });
    },
    function(err) {
      if (err) {
        console.log('ERROR: Push failed for:', moduleName, 'path:', repoPath);
      } else {
        console.log('Push successful for:', moduleName, 'path:', repoPath);
      }
    });

  });
};
