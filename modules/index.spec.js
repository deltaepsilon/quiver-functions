describe('/modules', () => {
  it('should import', () => testImport('./'));


  it('check /index.js too', () => testImport('../'));

  function testImport(path) {
    const modules = require(path);
    expect(
      Object.keys(modules)
        .sort()
        .join()
    ).toEqual('Environment,GraphQLServer,Login,UpdateUser');

    const environment = new modules.Environment();
    expect(environment.constructor.name).toEqual('Environment');
  }
});
