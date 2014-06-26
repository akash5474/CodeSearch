var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');
var request = require('request');
var codeParser = require('../../codeSnippitExtractor.js');
var async = require('async');
var esprima =require('esprima');
var textSearch = require('mongoose-text-search');

var extractDependencies = function(content) {
  var codeToParse = content.toString();

    var parsedData = esprima.parse(codeToParse);
    var moduleArray = [];
    // console.log("code here", parsedData);
    // console.log("more", parsedData.body[0].declarations[0])


    for (var i = 0; i<parsedData.body.length; i++){
      if(parsedData.body[i] &&
         parsedData.body[i].declarations &&
         parsedData.body[i].declarations[0].init &&
         parsedData.body[i].declarations[0].init.arguments &&
         parsedData.body[i].declarations[0].init.callee &&
         parsedData.body[i].declarations[0].init.callee.name &&
         parsedData.body[i].declarations[0].init.callee.name === 'require' &&
         parsedData.body[i].declarations[0].init.arguments[0].value.indexOf('/') === -1) {

            moduleArray.push(parsedData.body[i].declarations[0].init.arguments[0].value);

      }
    };
    // console.log(moduleArray);
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

    // console.log(depsMapped);

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
  // var library = req.query.library;
  var libFunction = req.query.libFunction;

  // var searchOptions = { filter: { dependencies: library } };

  File.textSearch('"\\"' + libFunction + '\\""', function(err, files){
    var snippIterator = function (doc, callback) {
      var docContent = doc.obj.contents;
      var snippit = codeParser(docContent, libFunction);
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
