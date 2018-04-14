const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

function LoadCSVFile() {
  
  this.loadFile = function (fileName) {
    console.log('loadFile');
    let jsonPath = path.join(__dirname, '..', '..', 'data', fileName);
    let promise = new Promise((resolve, reject) => {
      Papa.parse(fs.readFileSync(jsonPath, 'utf-8'), {
        complete: function (results) {
          console.log('loadFile complete');
          return resolve(results.data);
        },
        error: function (err) {
          return reject(err);
        }
      });
    });
    return promise;
  }
}

module.exports = LoadCSVFile;