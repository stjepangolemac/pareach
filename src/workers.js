const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { cpus } = require('os');

const parEach = require('./main');

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
