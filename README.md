# Quiver Functions

A collection of little helpers for your Firebase Functions pleasure.

You'll find yourself implenting a lot of the same things over, and over and over. For instance, you'll need to test your functions locally, so you'll be implementing mock events over and over again. And setting functions environment variables programatically is a pain in the neck... so you'll want that automated too.

### Installation

- ```npm install --save quiver-functions```

### Testing

- ```git clone https://github.com/deltaepsilon/quiver-functions.git && cd quiver-functions```
- Install ```firebase-tools``` globally with ```npm install -g firebase-tools```.
- Run ```firebase init``` and connect the local project to one of your Firebase projects. No need to install database, functions or hosting if you're just running tests.
- Get your CI token with ```firebase login:ci```. Follow the instructions and copy your new CI token from the CLI.
- Edit ```./functions/config.json``` with your test project's details including the CI token. Let ```./functions/config.json.dist``` be your guide.
- ```cd quiver-functions```
- ```npm install```
- ```cd ..``
- ```npm test```

### Test bed web page

- ```npm run install-public```
- ```npm run serve```
- Edit ```./public/env.client.json``` with your project's details. Let ```./public/env.client.json.dist``` be your guide.
- Open [http://localhost:8080/](http://localhost:8080/)
- ```firebase deploy --only database```: Deploys database rules
- ```firebase deploy --only functions```: Deploys functions
- ```firebase deploy --only hosting```: Deploys hosting; use if you want to host the test bed web page.
- Profit

## How to use the module

QuiverFunctions export statement looks like this:

```
module.exports = {
  OnCreate: require('./functions/lib/on-create'),
  Login: require('./functions/lib/login'),
  mocks: require('./mocks/mocks'),
  utilities: require('./utilities/utilities')
}
```

### OnCreate

***OnCreate*** is a simple handler for user-creation events. It simply copies the new user's JWT data to whatever collection you specify with the ```usersPath``` parameter.

### Login

***Login*** is designed so that every time your user logs in, he'll add his JWT data to a queue, and ***Login*** will process that queue item, checking to see if the email is in the ```adminUsers``` array and adding the ```user.isAdmin``` flag as appropriate. The user details are then updated to ```usersPath/{uid}``` based on the specified ```usersPath``` param.

***Login*** requires ```{uid}``` to be in the ref path. It's a generic solution, I know, but every app I've written in the last year has used this functionality, written exactly like this.

#### Example

```
const functions = require('firebase-functions');

const quiverFunctions = require('quiver-functions');
const OnCreate = quiverFunctions.OnCreate;
const Login = quiverFunctions.Login;


const onCreate = new OnCreate({
  usersPath: 'quiver-functions/users'
});
exports.onCreate = functions.auth.user().onCreate(onCreate.getFunction());

const login = new Login({
  usersPath: 'quiver-functions/users',
  adminUsers: ['chris@chrisesplin.com']
});
exports.login = functions.database.ref('quiver-functions/queues/current-user/{uid}').onWrite(login.getFunction());

```

### Utilities

***QuiverFunctions.utilities*** is a collection of useful little helpers. So far it's just ```utililities.EnvironmentUtility```, which manipulates Firebase Functions config as found in ```yourProject/functions/config.json```. There are three functions on ```EnvironmentUtility```:

1. ***EnvironmentUtility.getAll()***
2. ***EnvironmentUtility.unsetAll()***
3. ***EnvironmentUtility.setAll()***

#### Example

```
const config = require('../functions/config.json');
const quiverFunctions = require('quiver-functions');
const environmentUtility = new quiverFunctions.utilities.EnvironmentUtility('quiver-two', 'my-ci-token-from-firebase-tools-cli', config);

environmentUtility.unsetAll()
  .then(() => {
    return environmentUtility.setAll();
  })
  .then(() => {
    return environmentUtility.getAll();
  })
  .then((newConfig) => {
    console.log('New Firebase Functions config: ', newConfig);
  });

```

### Mocks

***QuiverFunctions.mocks*** is a collection of useful mocks for testing Firebase Functions locally. See the code in ```/mocks``` to see how the objects are built. Check out ```/functions/lib/login.spec.js``` and ```/functions/lib/on-create.spec.js``` for example implementation.

Developing Firebase Functions without a local testing environment is... a mistake. A huge mistake. It's basically impossible to develop effectively with a guess-and-check technique. Every call of ```firebase deploy --only functions``` takes at least a minute, and then the functions can take a while to warm up, so solving bugs by uploading new "fixed" functions can be a huge waste of time. Just write the tests. You'll be happier. Promise.


