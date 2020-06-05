import { Benchmarks } from "../src/index.js";

console.log("EXAMPLE");

let benchmarks = new Benchmarks({
  verbose: true,
});

benchmarks.add({
  name: "Test",
  prepare: (ctx) => {
    ctx.arr = [];
  },
  execute: (ctx) => {
    for (let i = 0; i < 100000; i++) {
      ctx.arr.push(Math.random());
    }
    ctx.arr.sort();
  },
  iterations: 10,
});

benchmarks.run();
