const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { cpus } = require('os');

const parEach = async (allArgs, work, options = {}) => {
  const { concurrencyLimit = 5, onProgress = () => null } = options;

  if (!allArgs.length) {
    return;
  }

	let callWhenDone;
	let workersSpawned = 0;
	let nextArgsIndex = 0;

	const after = () => {
		workersSpawned -= 1;

		onProgress(
			((nextArgsIndex / Math.max(nextArgsIndex, allArgs.length)) * 100).toFixed(2)
		);

		const allArgsUsed = nextArgsIndex >= allArgs.length;
		const allWorkersWork = workersSpawned >= concurrencyLimit;
		const noWorkersWork = workersSpawned <= 0;

		if (!allWorkersWork && !allArgsUsed) {
			spawn();
		}

		if (noWorkersWork && allArgsUsed) {
			callWhenDone();
		}
	};

	const spawn = () => {
		const args = allArgs[nextArgsIndex];

		if (Array.isArray(args)) {
			work(...args).then(after);
		} else {
			work(args).then(after);
		}

		workersSpawned += 1;
		nextArgsIndex += 1;
	};

  const workersToSpawn = Math.min(allArgs.length, concurrencyLimit);
	for (let i = 0; i < workersToSpawn; i++) {
		spawn();
	}

	return new Promise(resolve => (callWhenDone = resolve));
};

if (isMainThread) {
  const parallel = async (allArgs, work, options = {}) => {
    if (!options.parallel) {
      return parEach(allArgs, work, options);
    }

    return new Promise((resolve, reject) => {
      let numCpus = cpus().length;
      const argsPortion = Math.round(allArgs.length / numCpus);

      const afterWorker = () => {
        numCpus -= 1;

        if (numCpus <= 0) {
          resolve();
        }
      };

      for (let i = 0; i < numCpus; i++) {
        const startIndex = i * argsPortion;
        const endIndex = Math.min((i + 1) * argsPortion, allArgs.length + 1);
        const workerArgs = allArgs.slice(startIndex, endIndex);

        const worker = new Worker(__filename, {
          workerData: { args: workerArgs, work: work.toString(), options }
        });

        worker.on('message', console.log);
        worker.on('error', reject);
        worker.on('exit', afterWorker);
      }
    });
  }

  module.exports = parallel;
} else {
  let done = false;

  const { args, work, options } = workerData;
  const workToDo = eval(work);

  const workerStart = async () => parEach(args, workToDo, options);

  (() => {
    workerStart()
      .then(() => (done = true))
      .catch(console.error);

    setInterval(() => done && process.exit(0), 100);
  })();
}
