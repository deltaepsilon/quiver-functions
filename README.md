# Quiver Functions

A collection of little helpers for your Firebase Functions pleasure.

You'll find yourself implentings a lot of the same things over, and over and over. For instance, you'll need to test your functions locally, so you'll be implementing mock events over and over again. And setting functions environment variables programatically is a pain in the neck... so you'll want that automated too.

### Installation

- ```npm install --save quiver-functions```

### Testing

- ```git clone https://github.com/deltaepsilon/quiver-functions.git```
- ```cd quiver-functions```
- Installed ```firebase-tools``` globally with ```npm install -g firebase-tools```.
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

```

```




