var cheerio = require('cheerio');
var request = require('request');
// var async = require('async');

var npmURL = 'https://www.npmjs.org';

request('https://www.npmjs.org/browse/depended/express', function(err, res, body) {
  if (!err && res.statusCode == 200) {
    // console.log(body);
    var $ = cheerio.load(body);

    var dependentLinks = $('.row a');
    // console.log(dependentLinks);
    dependentLinks.each(function(idx, el) {
      var href = $(this).attr('href');
      request(npmURL + href, function(depLinkError, depLinkRes, depLinkBody) {
        var $ = cheerio.load(depLinkBody);

        var repoEl = $('.metadata a').filter(function() {
          var linkText = $(this).text();
          var repoUrlSubstring = linkText.substring(linkText.length - 4);
          return repoUrlSubstring === '.git';
        });

        console.log($('#package h1').text(), repoEl.length);

      });
    });
  }
});