# bdit_flashcrow

Flashcrow is a data platform for viewing, requesting, and analyzing data related to City of Toronto rights-of-way.  This includes:

- CRASH collision data;
- FLOW counts;
- other types of counts not previously captured in FLOW;
- GCC centreline data.

## Points of Contact

To contact the Flashcrow team:

| If... | Contact: | Who? |
| --- | --- | --- |
| You have a question related to Flashcrow development, deployment, security, or of an otherwise technical nature | Tech Lead | [Evan Savage](mailto:Evan.Savage@toronto.ca) |
| You have a question related to Flashcrow design practices, usability, or accessibility | Design Lead | [Pallavi Thampi](mailto:Pallavi.Thampi@toronto.ca) |
| You have a question related to Flashcrow user testing, upcoming launches, or roadmaps | Product Manager | [Andrew Konoff](mailto:Andrew.Konoff@toronto.ca) |
| Your question isn't captured above, or you're not sure who to contact | Service Owner | [Jesse Coleman](mailto:Jesse.Coleman@toronto.ca) |

We will try to respond to any questions within 48 hours.  However, given the small size of our team, please understand if it takes us a bit longer to respond sometimes.

## New Developer?

See the [Developer's Guide](scripts/dev/README.md).  This guide will help you:

- request the necessary permissions from City of Toronto IT and the Big Data Innovation Team;
- install Flashcrow prerequisites on your City of Toronto computer;
- configure and run Flashcrow inside a virtual machine using [Vagrant](https://www.vagrantup.com/);
- understand team practices around communication, source control, code editing, and code style.

## Deployment

To deploy the Flashcrow web application, follow the [Web Stack Deployment Guide](scripts/deployment/web/README.md).

We are currently working with Cloud Services to create CI / CD pipelines around integration testing and deployment.  The Deployment Guide will be updated as that work proceeds.

As part of that, the [ETL Stack Deployment Guide](scripts/deployment/etl/README.md) is a work in progress.

## Code Documentation

Working on Flashcrow development?  Help improve our documentation!  If you come across something you'd like to see documented, first [submit a bug report](https://github.com/CityofToronto/bdit_flashcrow/issues/new/choose) with the [documentation label](https://github.com/CityofToronto/bdit_flashcrow/labels/documentation).

Once the bug report has been submitted, you can either [submit a pull request](https://github.com/CityofToronto/bdit_flashcrow/pulls), or assign it to whoever's best suited to follow up.

This repository consists of:

- [`src`](src/README.md): the Flashcrow web frontend, written as an SPA (Single-Page Application) using [Vue.js](https://vuejs.org/);
- `server.js`: the Flashcrow web application server, which provides a REST API layer to access data from PostgreSQL and City of Toronto geospatial REST services;
  - `lib`: libraries used by the web application server;
- [`scripts`](scripts/README.md): development, deployment, and automation scripts.

---

## npm scripts

These scripts are listed in [package.json](package.json), as per the [`npm-run-script`](https://docs.npmjs.com/cli/run-script) documentation.

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

## Vue CLI configuration

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
