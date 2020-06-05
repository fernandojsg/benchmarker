import Stats from "incremental-stats-lite";

const DEFAULT_GLOBAL_OPTIONS = {
  verbose: false,
  summary: true,
  iterations: 10,
};

const log = console.log;

const DEFAULT_OPTIONS = {
  gc: true,
};

export class Benchmarks {
  constructor(globalOptions, benchDefaultOptions) {
    this.benchs = [];
    this.benchsByGroup = {
      nogroup: [],
    };
    this.currentGroup = this.benchsByGroup.nogroup;

    this.options = Object.assign(DEFAULT_GLOBAL_OPTIONS, globalOptions);
    this.benchDefaultOptions = Object.assign(
      DEFAULT_OPTIONS,
      benchDefaultOptions
    );
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

  getReport() {
    let groups = [];
    let json = {
      groups: groups,
      meanAll: 0,
      sumAll: 0,
    };

    Object.entries(this.benchsByGroup).forEach(([groupName, benchmarks]) => {
      if (benchmarks.length === 0) {
        return;
      }

      let group = {
        groupName: groupName,
        benchmarks: [],
        meanAll: 0,
        sumAll: 0,
      };

      groups.push(group);

      benchmarks.forEach((bench) => {
        const stats = bench.stats.getAll();
        let current = {
          name: bench.name,
          stats: {},
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
    this.benchs.forEach((bench) => {
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

      if (this.options.summary || this.options.verbose) {
        let title = `${bench.name} - ${bench.iterations} iterations`;
        const len = title.length;
        log(`${"-".repeat(len)}\n${title}\n${"-".repeat(len)}`);
        const values = bench.stats.getAll();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== "n") {
            console.log(`- ${key}: ${value.toFixed(2)}`);
          }
        });
        console.log("\n");
      }
    });
  }
}
