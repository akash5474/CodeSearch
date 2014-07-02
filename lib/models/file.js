'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   textSearch = require('mongoose-text-search');

/**
* File Schema
*/
var FileSchema = new Schema({
  repoUrl: String,
  filePath: String,
  contents: String,
  dependencies: [],
  snippitRatings: {}
});

FileSchema.plugin(textSearch);

FileSchema.index ( {contents: 'text' } );

module.exports = mongoose.model('File', FileSchema);
