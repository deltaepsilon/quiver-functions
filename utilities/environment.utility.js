const firebaseTools = require('firebase-tools');

module.exports = class EnvironmentUtility {
  constructor(project, token, env) {
    if (!project) throw 'project must be first argument in constructor';
    if (!token) throw 'token must be second argument in constructor';
    if (!env) throw 'token must be third argument in constructor';

    this.firebaseToolsOptions = {
      project: project,
      token: token
    };
    this.env = env;
    this.FIREBASE_REGEX = /firebase/gi;
  }

  getConfigCommands(env, path = []) {
    if (typeof env == 'undefined') {
      return [path.join('.')];
    } else if (!env) {
      let pathString = path.join('.') + '=false';
      return [pathString];
    }
    var keys = Object.keys(env);
    var i = keys.length;
    var paths = [];

    while (i--) {
      let key = keys[i];
      let value = env[key];
      let keyPath = path.concat(key).join('.');

      if (value && typeof value == 'object' && !Object.keys(value).length) {
        paths.push(`${keyPath}=undefined`);
      } else if (typeof value == 'boolean') {
        const stringified = `${keyPath}=${value ? '"true"' : '"false"'}`;
        console.log(`Boolean forced to string: ${stringified}`);
        paths.push(stringified);
      } else if (this.isStringNumber(value)) {
        paths.push(`${keyPath}="${String(value)}"`);
      } else if (typeof value == 'string') {
        paths.push(`${keyPath}=${String(value)}`);
      } else {
        paths = paths.concat(this.getConfigCommands(value, path.concat(key)));
      }
    }
    return paths;
  }

  isStringNumber(value) {
    return String(+value) == value;
  }

  getAll() {
    return firebaseTools.functions.config.get(undefined, this.firebaseToolsOptions);
  }

  unsetAll() {
    return this.getAll().then(config => {
      const paths = this.getConfigCommands(config).map(command => this.getFirstKey(command));
      const uniquePaths = [...new Set(paths)];
      const filteredPaths = this.filterExcludedKeys(uniquePaths);
      const pathsString = filteredPaths.join(',');
      if (!pathsString) {
        return true;
      } else {
        console.log('config', JSON.stringify(config));
        // console.log('filteredPaths', filteredPaths);
        return Promise.all(filteredPaths.map(path => {
          return firebaseTools.functions.config.unset([path], this.firebaseToolsOptions);
        })).then(() => pathsString);
      }
    });
  }



  setAll(incomingCommands) {
    const commands = incomingCommands || this.getConfigCommands(this.env);
    const cleanedCommands = this.getCleanCommands(commands);
    console.log('cleanedCommands', cleanedCommands);
    return firebaseTools.functions.config.set(cleanedCommands, this.firebaseToolsOptions).catch(err => Promise.reject({cleanedCommands, err})).then(() => cleanedCommands);
  }

  getCleanCommands(commands) {
    const filteredCommands = this.filterCommands(commands);
    return this.cleanCommands(filteredCommands);
  }

  cleanCommands(commands) {
    return commands.map(command => {
      let [path, value] = command.split('=');

      if (path != path.toLowerCase()) {
        console.log('All config forced to lowercase.', command);
        path = path.toLowerCase();
      }

      if (path.split('.').length < 2) {
        console.log('All config have at a 2-part key (e.g. foo.bar).', path);
        path = 'config.' + path;
      }

      return `${path}=${value}`;
    });
  }

  filterCommands(commands) {
    const firstKeys = commands.map(command => this.getFirstKey(command));
    const filteredKeys = this.filterExcludedKeys(firstKeys);
    const filteredCommands = this.filterExcludedCommands(filteredKeys, commands);

    if (commands.length != filteredCommands.length) {
      console.log('All keys containing "firebase" have been removed per Firebase Functions requirements.');
    }

    return  filteredCommands;
  }

  filterExcludedCommands(filteredKeys, commands) {
    return commands.filter(command => filteredKeys.includes(this.getFirstKey(command)));
  }

  filterExcludedKeys(paths) {
    return paths.filter(path => !path.match(this.FIREBASE_REGEX));
  }

  getFirstKey(path) {
    return this.getKeys(path)[0].toLowerCase();
  }

  getKeys(path) {
    const {key} = this.getKeyValue(path);
    return key.split('.');
  }

  getKeyValue(path) {
    var [key, value] = path.split('=');
    return {key, value};
  }
};
