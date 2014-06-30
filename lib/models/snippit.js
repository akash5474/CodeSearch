'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   textSearch = require('mongoose-text-search');


/**
* Snippit Schema
*/
var SnippitSchema = new Schema({
  snippit: String,
  method: String,
  startIndex: Number,
  endIndex: Number,
  github_id: {},
  score: Number
});

SnippitSchema.plugin(textSearch);

SnippitSchema.index ( {contents: 'text' } );

mongoose.model('Snippit', SnippitSchema);
