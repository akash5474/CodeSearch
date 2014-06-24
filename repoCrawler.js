var cheerio = require('cheerio');
var request = require('request');
var exec = require('child_process').exec;
// var async = require('async');

var npmURL = 'https://www.npmjs.org';
var starThresh = 50;

request('https://www.npmjs.org/browse/depended/express', function(err, res, body) {
  if ( !err && res.statusCode == 200 ) {

    var $ = cheerio.load(body);

    var dependentLinks = $('.row a');

    dependentLinks.each(function(idx, el) {
      var depHref = $(this).attr('href');

      request(npmURL + depHref, function(depLinkErr, depLinkRes, depLinkBody) {
        if ( !depLinkErr && depLinkRes.statusCode == 200 ) {
          var $ = cheerio.load(depLinkBody);

          var repoEl = $('.metadata a').filter(function() {

            var linkText = $(this).text();
            var repoUrlSubstring = linkText.substring(linkText.length - 4);
            return repoUrlSubstring === '.git';

          }).each(function() {
            var repoHref = $(this).attr('href');
            request( repoHref, function(repoLinkErr, repoLinkRes, repoLinkBody) {

              if ( !repoLinkErr && repoLinkRes.statusCode === 200 ) {

                var $ = cheerio.load(repoLinkBody);
                var stars = +$('a.social-count.js-social-count').text();
                // console.log('Found repo:', repoHref, 'Stars:', stars);

                if ( stars >= starThresh ) {
                  // Clone Repo
                  var cloneUrl = $('input.clone.js-url-field').val()
                  // console.log('Repo has more than 50 stars', cloneUrl );
                  console.log('cloning', cloneUrl);

                  try {
                    process.chdir('reposToParse');
                    console.log('New directory: ' + process.cwd());
                  }
                  catch (err) {
                    console.log('chdir: ' + err);
                  }

                  var cloneRepoPS = exec('git clone ' + cloneUrl,
                    function(err, stdout, stderr) {
                      console.log('stdout: ' + stdout);
                      console.log('stderr: ' + stderr);
                      if (err !== null) {
                        console.log('exec error: ' + err);
                      }
                  });

                }
              } else if ( repoLinkRes.statusCode === 404 ) {
                // console.log('404 for repo:', repoHref);
              }
            });
          });

        }
      });

    });
  }
});