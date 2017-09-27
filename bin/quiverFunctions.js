#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const cwd = path.resolve(process.cwd());
const env = require(`${cwd}/${argv.environment || 'functions/config.json'}`);
const { EnvironmentUtility } = require('../utilities');
const environmentUtility = new EnvironmentUtility(env.config.project, env.config.token, env);

const admin = require('firebase-admin');
admin.initializeApp({
  databaseURL: env.firebase.databaseURL,
  credential: admin.credential.cert(env.firebase.serviceAccount),
});
const GeneratorUtility = require('../utilities/generator.utility');
const generatorUtility = new GeneratorUtility({ admin });

if (argv._.includes('get')) {
  console.log('getting all');
  handlePromise(Promise.resolve());
} else if (argv._.includes('set')) {
  console.log('setting all');
  handlePromise(environmentUtility.setAll());
} else if (argv._.includes('unset')) {
  console.log('unsetting all');
  handlePromise(environmentUtility.unsetAll());
} else if (argv._.includes('generate')) {
  console.log('generating');
  const data = generatorUtility.generate(10, 3);
  admin
    .database()
    .ref('generated/connections')
    .set(data)
    .then(() => {
      console.log('done');
      process.exit();
    });
}

function handlePromise(promise) {
  return promise
    .catch(err => {
      console.log(err);
      return true;
    })
    .then(() => environmentUtility.getAll())
    .then(config => {
      console.log(config);
      process.exit();
    });
}
