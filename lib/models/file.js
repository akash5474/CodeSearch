'use strict';

var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

/**
* File Schema
*/
var FileSchema = new Schema({
 contents: String,
 // fileUrl:  { type: String, unique: true },
 // repoUrl: String,
 dependencies: []
});

mongoose.model('File', FileSchema);
