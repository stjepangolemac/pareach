# parEach - a tiny function that "parallelizes" work for NodeJS

## How to install:

```
npm install pareach
```

## How to use:

```
const parEach = require('pareach');

await parEach(work, args[, options]);
```

- `work` - an async function that accepts the args provided
- `args` - an array of arguments to call the `work` function (if you pass more than one then use a nested array `[['foo', 'bar'], ...]`)
- `options` - for now accepts only `concurrencyLimit` which is `5` by default and a `parallel` flag

## Example of parallel processing

```
await parEach(work, args, { concurrencyLimit: 10, parallel: true });
```

This was will spawn a thread for every logical CPU and split the work.

## Performance

```
Sequential took 155.45 seconds
Batched took 16.04 seconds
Parallelized took 3.55 seconds
```

This was made for the article:

[Kicking Node into high gear for data processing or how to hire 100 cats to catch a mouse](https://sgolem.com/)
