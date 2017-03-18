module.exports = class MockAuthEvent {
  constructor(ref, value) {
    if (!ref) {
      throw 'ref required to initialize MockDBEvent';
    }
    if (!value) {
      throw 'value required to initialize MockDBEvent';
    }

    this.data = ref;

    this.data.val = () => value;
  }

};