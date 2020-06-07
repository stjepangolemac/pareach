require('isomorphic-fetch');
const { performance } = require('perf_hooks');

const parEach = require('..');

const work = async url => fetch(url);

const urls = [
  'https://www.google.com/search?q=1',
  'https://www.google.com/search?q=2',
  'https://www.google.com/search?q=3',
  'https://www.google.com/search?q=4',
  'https://www.google.com/search?q=5',
  'https://www.google.com/search?q=6',
  'https://www.google.com/search?q=7',
  'https://www.google.com/search?q=8',
  'https://www.google.com/search?q=9',
  'https://www.google.com/search?q=10',
  'https://www.google.com/search?q=11',
  'https://www.google.com/search?q=12',
  'https://www.google.com/search?q=13',
  'https://www.google.com/search?q=14',
  'https://www.google.com/search?q=15',
  'https://www.google.com/search?q=16',
  'https://www.google.com/search?q=17',
  'https://www.google.com/search?q=18',
  'https://www.google.com/search?q=19',
  'https://www.google.com/search?q=20',
];

const measure = async fn => {
  const t1 = performance.now();
  await fn();
  const t2 = performance.now();

  return ((t2 - t1) / 1000).toFixed(2);
};

const start = async () => {
  // Fire request one by one
  const sequential = async () => {
    for (let url of urls) {
      await work(url);
    }
  };

  // Fire request in batches
  const batched = async () => parEach(work, urls);

  const sequentialTimeElapsed = await measure(sequential);
  const batchedTimeElapsed = await measure(batched);

  console.log(`Sequential took ${sequentialTimeElapsed} seconds`);
  console.log(`Batched took ${batchedTimeElapsed} seconds`);
};

// Keep node open until async functions are done
let done = false;

(() => {
	start()
		.then(() => (done = true))
		.catch(console.error);

	setInterval(() => done && process.exit(0), 100);
})();

