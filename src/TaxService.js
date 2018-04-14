const DBConnection = require('./DBConnection');
const TransactionProcessor = require('./modules/TransactionProcessor');
const CategoryProcessor = require('./modules/CategoryProcessor');
const ReportsModule = require('./modules/ReportsModule');
const LoadCSVFile = require('./modules/LoadCSVFile');

class TaxService{
  
  constructor(){
   this.dbConn = new DBConnection();
  
  }
  
  init() {
    console.log('init');
    
    
    
    
    
    
    try{
      
      // import transactions
      
      //import categories
      // let catProcess = new CategoryProcessor(this.dbConn.db);
      // this.dbConn.initModels()
      //   .then(catProcess.init)
  
      // import transactions
      // let process = new TransactionProcessor(this.dbConn.db);
      // let loader = new LoadCSVFile();
      // this.dbConn.initModels()
      //   .then(process.init)
      //   .then(process.refreshKeyWordMap)
      //   .then(loader.loadFile.bind(this, 'transactions-2015-2016.csv'))
      //   .then(process.parseTransactions)
      //   .then(process.matchTransactionWithCategory)
  
      // display report
      let reports = new ReportsModule(this.dbConn.db);
      this.dbConn.initModels()
        .then(reports.init)
        .then(reports.getTransactions)
        .then(reports.groupTransactionsByCategory)
        .then(reports.getTotals)
      
    }catch (err){
      console.log(err);
    }
  }
}

module.exports = TaxService;