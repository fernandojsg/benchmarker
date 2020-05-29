import Stats from "incremental-stats-lite";

const DEFAULT_GLOBAL_OPTIONS = {
  verbose: false
};

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
    // options = {}
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

        if (bench.options.gc) {
          global.gc();
        }

        // @todo Logging options
        if (this.options.verbose) {
          console.log(
            `${bench.name} ${(i + 1).toString().padStart(2)}/${
              bench.iterations
            }: ${total}ms`
          );
        }
      }

      if (this.options.verbose) {
        console.log(
          `${"=".repeat(60)}\n${bench.name} - ${bench.iterations} iterations`
        );
        console.log("-".repeat(60));
        console.log(stats.getAll());
        console.log("=".repeat(60));
      }
    });
  }
}
