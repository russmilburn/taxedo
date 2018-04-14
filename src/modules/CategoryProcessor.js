const Categories = require('./Categories');
const LoadCSVFile = require('./LoadCSVFile');


function CategoryProcessor(db) {
  let self = this;
  self.db = db;
  
  this.init = function () {
   let categories = new Categories(self.db);
   let loader = new LoadCSVFile();
   return loader.loadFile('categories.csv')
     .then(categories.parseCategories)
     .then(categories.saveCategories.bind(this, self.db));
   
  }
}

module.exports = CategoryProcessor;