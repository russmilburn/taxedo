'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ModelList = require('./ModelList');

module.exports = function (dbConn) {
  let categorySchema = new Schema({
    date : String,
    desc : String,
    amount : Number,
    category : String,
  }, {collection : ModelList.TRANSACTION});
  
  dbConn.model(ModelList.TRANSACTION, categorySchema)
}