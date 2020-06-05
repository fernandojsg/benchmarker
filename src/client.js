#!/usr/bin/env node
const fs = require('fs');
const program = require('caporal');
const chalk = require('chalk');
const { version } = require('../package.json');
const { compareResults } = require("../src/compare.js");

program
	.version(version);

// ANALYZE
program
  .command('compare', 'Compare multiple benchmark results')
  .argument("[files...]")
	//.option('--output [output]', 'Output JSON file', program.STRING)
  // .argument("[pattern]")
  .action((args, opts) => {
    let results = [];
    args.files.forEach(filename => {
      results.push({
        name: filename,
        data: JSON.parse(fs.readFileSync(filename, 'utf8'))
      })
    });
    compareResults(results);
  });

program
	.parse(process.argv);