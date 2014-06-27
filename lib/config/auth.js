var githubId = process.env.GITHUB_ID;
var githubSecret = process.env.GITHUB_SECRET;
var githubCallback = "http://192.168.1.26:9000/auth/github/callback";
console.log(githubId, githubSecret);
module.exports = {
  'githubAuth' : {
      'clientID'      : githubId,
      'clientSecret'   : githubSecret,
      'callbackURL'   : githubCallback
  }

};
