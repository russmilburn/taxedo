'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ModelList = require('./ModelList');

module.exports = function (dbConn) {
  let categoryKeyWordMapSchema = new Schema({
    category : String,
    keyword : {
      type: String,
      lowercase: true
    }
  }, {collection : ModelList.CATEGORY_KEYWORD_MAP});
  
  dbConn.model(ModelList.CATEGORY_KEYWORD_MAP, categoryKeyWordMapSchema)
};