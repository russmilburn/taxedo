const HashMap = require('hashmap');
const Categories = require('./Categories');
const Transactions = require('./Transactions');
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ReportsModule(db) {
  
  let self = this;
  self.db = db;
  
  this.init = function () {
    console.log('ReportsModule.init');
    let categories = new Categories(self.db);
    return categories.getAllCategories()
      .then((catList) => {
        return self.setCategoryList(catList);
      }, (err) => {
        throw err;
      });
  };
  
  this.setCategoryList = function (list) {
    self.categoryMap = new HashMap();
    list.forEach(function (item) {
      self.categoryMap.set(item.subCategory, item.category);
    });
    return Promise.resolve();
  };
  
  this.setTransactionList = function (list) {
    console.log('setTransactionList');
    self.transactions = list;
    return Promise.resolve();
  };
  
  this.getTransactions = function () {
    console.log('getTransactions');
    let transaction = new Transactions(self.db);
    return transaction.getAllTransactions()
      .then((transactionList) => {
        return self.setTransactionList(transactionList);
      }, (err) => {
        throw err;
      })
  };
  
  this.groupTransactionsByCategory = function () {
    let groupTransactions = new HashMap();
    self.transactions.forEach(function (tranaction) {
      let subcategory = tranaction.category;
      let category = self.getCategory(subcategory);
      
      if (groupTransactions.has(category) === false) {
        groupTransactions.set(category, new HashMap())
      }
      
      let dateMap = groupTransactions.get(category);
      
      let date = new Date(tranaction.date);
      let dateKey = monthLabels[date.getMonth()] + '-' + date.getFullYear();
      
      if (dateMap.has(dateKey) === false) {
        dateMap.set(dateKey, new HashMap());
      }
      
      let subcategoryMap = dateMap.get(dateKey);
      
      if (subcategoryMap.has(subcategory) === false) {
        subcategoryMap.set(subcategory, []);
      }
      console.log('transaction grouped to :: ' + dateKey + ' ' + category + ' ' + subcategory);
      subcategoryMap.get(subcategory).push(tranaction);
      
    });
    self.groupTransactions = groupTransactions;
    return Promise.resolve();
  };
  
  this.getTotals = function () {
    let subCatTotal = 0;
    let categoryTotal = 0;
    let subCatArray;
    let expenseData = [];
    
    self.groupTransactions.forEach(function (dateMap, catKey) {
      
      dateMap.forEach(function (subcategoryMap, dateKey) {
        categoryTotal = 0;
        subCatArray = [];
        
        subcategoryMap.forEach(function (transactionArray, subCatKey) {
          subCatTotal = 0;
          
          transactionArray.forEach(function (item) {
            categoryTotal += parseFloat(item.amount);
            subCatTotal += parseFloat(item.amount);
          });
          
          let subCatObj = {
            subCategory: subCatKey,
            total: subCatTotal.toFixed(2)
          };
          subCatArray.push(subCatObj);
          
        });
        
        let categoryObj = {
          monthYear: dateKey,
          category: catKey,
          subcategories: subCatArray,
          total: categoryTotal.toFixed(2)
        };
        
        expenseData.push(categoryObj);
      })
    });
    console.log(JSON.stringify(expenseData));
  };
  
  this.formatReport = function (data) {
    
  };
  
  this.getCategory = function (subcategory) {
    return self.categoryMap.get(subcategory);
  }
}

module.exports = ReportsModule;