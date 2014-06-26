var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');
var path = require('path');
var request = require('request');
var codeParser = require('../../codeSnippitExtractor.js');
var async = require('async');
var esprima = require('esprima');
var textSearch = require('mongoose-text-search');

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

    // fs.readFile(filePath, function(err, data) {
    if ( error ) throw error;

    // var content = data.toString();

    var content = body;

    var depsMapped = extractDependencies(content);

    console.log(depsMapped);

    var newFile = new File({
      contents: content,
      dependencies: depsMapped
    });

    newFile.save(function(err) {
      if ( err ) console.log(err);
    });

      // });
  });
  res.send(200);
};

exports.findCode = function(req, res, next) {
  var library = req.query.library;
  var libFunction = req.query.libFunction;

  var searchOptions = { filter: { dependencies: library } };

  File.textSearch(libFunction, searchOptions, function(err, files){
    console.log(files);

    var snippIterator = function (doc, callback) {
      var docContent = doc.obj.contents;
      var snippit = codeParser(docContent, library, libFunction);
      callback(null, snippit);
    };

    async.map(files.results, snippIterator, function(err, snippitsArr) {
      var returnArr = [];

      snippitsArr.forEach(function(snippitsArr) {
        if ( snippitsArr ) {
          snippitsArr.forEach(function(snippit) {
            returnArr.push(snippit);
          });
        }
      });

      res.json({ snippits: returnArr });
    });


    // var documentContent = docs[0].contents;


    // var codeSnippet = codeParser(documentContent, libFunction);
    // console.log(codeSnippet);

    // res.json({codeSnippet: codeSnippet});

  });
};

exports.pushFileToDirectory = function(req, res, next){
  var filesInDirectory = function(dirPath, done) {
    var results = [];
    fs.readdir(dirPath, function(err, list) {
      if (err) return done(err);
      var pending = list.length;
      if (!pending) return done(null, results);

      list.forEach(function(file) {
        file = path.resolve(dirPath, file);
        fs.stat(file, function(err, stat) {
          if (err) throw err;
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

  var jsResults = [];

  filesInDirectory(process.cwd(), function(err, results) {
    if (err) throw err;
    results.forEach(function(item){
      if (item.indexOf('.js') !== -1 && item.indexOf('.min.js') === -1) {
        jsResults.push(item);
      }
    });

  var depCount = 0;

    jsResults.forEach(function(fileUrl, index) {
      fs.readFile(fileUrl, function(err, fileContents) {
        if (err) console.log(err);
        var fileDeps;
        try {
          fileDeps = extractDependencies(fileContents);
          if (fileDeps.length > 0) {
            depCount++;
            console.log(depCount);
            var newFile = new File( {
              fileUrl: fileUrl,
              contents: fileContents,
              dependencies: fileDeps
            } );

            newFile.save(function(err,data) {
              if (err) console.log(err);
              res.send(200);
            });
          }
        }
        catch (err) {
          console.log('error occurs on jsResults['+index+']:');
          console.log(err);
        }
      });
    });
  });
};
