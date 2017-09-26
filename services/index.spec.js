describe('/services', () => {
  it('should import', () => {
    const services = require('./');
    expect(
      Object.keys(services)
        .sort()
        .join()
    ).toEqual('EnvironmentService,EventService,LocalDataService');
  });
});
