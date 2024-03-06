# bdit_flashcrow

MOVE is a data platform for viewing, requesting, and analyzing data related to City of Toronto rights-of-way.  This includes:

- CRASH collision data;
- FLOW counts;
- other types of counts not previously captured in FLOW;
- GCC centreline data.

## Points of Contact

To contact the MOVE team:

| If... | Contact: | Who? |
| --- | --- | --- |
| You have a question about development, deployment, security, or other technical aspects of MOVE's web application | Web Application Developer | 404 Not Found |
| You have a question about development, deployment, security, or other technical aspects of MOVE's data infrastructure | Civic Data Engineer | [Peter Lyons](mailto:Peter.Lyons@toronto.ca) |
| You have a question related to MOVE user testing, upcoming launches, or roadmaps | Product Manager | [Maddy Ewins](mailto:Maddy.Ewins@toronto.ca) |
| Your question isn't captured above, or you're not sure who to contact | Team Inbox | [MOVE Team](mailto:move-team@toronto.ca) |

We will try to respond to any questions within 48 hours.  However, given the small size of our team, please understand if it takes us a bit longer to respond sometimes.

## New Developer?

See the [MOVE Developer Handbook](https://www.notion.so/bditto/MOVE-Developer-Handbook-182de05ad8a94888b52ccc68093a497a).  This guide will help you:

- request the necessary permissions from City of Toronto IT and the Big Data Innovation Team;
- install MOVE prerequisites on your City of Toronto computer;
- configure and run MOVE inside a virtual machine using [Vagrant](https://www.vagrantup.com/);
- understand team practices around communication, source control, code editing, and code style.

## Code Documentation

Working on MOVE development?  Help improve our documentation!  If you come across something you'd like to see documented, first [submit a bug report](https://github.com/CityofToronto/bdit_flashcrow/issues/new/choose) with the [documentation label](https://github.com/CityofToronto/bdit_flashcrow/labels/documentation).

Once the bug report has been submitted, you can either [submit a pull request](https://github.com/CityofToronto/bdit_flashcrow/pulls), or assign it to whoever's best suited to follow up.

This repository consists of:

- [`lib`](lib/README.md): libraries used throughout MOVE;
- [`reporter`](reporter/README.md): MOVE Reporter, which provides a RESTful API to fetch data-driven reports in various formats;
- [`scheduler`](scheduler/README.md): MOVE Scheduler, which provides a RESTful API to create and monitor background jobs such as bulk report generation;
- [`web`](web/README.md): the MOVE web application;
  - `web/main.js`: entry point to the MOVE web frontend, written as an SPA (Single-Page Application) using [Vue.js](https://vuejs.org/);
  - `web/web.js`: the MOVE web backend, which provides a REST API layer to access data from PostgreSQL and City of Toronto geospatial REST services;
- [`scripts`](scripts/README.md): development, deployment, and automation scripts;
- [`tests`](tests/README.md): tests.

---

## npm scripts

These scripts are listed in [package.json](package.json), as per the [`npm-run-script`](https://docs.npmjs.com/cli/run-script) documentation.

### MOVE Web Backend

- `backend`: runs the REST API server at `web/web.js` on port 8100;
- `backend:inspect`: runs `web/web.js`, but also opens debugging on port 9100;
- `backend:inspect-brk`: like `backend:inspect`, but waits for a debugger to attach before running (in case you need to debug something that happens during startup);
- `backend:test-api`: runs `web/web.js` in headless testing mode on port 8080, for use during REST API tests;

### Continuous Integration (CI)

- `ci:jest-coverage`: run all `jest` tests and compute coverage;
- `ci:npm-audit`: run `npm audit` to scan for known vulnerabilities in our `npm` dependencies;
- `ci:npm-outdated`: run `npm outdated` to scan for outdated dependency versions;
- `ci:test-unit`: run unit `jest` tests, as required for our CodeBuild pipeline;

### MOVE Web Frontend

- `frontend`: runs `webpack-dev-server` to serve frontend static resources on port 8080, with hot-reloading for changes, and with `webpack-bundle-analyzer` running on port 9080;
- `frontend:build`: builds a production-ready version of our frontend static resources;

### `git` pre-commit Hook

- `pre-commit:lint-staged`: run linters on any files changed in the current commit;
- `pre-commit:test-unit-staged`: run unit tests for any files changed since latest `master`.

### MOVE Reporter

- `reporter`: runs the REST API server at `reporter/reporter.js` on port 8200;
- `reporter:inspect`: runs `reporter/reporter.js`, but also opens debugging on port 9200;
- `reporter:inspect-brk`: like `reporter:inspect`, but waits for a debugger to attach before running (in case you need to debug something that happens during startup);
- `reporter:test-api`: runs `reporter/reporter.js` in testing mode on port 8200, for use during REST API tests;

### MOVE Scheduler

- `scheduler`: runs the REST API server at `scheduler/scheduler.js` on port 8300;
- `scheduler:inspect`: runs `scheduler/scheduler.js`, but also opens debugging on port 9300;
- `scheduler:inspect-brk`: like `scheduler:inspect`, but waits for a debugger to attach before running (in case you need to debug something that happens during startup);
- `scheduler:test-api`: runs `scheduler/scheduler.js` in testing mode on port 8300, for use during REST API tests;

### Testing

- `test:db-shutdown`: tears down in-memory MOVE database testing harness;
- `test:db-startup`: starts an in-memory MOVE database testing harness;
- `test:test-api`: runs all REST API tests;
- `test:test-db`: runs all DAO tests;
- `test:test-unit`: runs all unit tests;

Note that `test:db-startup` must be run before `test:test-api` or `test:test-db`, as those tests depend on the MOVE database testing harness being operational.

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
  },
  "router": true,
  "routerHistoryMode": true,
  "vuex": true,
  "cssPreprocessor": "sass"
}
```

For more information on configuring Vue CLI-based projects, see the [Vue CLI Configuration Reference](https://cli.vuejs.org/config/).

## Config Files

These files configure some of the various tools used in MOVE:

- `.editorconfig`: enforces simple code conventions for all VSCode users;
- `.eslintrc.js`: ESLint rules for style-checking JavaScript;
- `.gitignore`: files ignored during `git` operations;
- `.gitlab-ci.yml`: GitLab CI / CD configuration;
- `.ncurc.json`: `npm-check-updates` configuration, used during release to ensure all dependencies are either up-to-date or explicitly recorded as exceptions;
- `.nvmrc`: target version of node.js;
- `.stylelintrc`: `stylelint` rules for style-checking CSS / SASS frontend styles;
- `appspec.yml`: used in conjunction with `deploy_scripts` for AWS CodeDeploy-managed deployments of MOVE;
- `audit-resolve.json`: generated by `check-audit`, used during release to ensure MOVE is free of `npm audit`-identified vulnerabilities, other than those explicitly recorded here as temporary exceptions (e.g. if a dependency cannot yet be updated to resolve a vulnerability);
- `babel.config.js`: Babel configuration for transpiling JavaScript;
- `bdit-flashcrow.code-workspace`: VSCode workspace configuration;
- `jest.config.js`: Jest configuration for unit, database, and REST API tests;
- `LICENSE`: open-source license that MOVE is released under;
- `package.json`: `npm` package configuration and dependencies;
- `vue.config.js`: Vue project configuration, including webpack configuration for `webpack-dev-server` in development.
