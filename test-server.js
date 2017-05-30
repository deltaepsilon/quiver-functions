const app = require('express')();
const port = 3333;
const Environment = require('./functions/onRequest/environment.onRequest');

app.get('/environment', new Environment().getFunction());

app.listen(port, () => console.log(`listening on port ${port}`));
