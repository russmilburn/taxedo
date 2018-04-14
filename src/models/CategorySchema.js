'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ModelList = require('./ModelList');

module.exports = function (dbConn) {
  let categorySchema = new Schema({
    category : String,
    categorySortOrder : Number,
    subCategory : {
      type: String,
      lowercase: true,
      unique : true
    },
    subCategorySortOrder : Number
  }, {collection : ModelList.CATEGORY});
  
  dbConn.model(ModelList.CATEGORY, categorySchema)
};