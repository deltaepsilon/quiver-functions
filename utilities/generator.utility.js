module.exports = class GeneratorUtility {
  constructor({ admin, ref }) {
    this.ref = ref || admin.database().ref();
  }

  generateIfNeeded(x, n) {
    return this.ref.once('value').then(snap => {
      let promise = Promise.resolve();
      if (snap.numChildren() < x) {
        const data = this.generate(x, n);
        promise = this.ref.set(data);
      }
      return promise;
    });
  }

  generate(x, n) {
    return this.generateKeys(x).reduce((data, key, i, keys) => {
      const connections = this.getConnections(keys, i, n);

      return (
        (data[key] = {
          i,
          connections,
        }),
        data
      );
    }, {});
  }

  getConnections(keys, i, n) {
    let connections = keys.slice(i + 1, i + n + 1);
    const missingCount = n - connections.length;

    if (missingCount) {
      const leftoverKeys = keys.slice(0, missingCount);
      connections = connections.concat(leftoverKeys);
    }

    return connections.reduce((obj, x) => {
      return (obj[x] = true), obj;
    }, {});
  }

  generateKeys(i) {
    const keys = [];
    while (i--) {
      keys.push(this.getPushKey());
    }
    return keys;
  }

  getPushKey() {
    return this.ref.push().key;
  }
};
