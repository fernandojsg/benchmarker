import Stats from "incremental-stats-lite";

const DEFAULT_GLOBAL_OPTIONS = {
  verbose: false,
  summary: true
};

const log = console.log;

const DEFAULT_OPTIONS = {
  gc: true
};

export class Benchmarks {
  constructor(globalOptions, benchDefaultOptions) {
    this.benchs = [];
    this.options = Object.assign(DEFAULT_GLOBAL_OPTIONS, globalOptions);
    this.benchDefaultOptions = Object.assign(DEFAULT_OPTIONS, benchDefaultOptions);
  }
  add(bench) {
    if (!bench.options) {
      bench.options = this.benchDefaultOptions;
    } else {
      bench.options = Object.assign(this.benchDefaultOptions, bench.options);
    }

    this.benchs.push(bench);
    return this;
  }

  run() {
    this.benchs.forEach(bench => {
      let stats = new Stats();
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
        stats.update(total);

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
        const values = stats.getAll();
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
