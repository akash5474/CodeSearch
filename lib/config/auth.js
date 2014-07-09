var githubId = process.env.GITHUB_ID;
var githubSecret = process.env.GITHUB_SECRET;
var githubCallback = "http://104.131.224.27/auth/github/callback";
console.log(githubId, githubSecret);
module.exports = {
  'githubAuth' : {
      'clientID'      : githubId,
      'clientSecret'   : githubSecret,
      'callbackURL'   : githubCallback
  }

};  
