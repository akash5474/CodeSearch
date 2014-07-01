var mongoose = require('mongoose');
var Snippit = mongoose.model('Snippit');
var File = mongoose.model('File');

exports.snippitVote = function(req, res, next) {
  // var githubId = req.user.github_id // fix later
  var githubId = 5555;
  var votePref = req.body.votePreference;
  var snippit = req.body.snippit;
  var filePath = req.body.filePath;

  var setObj = {
    snippit: snippit
  };

  setObj["github_id." + githubId] = votePref;

  Snippit.findOneAndUpdate( { snippit: snippit }, { $set: setObj }, { upsert: true }, function (err, data) {
    if (err) console.log(err);

    var score = 0;
    for (var user in data.github_id) {
      score += data.github_id[user];
    }

    Snippit.findOneAndUpdate( { snippit: req.body.snippit }, { $set: {score: score } }, function (err, data) {
      if (err) console.log(err);

      File.findOneAndUpdate( { filePath: filePath }, { $addToSet: { _snippitIds: data._id } }, function (err, data) {
        if (err) console.log(err);
        console.log(data);
        res.send(200);
      });
    });
  });

};