var mongoose = require('mongoose');
var File = require('../models/file');
var fs = require('fs');
var path = require('path');
var request = require('request');
var codeParser = require('../../codeSnippitExtractor.js');
var async = require('async');
var esprima = require('esprima');
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

exports.addToDB = function(req, res, next) {

  var filePath = req.body.url;
  request(filePath, function(error, response, body) {

    if ( error ) throw error;

    var content = body;

    var depsMapped = extractDependencies(content);

    // console.log(depsMapped);

    var newFile = new File({
      contents: content,
      dependencies: depsMapped
    });

    newFile.save(function(err) {
      if ( err ) {
        console.log('error saving file', err);
        return;
      }
    });

  });
  res.send(200);
};

var populateSnippitIds = function(snippitObj, cb) {

  // Mongo query to see if snippet has voting score

  File.findOne({ filePath: snippitObj.filePath })
  .populate('_snippitIds')
  .exec(function(err, file) {
    if (err) {
      console.log('error populating', err);
      return;
    }

    if (file._snippitIds.length > 0) {
      snippitObj.pops = file._snippitIds;
    }

    cb(null, snippitObj);
  });
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

  // Determine whether query had library, function, or both

  if ( library.length > 0 && libFunction.length > 0 ) {
    searchQuery = library + '.' + libFunction;
    searchOptions.library = true;
    searchOptions.func = true;
  } else {
    searchQuery = library + libFunction;

    searchOptions.library = library.length > 0 ? true : false;
    searchOptions.func = libFunction.length > 0 ? true : false;
  }

  // Execute mongo textsearch and get files with scores

  console.log('SQUERY', searchQuery);
  File.find({$text: {$search: searchQuery}}, {score: {$meta: "textScore"}})
    .exec(function(err, files) {
      console.log('Found \033[35m', files.length, '\033[39m many files');
      res.json({ files: files, searchOptions: searchOptions, searchQuery: searchQuery });
    });
};

exports.popSnips = function(req, res, next) {
  var snipPaths = req.body.data;

  // Populate Snippits if they've been voted on

  async.map(snipPaths, populateSnippitIds, function(err, data) {
    console.log('sending response to client', data.length);
    res.json({ snippits: data });
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
          console.log('error getting file stats', err);
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
          console.log('error reading file', err)
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
