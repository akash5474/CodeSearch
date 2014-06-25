'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   textSearch = require('mongoose-text-search');

/**
* File Schema
*/
var FileSchema = new Schema({
  fileUrl: String,
  contents: String,
  // repoUrl: String,
  dependencies: []
});

FileSchema.plugin(textSearch);

FileSchema.index ( {contents: 'text' } );

mongoose.model('File', FileSchema);
