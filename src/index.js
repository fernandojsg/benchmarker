import Stats from "incremental-stats-lite";
var chalk = require('chalk');
const { printTable } = require('console-table-printer');

const Table = require("tty-table");

const DEFAULT_GLOBAL_OPTIONS = {
  verbose: false,
  summary: true,
  iterations: 10
};

const log = console.log;

const DEFAULT_OPTIONS = {
  gc: true
};

export function compareResults(resultsList) {
  let headerGlobal = [
    {
      value: "Global results",
      color: "white",
      align: "left",
      width: 40
    }
  ];

  let headerGroups = [
    {
      value: "Results per group",
      color: "white",
      align: "left",
      width: 40
    }
  ];

  let headerBenchmarks = [
    {
      value: "Results per benchmark",
      color: "white",
      align: "left"
    },
    {
      value: "Group",
      color: "cyan",
      align: "left"
    }
  ];


  let globalRows = ['GLOBAL'];
  let groups = [];
  let benchmarksRows = [];

  class MinMax {
    constructor() {
      this.min = {
        value: Infinity,
        id: 0
      };
      this.max = {
        value: -Infinity,
        id: 0
      };
    }
  }

  let mmGlobal = new MinMax();

  function computeMinMax(i, value, minMax) {
    if (value > minMax.max.value) {
      minMax.max.value = value;
      minMax.max.id = i;
    }
    if (value < minMax.min.value) {
      minMax.min.value = value;
      minMax.min.id = i;
    }
  }

  resultsList.forEach((results, i) => {
    globalRows.push(results.data.sumAll);
    const value = results.data.sumAll;
    computeMinMax(i, value, mmGlobal);

    // Header
    headerGlobal.push( {
      value: results.name.replace(/\.[^.]+$/, ''),
      formatter: function (value) {
        var str = value;
        if (mmGlobal.min.id === i) {
          str = this.style(str, "green")
        } else if (mmGlobal.max.id === i) {
          str = this.style(str, "red")
        }
        return str;
      }
    });

    headerGroups.push( {
      value: results.name.replace(/\.[^.]+$/, ''),
      formatter: function (value, col, row) {
        var str = value;
        let mm = mmGroups[row];
        if (mm.min.value === mm.max.value) {
          str = this.style(str, "grey")
        } else if (mm.min.value === value) {
          str = this.style(str, "green")
        } else if (mm.max.value === value) {
          str = this.style(str, "red")
        }
        return str;
      }
    });

    headerBenchmarks.push( {
      value: results.name.replace(/\.[^.]+$/, ''),
      formatter: function (value, col, row) {
        var str = value;
        let mm = mmBenchmarks[row];
        if (mm.min.value === mm.max.value) {
          str = this.style(str, "grey")
        } else if (mm.min.value === value) {
          str = this.style(str, "green")
        } else if (mm.max.value === value) {
          str = this.style(str, "red")
        }
        return str;
      }
    });

  });

  globalRows.push(mmGlobal.max.value - mmGlobal.min.value);
  globalRows.push(mmGlobal.max.value / mmGlobal.min.value - 1);

  let mmGroups = [];
  groups = [];

  let mmBenchmarks = [];

  let b = 0;
  resultsList.forEach((results, i) => {
    b = 0;

    // Groups
    results.data.groups.forEach((group, j) => {
      if (i === 0) {
        // First iteration through all the groups in results#0
        mmGroups.push(new MinMax());
        groups.push([group.groupName]);
      }
      groups[j].push(group.sumAll);
      computeMinMax(i, group.sumAll, mmGroups[j]);

      group.benchmarks.forEach((benchmark, k) => {
        if (i === 0) {
          mmBenchmarks.push(new MinMax());
          benchmarksRows.push([benchmark.name, group.groupName]);
        }

        benchmarksRows[b].push(benchmark.stats.sum);
        computeMinMax(i, benchmark.stats.sum, mmBenchmarks[b]);
        b++;
      });
    });
  });

  groups.forEach((group, i) => {
    group.push(mmGroups[i].max.value - mmGroups[i].min.value);
    group.push(mmGroups[i].max.value / mmGroups[i].min.value - 1);
  });

  benchmarksRows.forEach((benchmark, i) => {
    benchmark.push(mmBenchmarks[i].max.value - mmBenchmarks[i].min.value);
    benchmark.push(mmBenchmarks[i].max.value / mmBenchmarks[i].min.value - 1);
  });

  headerGlobal.push({
    value: "diff"
  });
  headerGlobal.push({
    value: "diff %",
    formatter: function (value) {
      var str = (100 * value).toFixed(2) + '%';
      if (value > 0.2) {
        str = this.style(str, "red");
      } else if (value > 0.05) {
        str = this.style(str, "yellow");
      }
      return str;
    }
  });

  headerGroups.push({
    value: "diff"
  });
  headerGroups.push({
    value: "diff %",
    formatter: function (value) {
      var str = (100 * value).toFixed(2) + '%';
      if (value > 0.2) {
        str = this.style(str, "red");
      } else if (value > 0.05) {
        str = this.style(str, "yellow");
      }
      return str;
    }
  });

  headerBenchmarks.push({
    value: "diff",
    formatter: function (value) {
      if (value == 0) {
        return this.style("0", "grey");
      }
      return value;
    }
  });
  headerBenchmarks.push({
    value: "diff %",
    formatter: function (value) {
      var str = (100 * value).toFixed(2) + '%';
      if (value > 0.2) {
        str = this.style(str, "red");
      } else if (value > 0.05) {
        str = this.style(str, "yellow");
      } else if (value == 0) {
        str = this.style('-', "grey");
      }

      return str;
    }
  });

  // Example with arrays as rowsGlobal
  const options = {
    borderStyle: "solid", // only "dashed" works with iife module
    borderColor: "grey",
    paddingBottom: 0,
    headerAlign: "center",
    align: "center",
    color: "white",
    truncate: "..."
  }

  console.log(Table(headerGlobal, [globalRows], null, options).render());
  console.log(Table(headerGroups, groups, null, options).render());
  console.log(Table(headerBenchmarks, benchmarksRows, null, options).render());

}

