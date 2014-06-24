var cheerio = require('cheerio');
var request = require('request');
var exec = require('child_process').exec;
// var async = require('async');

var npmURL = 'https://www.npmjs.org';
var starThresh = 50;

var cloneRepo = function(cloneUrl) {
  console.log('cloning', cloneUrl);

  try {
    process.chdir('reposToParse');
    console.log('New directory: ' + process.cwd());
  }
  catch (err) {
    console.log('chdir: ' + err);
  }

  exec('git clone ' + cloneUrl,
   function(err, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (err !== null) {
        console.log('exec error: ' + err);
      }
  });
};

var requestGithubAndClone = function(repoHref) {
  request( repoHref, function(repoLinkErr, repoLinkRes, repoLinkBody) {

    if ( !repoLinkErr && repoLinkRes.statusCode === 200 ) {

      var $ = cheerio.load(repoLinkBody);
      var stars = +$('a.social-count.js-social-count').text();
      // console.log('Found repo:', repoHref, 'Stars:', stars);

      if ( stars >= starThresh ) {
        // Clone Repo
        var cloneUrl = $('input.clone.js-url-field').val()
        // console.log('Repo has more than 50 stars', cloneUrl );
        cloneRepo(cloneUrl);

      }
    } else if ( repoLinkRes.statusCode === 404 ) {
      // console.log('404 for repo:', repoHref);
    }
  });
};

var requestNpmPage = function(pageHref) {
  request(npmURL + pageHref,
    function(depLinkErr, depLinkRes, depLinkBody) {
      if ( !depLinkErr && depLinkRes.statusCode == 200 ) {
        var $ = cheerio.load(depLinkBody);

        var repoEl = $('.metadata a').filter(function() {

          var linkText = $(this).text();
          var repoUrlSubstring = linkText.substring(linkText.length - 4);
          return repoUrlSubstring === '.git';

        }).each(function() {
          var repoHref = $(this).attr('href');

          requestGithubAndClone(repoHref);
        });
      }
    });
};

// var startUrl = 'https://www.npmjs.org/browse/depended/express';

var requestModuleDepended = function(dependedUrl) {
  request(dependedUrl, function(err, res, body) {
    if ( !err && res.statusCode == 200 ) {

      var $ = cheerio.load(body);

      var dependentLinks = $('.row a');
      var paginationLinks = $('h1+ .description a');

      dependentLinks.each(function(idx, el) {
        var depHref = $(this).attr('href');

        requestNpmPage(depHref);
      });

      paginationLinks.each(function(idx, el) {
        var text = $(this).text()
                          .substring(0, $(this).text().length - 2);

        if ( text === 'next' ) {
          var nextHref = $(this).attr('href');
          console.log(nextHref);
          requestModuleDepended(npmURL + nextHref);
        }
      });
    }
  });
};

var startUrl = 'https://www.npmjs.org/browse/star';

var requestStarred = function(starredUrl) {
  request(starredUrl, function(err, res, body) {
    var $ = cheerio.load(body);

    var starredRepoLinks = $('.row a');
    var paginationLinks = $('h1+ .description a');

    starredRepoLinks.each(function(idx, el) {
      var repo = $(this).text();
      console.log('https://www.npmjs.org/browse/depended/' + repo);
      requestModuleDepended('https://www.npmjs.org/browse/depended/' + repo);
    });

    paginationLinks.each(function(idx, el) {
      var text = $(this).text()
                        .substring(0, $(this).text().length - 2);

      if ( text === 'next' ) {
        var nextHref = $(this).attr('href');
        // console.log(nextHref);
        requestStarred(npmURL + nextHref);
      }
    });

  });
};

// requestModuleDepended(startUrl);
requestStarred(startUrl);