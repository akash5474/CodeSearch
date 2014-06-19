var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');
var request = require('request');

var extractDependencies = function(content) {
 return content.match(/require\(\s*[\'\"][a-z]*[\'\"]\s*\)/g)
               .map(function(el) {
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

    newFile.save();

      // });
  });
  res.send(200);
};

exports.findCode = function(req, res, next) {
  var filePath = req.body.url;

};
