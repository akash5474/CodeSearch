'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

/**
* File Schema
*/
var FileSchema = new Schema({
  repoUrl: String,
  filePath: String,
  contents: String,
  dependencies: [],
  _snippitIds: [ { type: Schema.Types.ObjectId, ref: 'Snippit' } ]
});

FileSchema.index ( {contents: 'text' } );

module.exports = mongoose.model('File', FileSchema);
