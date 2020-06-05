var fs = require('fs');
import { compareResults } from "../src/index.js";

var files = ["core.json", "components.json"];

let results = [];
files.forEach(filename => {
  results.push({
    name: filename,
    data: JSON.parse(fs.readFileSync(filename, 'utf8'))
  })
});
compareResults(results);
