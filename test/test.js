const { performance } = require('perf_hooks');

const parEach = require('..');
const parallel = require('../src/workers');

const work = async (delay) => new Promise(resolve => setTimeout(resolve, delay));
const delays = [];

for (let i = 0; i < 300; i++) {
  delays.push(Math.random() * 1000);
}

const measure = async fn => {
  const t1 = performance.now();
  await fn();
  const t2 = performance.now();

  return ((t2 - t1) / 1000).toFixed(2);
};

const start = async () => {
  // Fire request one by one
  const sequential = async () => {
    for (let delay of delays) {
      await work(delay);
    }
  };

  // Fire request in batches
  const batched = async () => parEach(delays, work, { concurrencyLimit: 10 });

  const parallelized = async () => parallel(delays, work, { parallel: true });

  console.log('Start');
  const sequentialTimeElapsed = await measure(sequential);
  console.log('====================');
  const batchedTimeElapsed = await measure(batched);
  console.log('====================');
  const parallelizedTimeElapsed = await measure(parallelized);

  console.log(`Sequential took ${sequentialTimeElapsed} seconds`);
  console.log(`Batched took ${batchedTimeElapsed} seconds`);
  console.log(`Parallelized took ${parallelizedTimeElapsed} seconds`);
};

// Keep node open until async functions are done
let done = false;

(() => {
	start()
		.then(() => (done = true))
		.catch(console.error);

	setInterval(() => done && process.exit(0), 100);
})();

