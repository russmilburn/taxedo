const ModelList = require('../models/ModelList');


class Transactions {
  
  constructor(db) {
    this._db = db;
  }
  
  get db() {
    return this._db;
  }
  
  getAllTransactions(){
    let model = this.db.model(ModelList.TRANSACTION);
    return model.find().lean()
      .then((data)=>{
        return data;
      }, (err) =>{
        throw err;
      })
  }
  
}

module.exports = Transactions;