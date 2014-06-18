var mongoose = require('mongoose');
var File = mongoose.model('File');
var fs = require('fs');

var extractDependencies = function(content) {
 return content.match(/require\(\s*[\'\"][a-z]*[\'\"]\s*\)/g)
               .map(function(el) {
                 var finStr = el.substring(8, el.length - 1).trim();
                 return finStr.substring(1, finStr.length - 1);
               });
};

exports.addToDB = function(req, res, next) {

  var filePath = req.body.filePath;

  fs.readFile(filePath, function(err, data) {
    if ( err ) throw err;

    var content = data.toString();

    var depsMapped = extractDependencies(content);

    console.log(depsMapped);

    var newFile = new File({
      contents: content,
      dependencies: depsMapped
    });

    newFile.save();

  });
};
