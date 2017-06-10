module.exports = class EventService {
  getAbsolutePath(path, params = {}) {
    let result = path;
    for (let key in params) {
      const value = params[key];
      const regexp = new RegExp(`{${key}}`);
      result  = result.replace(regexp, value);
    }

    if (result.match(/(\{|\})/)) {
      throw `Params insufficient to replace all wildcards: ${result}`;
    }
    return result;
  }
}