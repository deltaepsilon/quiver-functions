const app = require('express')();
const port = 3333;
const Environment = require('./functions/onRequest/environment.onRequest');
const config = require('./functions/config.json');

app.get('/environment', new Environment({ config }).getFunction());

app.listen(port, () => console.log(`listening on port ${port}`));
