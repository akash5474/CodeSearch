var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');
var request = require('request');
var codeParser = require('../../codeSnippitExtractor.js');
var async = require('async');
var textSearch = require('mongoose-text-search');


var extractDependencies = function(content) {
  var requireRegex = content.match(/require\(\s*[\'\"][a-z]*[\'\"]\s*\)/g);
  if (!requireRegex) {
    return [];
  }
  requireRegex.map(function(el) {
     var finStr = el.substring(8, el.length - 1).trim();
     return finStr.substring(1, finStr.length - 1);
   });
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
