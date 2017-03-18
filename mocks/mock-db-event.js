module.exports = class MockAuthEvent {
  constructor(ref, params, value) {
    if (!ref) {
      throw 'ref required to initialize MockDBEvent';
    }
    if (!value) {
      throw 'value required to initialize MockDBEvent';
    }

    this.data = ref;
    this.data.adminRef = ref;
    
    this.params = params;

    this.data.val = () => value;
  }

};