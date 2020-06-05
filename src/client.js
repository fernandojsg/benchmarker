#!/usr/bin/env node
const fs = require("fs");
const program = require("caporal");
const { version } = require("../package.json");
const { compareResults } = require("../src/compare.js");

program.version(version);

// ANALYZE
program
  .command("compare", "Compare multiple benchmark results")
  .argument("[files...]")
  .action((args) => {
    let results = [];
    args.files.forEach((filename) => {
      results.push({
        name: filename,
        data: JSON.parse(fs.readFileSync(filename, "utf8")),
      });
    });
    compareResults(results);
  });

program.parse(process.argv);
