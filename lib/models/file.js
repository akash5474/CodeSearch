'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema,
   textSearch = require('mongoose-text-search');

/**
* File Schema
*/
var FileSchema = new Schema({
 contents: String,
 // fileUrl:  { type: String, unique: true },
 // repoUrl: String,
 dependencies: []
});

FileSchema.plugin(textSearch);

FileSchema.index ( {contents: 'text' } );

mongoose.model('File', FileSchema);
