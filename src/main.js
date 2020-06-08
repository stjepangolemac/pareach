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

    console.log('Starting work for', args);

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

module.exports = parEach;
