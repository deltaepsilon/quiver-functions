const EventService = require('./event.service');

describe('EventService', () => {
  let service;
  beforeEach(() => {
    service = new EventService();
  });

  describe('getAbsolutePath', () => {
    let path;
    beforeEach(() => {
      path = 'one/{two}/three/{four}/five/{six}';
    });

    it('should replace multiple params', () => {
      expect(service.getAbsolutePath(path, { two: 2, four: 4, six: 6 })).toEqual('one/2/three/4/five/6');
    });

    it('should throw for missing params', () => {
      expect(() => service.getAbsolutePath(path)).toThrow(
        'Params insufficient to replace all wildcards: one/{two}/three/{four}/five/{six}'
      );
    });
  });
});