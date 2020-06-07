const parEach = async (work, allArgs, options = {}) => {
	const { batchSize = 5 } = options;

	let callWhenDone;
	let workersSpawned = 0;
	let nextArgsIndex = 0;

	const after = () => {
		workersSpawned -= 1;

		const allArgsUsed = nextArgsIndex >= allArgs.length;
		const allWorkersWork = workersSpawned >= batchSize;
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

	for (let i = 0; i < batchSize; i++) {
		spawn();
	}

	return new Promise(resolve => (callWhenDone = resolve));
};

export default parEach;
