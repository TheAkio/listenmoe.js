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

// For the jpop WebSocket you can also leave the parameters empty
const moe = new ListenMoeJS('jpop'); // or "kpop" if you want the trackdata from there

moe.on('updateTrack', (data) => { // When listen.moe updates the track
    // Do something with it
});

moe.on('error', (error) => { // Handle any thrown errors
    // Handle it or ignore
});

moe.connect(); // Connect to the WebSocket

moe.getCurrentTrack() // Returns the current track (or null if there is none)

moe.fetchTrack() // Send a track update request to receive the newest data
.then(t => {
    // Do something with it
}).catch(e => {
    // Handle it or ignore
}):
```

Links
---

[GitHub repository](https://github.com/TheAkio/listenmoe.js)

[NPM package](https://npmjs.com/package/listenmoe.js)

License
---

Refer to the [LICENSE](LICENSE) file.
