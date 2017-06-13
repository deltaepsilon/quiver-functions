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
- ```cd ..```
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
  UpdateUser: require('./functions/onCreate/updateUser.onCreate'),
  Login: require('./functions/onWrite/login.onWrite'),
  Environment: require('./functions/onRequest/environment.onRequest'),
  mocks: require('./mocks/mocks'),
  utilities: require('./utilities/utilities')
}
```

### UpdateUser

***UpdateUser*** is a simple handler for user-creation events. It simply copies the new user's JWT data to whatever collection you specify with the ```usersPath``` parameter.

### Login

***Login*** is designed so that every time your user logs in, he'll add his token from ```firebase.auth().currentUser.getToken(token => console.log(token))``` queue, and ***Login*** will process that queue item, verifying the ID token, checking to see if the user's email is in the ```adminUsers``` array and adding the ```user.isAdmin``` flag as appropriate. The user details are then updated to ```usersPath/{uid}``` based on the specified ```usersPath``` param.

***Login*** requires ```{uid}``` to be in the ref path. It's a generic solution, I know, but every app I've written in the last year has used this functionality, written exactly like this.

### EnvironmentService

***EnvironmentService*** takes environment config and has a utility method called ```getPublicEnvironment(host)``` that will return just the ```.public``` node of your environment as well as complete any overrides based on the ```host``` that you pass in. Note that keys can't have periods in them so we're using ```_``` instead of dots. Here's a quick example:

```
"public": {
  "a": "defaults: a",
  "models": {
    "queues": {
      "current-user": "quiver-functions/queues/current-user"
    }
  },
  "localhost": {
    "a": "localhost: a",
    "b": "localhost: b"
  },
  "subdomain_domain_tld": {
    "a": "subdomain_domain_tld: a",
    "b": "subdomain_domain_tld: b"
  }
}
```

***public*** and ***domain-specific overrides***

I always find myself wanting some of my environment variables to be public so that I can quickly pass them to my client apps. I also want to be able to override these public variables based on domain. I use different domains for dev, test and prod, so I should be able to easily override my public environment variables.


Check out ```./functions/config.json.dist``` for a complete example. 

### Environment Variable Rules

Functions has some rules for environment variables/config.
 
 - No root-level key can have the word "firebase" in it. There is a ```firebase: {}``` attribute that will be filled in automatically by Functions, so you won't have to look far for your core environment variables. Also, it doesn't hurt to keep your own ```firebase: {}``` attributes in ```config.json```; just know that this attribute will be deleted upon upload.
 - All config must be nested. You can't do ```{ someValue: 'true' }```. It needs to be ```{some: { value: 'true' }}```.
 - Dashes and special characters in attribute names can wreck havoc. So can capitalization. Attribute names should be all lowercase and have no special characters. Underscores are preferred. So don't use ```{'test-user': {...}}```. Use ```{test_user: {...}}``` instead.


### Environment onRequest Handler

The ***Environment*** onRequest handler is a bit fancy. It takes advantage of the fact that ```firebase-functions``` looks for environment variables in ```./functions/config.json```. 

First, place all of your environment variables in that .json file, and use ```./utilities/environment.utility.js``` and it's ```setAll()```, ```unsetAll()``` and ```getAll()``` functions to push those environment variables up to Functions config. Now your local environment and your Functions environment will be equivalent.

Second, export an ```environment``` function in your ```./functions/index.js```. Here's an example:

```
const Environment = require('quiver-functions').Environment;
const environment = new Environment();
exports.environment = functions.https.onRequest(environment.getFunction());
```

Third, create a rewrite rule in your ```./firebase.json```. Here's what I'm using for ```firebase.json```. Notice that the ***source*** is ```/environment```, but there's no ***destination***... only a ***function***. That ***function*** value matches up to the ```exports.environment = ...``` line in the example above.

```
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/environment.js",
        "function": "environment"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

```

Now that you've completed the redirect, run ```firebase deploy``` in your terminal and hit [https://your-firebase.firebaseapp.com/environment](https://your-firebase.firebaseapp.com/environment) to see the magic. It's a single script tag that adds your public environment to ```window.firebaseEnv```. This is perfect for importing your client-side environment variables into your dev, test and prod clients.

#### Full Example

```
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = functions.config();

admin.initializeApp(config.firebase);

const UpdateUser = require('quiver-functions').UpdateUser;
const updateUser = new UpdateUser({
  usersPath: 'quiver-functions/{environment}/users',
  database: admin.database()
});
exports.updateUser = functions.auth.user().onCreate(updateUser.getFunction());

const Login = require('quiver-functions').Login;
const login = new Login({
  usersPath: 'quiver-functions/users',
  adminUsers: ['chris@chrisesplin.com']
});
exports.login = functions.database.ref('quiver-functions/queues/current-user/{uid}').onWrite(login.getFunction());

const config = functions.config();
const headers = {
  'Cache-Control': 'public, max-age=600, s-maxage=600'
};
const Environment = require('quiver-functions').Environment;
const environment = new Environment({ config, headers });
exports.environment = functions.https.onRequest(environment.getFunction());

```

### Utilities

***QuiverFunctions.utilities*** is a collection of useful little helpers. So far it's just ```utililities.EnvironmentUtility```, which manipulates Firebase Functions config as found in ```./functions/config.json```. There are three functions on ```EnvironmentUtility```:

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
  .then(newConfig => {
    console.log('New Firebase Functions config: ', newConfig);
  });

```

### Mocks

***QuiverFunctions.mocks*** is a collection of useful mocks for testing Firebase Functions locally. See the code in ```/mocks``` to see how the objects are built. Check out ```/functions/lib/login.spec.js``` and ```/functions/lib/on-create.spec.js``` for example implementation.

Use ```new functions.database.DeltaSnapshot(...)``` to create mock DeltaSnapshots as documented [here](https://firebase.google.com/docs/functions/unit-testing).

Developing Firebase Functions without a local testing environment is... a mistake. A huge mistake. It's basically impossible to develop effectively with a guess-and-check technique. Every call to ```firebase deploy --only functions``` takes at least a minute, and then the functions can take a while to warm up, so solving bugs by uploading new "fixed" functions can be a huge waste of time. Just write the tests. You'll be happier. Promise.

### QVF

I found myself wanting to fire off the ***EnvironmentUtility*** functions directly from the command line, so I wrote a tiny CLI that's available with the command ```qvf``` (for quiver-functions). It has three commands and one flag. Here's the full example:

```
$ qvf unset
$ qvf get
$ qvf set
$ qvf set --environment some/other/environment.json
```

Note that ```qvf set``` defaults to using ```$PWD/functions/config.json```.


