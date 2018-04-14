const ReadLineSync = require('readline-sync');
const ModelList = require('../models/ModelList');
const HashMap = require('hashmap');
const Q = require('q');
const Categories = require('./Categories');

const ignoredTransactionList =[
  'transfer to',
  'transfer from',
  'atm',
  'closing balance',
  'balance brought forward'
];

function TransactionProcessor(db) {
  let self = this;
  self.db = db;
  
  this.init = function () {
    console.log('TransactionProcessor.init');
    let categories = new Categories(self.db);
    return categories.getAllCategories()
      .then((catList) => {
        return self.setCategoryAvailableList(catList);
      },(err) => {
        throw err;
      });
  };
  
  this.setCategoryAvailableList = function (list) {
    self.map = new HashMap();
    list.forEach(function (item) {
      if (self.map.has(item.category) == false) {
        self.map.set(item.category, []);
      }
      self.map.get(item.category).push(item.subCategory);
    });
    return Promise.resolve();
  };
  
  this.matchTransactionWithCategory = function (transactionItems) {
    self.index = -1;
    self.transactionItems = transactionItems;
    self.nextTransaction();
  };
  
  this.nextTransaction = function () {
    self.index ++;
    let transaction = self.transactionItems[self.index];
    let potentialKeywords = self.cleanTransactionDescription(transaction.desc);
    let searchResult = self.matchKeywordWithDescription(potentialKeywords);
  
    if (searchResult.isKeywordFound === true){
      console.log(transaction.desc + ' = ' + searchResult.matchedItem.category);
      return self.saveTransaction(transaction, searchResult.matchedItem.category);
    }else {
      let keyword = self.selectKeywordToMap(potentialKeywords);
      return self.selectCategory()
        .then((result) =>{
        console.log('selected subcategory :: ' + result.category);
        return self.saveCategoryKeyWord(keyword, result.category)
          .then(self.saveTransaction.bind(this, transaction, result.category));
      });
    }
  };
  
  this.saveTransaction = function (transaction, category) {
    transaction.category = category.toString();
    let Transaction = self.db.model(ModelList.TRANSACTION);
    let t = new Transaction();
    t.category = transaction.category;
    t.amount = transaction.amount;
    t.desc = transaction.desc;
    t.date = transaction.date;
    
    t.save().then((data) =>{
      console.log('transaction saved $' + data.amount + ' to ' + data.category);
      return self.nextTransaction();
    }, (err) =>{
      throw err
    })
    
  };
  
  this.matchKeywordWithDescription = function (potentialKeywords) {
    let isKeywordFound = false;
    let matchedItem = null;
    for (let i = 0; i < self.keywordList.length; i++) {
      let keywordMapItem = self.keywordList[i];
      for (let j = 0; j < potentialKeywords.length; j++){
        if (potentialKeywords[j] === keywordMapItem.keyword){
          isKeywordFound = true;
          matchedItem = keywordMapItem;
        }
      }
    }
    return {
      isKeywordFound : isKeywordFound,
      matchedItem : matchedItem
    };
  };
  
  this.cleanTransactionDescription = function (description) {
    let a = description.split(' ');
    let keyword = [];
    for (let i = 0; i < a.length; i++) {
      let word = a[i];
      // if the word is a space skip the word
      if (word.length != 0) {
        keyword.push(word);
      }
    }
    return keyword;
  };
  
  this.refreshKeyWordMap = function () {
    let KeywordMap = self.db.model(ModelList.CATEGORY_KEYWORD_MAP);
    return KeywordMap.find().lean().then((keywordList) => {
      self.keywordList = keywordList;
      return Promise.resolve();
    }, (err) => {
      throw err;
    })
  };
  
  this.parseTransactions = function (importedItems) {
    console.log('parseTransactions');
    let transactionItems = [];
    importedItems.forEach(function (item) {
      console.log(item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3]);
      
      let dateArray = String(item[0]).split('/');
      
      let transDate = new Date(dateArray[2], (dateArray[1] - 1), dateArray[0]);
      
      let t = {
        date: transDate,
        amount: parseFloat(item[1]).toFixed(2),
        desc: item[2].toLowerCase(),
      };
      let isIgnoreTextPresent = false;
      ignoredTransactionList.forEach(function (phrase) {
        if (t.desc.search(phrase) !== -1){
          isIgnoreTextPresent = true;
        }
      });
      
      if (isIgnoreTextPresent === false){
        transactionItems.push(t);
      }
    });
    return Promise.resolve(transactionItems);
  };
  
  this.selectKeywordToMap = function (potentialKeywords) {
    let index = ReadLineSync.keyInSelect(potentialKeywords, 'select a keyword?');
    return potentialKeywords[index];
  };
  
  this.selectCategory = function () {
    let categories = self.map.keys();
    let index = ReadLineSync.keyInSelect(self.map.keys(), 'which category?');
    if (index === -1){
      console.log('You must select a category');
      self.selectCategory();
    }
    let key = categories[index];
    return self.selectSubcategory(key);
  };
  
  this.selectSubcategory = function (key) {
    let selectedCategoryIndex = ReadLineSync.keyInSelect(self.map.get(key), 'which subcategory?');
    if (selectedCategoryIndex === -1){
      return self.selectCategory();
    }
    let result = {
      category : self.map.get(key)[selectedCategoryIndex]
    };
    return Promise.resolve(result);
  };
  
  this.saveCategoryKeyWord = function (keyword, categroy) {
    let KeyWordMap = self.db.model(ModelList.CATEGORY_KEYWORD_MAP);
    let k = new KeyWordMap();
    k.category = categroy;
    k.keyword = keyword;
    return k.save().then((data) => {
      return self.refreshKeyWordMap();
    }, (err) => {
      throw err;
    })
  }
}


module.exports = TransactionProcessor;