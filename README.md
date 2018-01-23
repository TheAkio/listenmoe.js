ListenMoe.js [![NPM version](https://img.shields.io/npm/v/listenmoe.js.svg?style=flat-square)](https://npmjs.com/package/listenmoe.js)
===

A NodeJS wrapper for the listen.moe WebSocket.

Installing
---

```
npm install listenmoe.js
```

How to use
---

```js
const ListenMoeJS = require('listenmoe.js');

const moe = new ListenMoeJS();

moe.on('updateTrack', (data) => { // When listen.moe updates the track
    // Do something with it
});

moe.getCurrentTrack() // Returns the current track (or null if there is none)

moe.connect(); // Connect to the WebSocket
```

Links
---

[GitHub repository](https://github.com/TheAkio/listenmoe.js)

[NPM package](https://npmjs.com/package/listenmoe.js)

License
---

Refer to the [LICENSE](LICENSE) file.