export class Benchmarks {
  constructor(globalOptions, benchDefaultOptions) {
    this.benchs = [];
    this.benchsByGroup = {
      nogroup: []
    };
    this.currentGroup = this.benchsByGroup.nogroup;

    this.options = Object.assign(DEFAULT_GLOBAL_OPTIONS, globalOptions);
    this.benchDefaultOptions = Object.assign(DEFAULT_OPTIONS, benchDefaultOptions);
  }

  add(bench) {
    if (!bench.options) {
      bench.options = this.benchDefaultOptions;
    } else {
      bench.options = Object.assign(this.benchDefaultOptions, bench.options);
    }

    if (!bench.iterations) {
      bench.iterations = this.options.iterations;
    }

    this.benchs.push(bench);
    this.currentGroup.push(bench);

    return this;
  }

  getReport(format = "json") {
    let groups = [];
    let json = {
      groups: groups,
      meanAll: 0,
      sumAll: 0
    };

    Object.entries(this.benchsByGroup).forEach(([groupName, benchmarks]) => {
      if (benchmarks.length === 0) {
        return;
      }

      let group = {
        groupName: groupName,
        benchmarks: [],
        meanAll: 0,
        sumAll: 0
      };

      groups.push(group);

      benchmarks.forEach(bench => {
        const stats = bench.stats.getAll();
        let current = {
          name: bench.name,
          stats: {}
        };
        group.benchmarks.push(current);
        Object.entries(stats).forEach(([key, value]) => {
          current.stats[key] = value;
        });

        group.meanAll += stats.mean;
        group.sumAll += stats.sum;
      });

      json.meanAll += group.meanAll;
      json.sumAll += group.sumAll;
    });
    return json;
  }

  group(name) {
    if (!this.benchsByGroup[name]) {
      this.benchsByGroup[name] = [];
    }

    this.currentGroup = this.benchsByGroup[name];

    return this;
  }

  run() {
    this.benchs.forEach(bench => {
      bench.stats = new Stats();
      let context = {};
      if (bench.prepareGlobal) {
        bench.prepareGlobal(context);
      }

      for (let i = 0; i < bench.iterations; i++) {
        if (bench.prepare) {
          bench.prepare(context);
        }

        let t0 = Date.now();
        bench.execute(context);
        let total = Date.now() - t0;
        bench.stats.update(total);

        // @todo Logging options
        if (this.options.verbose) {
          log(
            `${bench.name} ${(i + 1).toString().padStart(2)}/${
              bench.iterations
            }: ${total}ms`
          );
          //  heapUsed: ${process.memoryUsage().heapUsed}
        }

        if (bench.options.gc) {
          global.gc();
        }
      }

      if (this.options.summary || this.options.verbose) {
        let title = `${bench.name} - ${bench.iterations} iterations`;
        const len = title.length;
        log(
          `${"-".repeat(len)}\n${title}\n${"-".repeat(len)}`
        );
        const values = bench.stats.getAll();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== "n") {
            console.log(`- ${key}: ${value.toFixed(2)}`);
          }
        });
        console.log('\n');
      }
    });
  }
}
