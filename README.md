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

See the [MOVE Developer Handbook](https://www.notion.so/bditto/MOVE-Developer-Handbook-182de05ad8a94888b52ccc68093a497a).  This guide will help you:

- request the necessary permissions from City of Toronto IT and the Big Data Innovation Team;
- install Flashcrow prerequisites on your City of Toronto computer;
- configure and run Flashcrow inside a virtual machine using [Vagrant](https://www.vagrantup.com/);
- understand team practices around communication, source control, code editing, and code style.

## Deployment

To deploy the Flashcrow web application, you will need access to the AWS CodeCommit repository.  Once you have that:

```
git remote add code-commit https://git-codecommit.us-east-1.amazonaws.com/v1/repos/bdit_flashcrow

./scripts/deployment/code-commit/deploy_code_commit.sh
```

For now, please use the `deploy_code_commit.sh` script for all deployments to AWS CodeCommit!  We're working with Cloud Services on a deployment process that includes continuous integration (CI) testing; in the meantime, that script runs our CI tests before pushing to AWS CodeCommit.

Any versions pushed to AWS CodeCommit are automatically deployed to [`web-dev`](https://move.intra.dev-toronto.ca).

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

- `backend`: runs the REST API server at `server.js`;
- `backend:inspect`: runs `server.js`, but also opens debugging on port 9229;
- `backend:inspect-brk`: like `backend:inspect`, but waits for a debugger to attach before running (in case you need to debug something that happens during startup);
- `ci:jest-coverage`: compute test coverage;
- `ci:npm-audit`: run `npm audit` to scan for known vulnerabilities in our `npm` dependencies;
- `ci:test-api`: test our REST API layer;
- `ci:test-db`: test our database layer;
- `ci:test-unit`: run unit tests;
- `frontend`: runs `webpack-dev-server` to serve frontend static resources, with hot-reloading for changes;
- `frontend:build`: builds a production-ready version of our frontend static resources;
- `frontend:docs`: generates frontend JSDoc-based documentation and serves it on port 9080, with hot-reloading for changes;
- `pre-commit:lint-staged`: run linters on any files changed in the current commit;
- `pre-commit:test-unit-staged`: run unit tests for any files changed since latest `master`.

The `ci:` and `pre-commit:` scripts are intended to be runnable via `npx npm-run-all ci:*`, `npx npm-run-all pre-commit:*`.

### Deprecated

These are provided for backwards compatibility with CD pipelines as set up by Cloud Services, as well as to support reverts to older versions.

- `serve`: same as `frontend`;
- `build`: same as `frontend:build`.

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
  "cssPreprocessor": "postcss"
}
```

For more information on configuring Vue CLI-based projects, see the [Vue CLI Configuration Reference](https://cli.vuejs.org/config/).

## Config Files

These files configure various tools used in MOVE:

- `.editorconfig`: enforces simple code conventions for all VSCode users;
- `.eslintrc.js`: ESLint rules for style-checking JavaScript;
- `.nvmrc`: target version of node.js;
- `.pylintrc`: Pylint rules for style-checking Python;
- `.python-version`: target version of Python;
- `appspec.yml`: used in conjunction with `deploy_scripts` for AWS CodeDeploy-managed deployments of MOVE;
- `babel.config.js`: Babel configuration for transpiling JavaScript;
- `bdit-flashcrow.code-workspace`: VSCode workspace configuration;
- `jest.config.js`: Jest configuration for unit, database, and REST API tests;
- `LICENSE`: open-source license that MOVE is released under;
- `package.json`: `npm` package configuration and dependencies;
- `postcss.config.js`: PostCSS configuration for preprocessing CSS;
- `requirements.txt`: Python dependencies;
- `vue.config.js`: Vue project configuration, including webpack configuration for `webpack-dev-server` in development.
