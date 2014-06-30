'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema;


/**
* Snippit Schema
*/
var SnippitSchema = new Schema({
  snippit: String,
  github_id: {},
  score: Number
});

mongoose.model('Snippit', SnippitSchema);
