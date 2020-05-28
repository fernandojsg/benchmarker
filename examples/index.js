import { Benchmarks } from "../index.js";

console.log("EXAMPLE");

let benchmarks = new Benchmarks({
  verbose: true
});

benchmarks
  .add(
    "Test",
    () => {
      let arr = [];
      for (let i = 0; i < 100000; i++) {
        arr.push(Math.random());
      }
      arr.sort();
    },
    10
  );

benchmarks.run();
