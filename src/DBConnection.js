const Q = require('q');
const Mongoose = require('mongoose').Mongoose;
// const ModelList = require('./models/ModelList');

class DBConnection{
  
  constructor() {
    this.connectDB()
  }
  
  
  connectDB(){
    let deferObj = Q.defer();
    let promise = deferObj.promise;
    let options = {
      autoReconnect : true,
      connectTimeoutMS : 2000,
      keepAlive : true,
      bufferMaxEntries : 0
    };
    this.db = new Mongoose();
    // Mongoose.promise = Q.Promise;
    this.db.Promise = Q.Promise;
    console.log('About to connect to db');
  
    this.db.connect('mongodb://localhost:37017/personalTax', options, (err)=>{
      if (err){
        console.log(err);
        return Promise.reject(err);
      } else{
        console.log('DB Connection Successful');
        return deferObj.resolve();
      }
    });
    return promise;
  }
  
  initModels(){
    // console.dir(this.db);
    let db = this.db;
    try{
      require('./models/CategorySchema')(db);
      require('./models/TransactionSchema')(db);
      require('./models/CategoryKeyWordMap')(db);
    }catch (err){
      console.error(err);
    }
    console.log('registered models');
    return Promise.resolve();
  }
  
}

module.exports = DBConnection;