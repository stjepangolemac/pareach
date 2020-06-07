# parEach - a tiny function that "parallelizes" work in NodeJS

How to install:

```
npm install pareach
```

How to use:

```
const parEach = require('pareach');

await parEach(work, args[, options]);
```

- `work` - an async function that accepts the args provided
- `args` - an array of arguments to call the `work` function (if you pass more than one then use a nested array `[['foo'], ...]`)
- `options` - for now accepts only `batchSize` which is `5` by default


This was made for the article:

[Kicking Node into high gear for data processing or how to hire 100 cats to catch a mouse](https://sgolem.com/)
