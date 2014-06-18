var fs = require('fs');

var extractDependencies = function(content) {
 return content.match(/require\(\s*[\'\"][a-z]*[\'\"]\s*\)/g)
               .map(function(el) {
                 var finStr = el.substring(8, el.length - 1).trim();
                 return finStr.substring(1, finStr.length - 1);
               });
};

fs.readFile('./server.js', function(err, data) {
  if ( err ) throw err;

  var content = data.toString();

  var depsMapped = extractDependencies(content);

  console.log(depsMapped);
});