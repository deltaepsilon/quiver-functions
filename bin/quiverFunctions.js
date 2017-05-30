#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const cwd = path.resolve(process.cwd());
const env = require(`${cwd}/${argv.environment || 'functions/config.json'}`);
const EnvironmentUtility = require('../utilities/utilities').EnvironmentUtility;
const environmentUtility = new EnvironmentUtility(env.config.project, env.config.token, env);

if (argv._.includes('get')) {
  console.log('getting all');
  environmentUtility.getAll().then(config => console.log(config));
} else if (argv._.includes('set')) {
  console.log('setting all');
  handlePromise(environmentUtility.setAll());
} else if (argv._.includes('unset')) {
  console.log('unsetting all');
  handlePromise(environmentUtility.unsetAll());
}

function handlePromise(promise) {
  return promise
    .catch(err => {
      console.log(err);
      return true;
    })
    .then(() => environmentUtility.getAll())
    .then(config => console.log(config));
}
