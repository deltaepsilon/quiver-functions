const Rx = require('rxjs/Rx');

module.exports = class LocalDataService {
  constructor({ ref, transform }) {
    this.ref = ref;
    this.data = new Map();
    this.handlers = {};
    this.transform = transform;
  }

  listen() {
    return Rx.Observable.create(observer => {
      this.observer = observer;
      this.getLastKey().then(lastKey => {
        this.handlers.childAdded = this.listenToChildAdded(observer, lastKey);
        this.handlers.childChanged = this.listenToChildChanged(observer);
        this.handlers.childRemoved = this.listenToChildRemoved(observer);
      });
    });
  }

  unlisten() {
    this.ref.off('child_added', this.handlers.childAdded);
    this.ref.off('child_changed', this.handlers.childChanged);
    this.ref.off('child_removed', this.handlers.childRemoved);
  }

  getLastKey() {
    return this.ref
      .limitToLast(1)
      .once('child_added')
      .then(snap => snap.key);
  }

  listenToChildAdded(observer, lastKey) {
    let ready = false;

    return this.ref.on('child_added', snap => {
      const key = snap.key;
      const value = snap.val();

      this.set(key, value);

      observer.next({
        event: 'child_added',
        key,
        value,
      });

      if (!ready && key == lastKey) {
        this.ready = true;
        observer.next({ event: 'ready', key });
      }
    });
  }

  listenToChildChanged(observer) {
    return this.ref.on('child_changed', snap => {
      const key = snap.key;
      const value = snap.val();

      this.set(key, value);

      observer.next({
        event: 'child_changed',
        key,
        value,
      });
    });
  }

  listenToChildRemoved(observer) {
    return this.ref.on('child_removed', snap => {
      const key = snap.key;
      const value = snap.val();

      this.data.delete(key);

      observer.next({
        event: 'child_removed',
        key,
        value,
      });
    });
  }

  set(key, value) {
    if (typeof this.transform == 'function') {
      value = this.transform({ value, data: this.data });
    }
    this.data.set(key, value);
  }
};
