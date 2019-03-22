# bdit_flashcrow

Flashcrow is a data platform for viewing, requesting, and analyzing collision and count data at the City of Toronto.

This repository contains a web interface and application server for interacting with this data.  It also contains automation scripts for fetching and cleaning relevant datasets, including:

- CRASH collision data;
- FLOW counts;
- other types of counts not previously captured in FLOW;
- GCC centreline data.

# Developer Guide

This guide walks you through the process of installing and running Flashcrow.

## Installation

To run Flashcrow, you will need to:

- clone this repo;
- install dependencies;
- set up config file;
- set up the database;
- run!

Note that some steps here are automated for Windows users, but not for Mac / Linux users.  This is due to the internal development environment at the City of Toronto.

### Install Dependencies

Mac users need to install [Homebrew](https://brew.sh):

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
cat scripts/dev/brew-requirements.txt | xargs brew install
```

Windows users need to install PowerShell 3+, then install [Scoop](https://scoop.sh/):

```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
.\scripts\dev\scoop-requirements.ps1
```

Note that these scripts install specific versions of Python and node.js; if you prefer to manage those through `pyenv` and `nvm` (or other similar tools), you will need to configure that for yourself.

Once those are installed, you can install language-specific packages:

```bash
npm install
python install -r requirements.txt
```

### Set up Config File

Our application config file is left out of source control to avoid exposing secrets (e.g. session cookie keys, database credentials, etc.)  To set this up, create a file at `lib/config.js`, and generate your own passwords as needed:

```js
const path = require('path');
const vueConfig = require('../vue.config');

const config = {
  credentials: {
    username: 'some username',  // TODO: choose 'some username'
    password: 'some password'   // TODO: generate 'some password'
  },
  host: 'localhost',
  https: vueConfig.devServer.https,
  port: 8081,
  session: {
    password: 'session secret',
  },
  db: 'postgres://flashcrow:dbpassword@localhost:5432/flashcrow',  // TODO: generate 'dbpassword'
  BASE_DIR: path.resolve(__dirname, '..'),
  ENV: 'development',
  PUBLIC_PATH: vueConfig.publicPath,
};
```

### Set up the Database

```bash
# log in as admin user (e.g. root)
psql -U root

# create application-specific user and database
CREATE DATABASE flashcrow;
CREATE USER flashcrow WITH ENCRYPTED PASSWORD 'dbpassword';  # use same password as config above
GRANT ALL PRIVILEGES ON DATABASE flashcrow TO flashcrow;
\q

# Mac / Linux: ~/.pgpass
# Windows: %APPDATA%\postgresql\pgpass.conf
echo 'localhost:5432:flashcrow:flashcrow:dbpassword' >> /path/to/pgpass

# Windows:
scripts/db/db-update-windows.ps1
# Mac / Linux:
scripts/db/db-update-unix.sh --psqlArgs "-U flashcrow"
```

### Run!

Run `webpack-dev-server` to serve static files, as well as `server.js` for the REST API:

```bash
# in separate terminals:
npm run serve
node server.js
```

Once both are running, open [https://localhost:8080/flashcrow](https://localhost:8080/flashcrow) in your browser.

## npm scripts

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e -- --mode=development
```

### Run your unit tests
```
npm run test:unit
```

### Vue CLI configuration

This web application was originally generated from the following [Vue CLI preset](https://cli.vuejs.org/guide/creating-a-project.html#vue-create):

```json
{
  "useConfigFiles": true,
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      "config": "airbnb",
      "lintOn": [
        "save",
        "commit"
      ]
    },
    "@vue/cli-plugin-unit-jest": {},
    "@vue/cli-plugin-e2e-cypress": {}
  },
  "router": true,
  "routerHistoryMode": false,
  "vuex": true,
  "cssPreprocessor": "less"
}
```

For more information on configuring Vue CLI-based projects, see the [Vue CLI Configuration Reference](https://cli.vuejs.org/config/).
