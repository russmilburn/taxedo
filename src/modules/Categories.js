const ModelList = require('../models/ModelList');
const Q = require('q');
  
  class Categories {
  constructor(db) {
    this._db = db;
  }
  
  get db() {
    return this._db;
  }
  
  getAllCategories() {
    let model = this.db.model(ModelList.CATEGORY);
    return model.find().lean()
      .then((data) => {
        return data;
      }, (err) => {
        throw err;
      })
  }
  
  parseCategories(results) {
    // console.log(results);
    let categories = results;
    let categoryItems = [];
    let categorySortOrder = 0;
    categories.forEach(function (categoryList) {
      let mainCategory = categoryList[0];
      categorySortOrder++;
      for (let i = 1; i < categoryList.length; i++) {
        let c = {
          category: mainCategory,
          categorySortOrder: categorySortOrder,
          subCategory: categoryList[i],
          subCategorySortOrder: i
        };
        categoryItems.push(c);
        
        // let Category = self.db.model(ModelList.CATEGORY);
        // let c = new Category();
        // c.category = mainCategory;
        // c.subCategory = categoryList[i];
        //
        // c.save({upsert: true}).then(() =>{
        //   console.log('Save Successful :: ' + mainCategory + ' ' + categoryList[i])
        // }, (err) =>{
        //   if (err.code != 11000){
        //     console.log('error ' + err)
        //   }
        //
        // })
      }
    });
    return Promise.resolve(categoryItems)
  }
  
  saveCategories(db, importedItems) {
    let promiseArray = [];
    importedItems.forEach(function (item) {
      let Category = db.model(ModelList.CATEGORY);
      let c = new Category();
      c.category = item.category;
      c.categorySortOrder = item.categorySortOrder;
      c.subCategory = item.subCategory;
      c.subCategorySortOrder = item.subCategorySortOrder;
      let promise = c.save()
        .then((data) => {
          console.log('Save Successful :: ' + data.category + ' ' + data.subCategory)
        }, (err) => {
          throw err
        });
      promiseArray.push(promise);
    });
    return Q.allSettled(promiseArray)
      .then((data) => {
        console.log('save categorises complete')
      }, (err) => {
        throw err;
      })
  }
}

module.exports = Categories;