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
  snippitRatings: {} // key will be name of method, value will be array of snippits
});

FileSchema.plugin(textSearch);

FileSchema.index ( {contents: 'text' } );

mongoose.model('File', FileSchema);
