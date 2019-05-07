# bdit_flashcrow

Flashcrow is a data platform for viewing, requesting, and analyzing collision and count data at the City of Toronto.

This repository contains a web interface and application server for interacting with this data.  It also contains automation scripts for fetching and cleaning relevant datasets, including:

- CRASH collision data;
- FLOW counts;
- other types of counts not previously captured in FLOW;
- GCC centreline data.

# Developer Guide

New to Flashcrow development?  You're in the right place!  This guide walks you through the process of setting up your Flashcrow development environment at the City of Toronto.

## Access and Permissions

### Computer and Network Access

Before you do anything else, you will need a City of Toronto-issued desktop or notebook with access to the internal City network.  Onsite Ethernet access should always work.  For notebooks, it is recommended that you also install the certificates necessary to access COT-STAFF and the BIG-IP VPN; these will allow you to access the internal City network from any wifi access point.

To test that you have internal City network access, visit [InsideTO](http://insideto.toronto.ca/index.htm) in your browser.

### Elevated Access

Next, you'll need an Active Directory Elevated Rights Account.  Complete the "Elevated Account and Local Administrative Rights Request Form" on the [IT Forms Portal](http://insideto.toronto.ca/itweb/forms/index.html), and send it to your manager for approval.  This process can take up to one week, so *do it early!*

### Symlink Permission

Next, you'll need to give yourself permission to create symlinks.  By default, only administrative users have this permission; however, you can complete steps 3, 4, 5, and 6a from your Elevated Rights Account as described [here](https://developer.amazon.com/docs/fire-app-builder/configure-windows-symlinks-no-admin-priv.html#convert-to-either-symlinks-or-hard-links) to give your normal user this permission.  Once you have completed those steps, log out and log back in again as your normal user.

You can verify whether you have symlink permission by, well, trying to create one:

```
cd ~
mkdir foo
echo "test" > foo\bar.txt
cmd /c mklink foo\baz.txt foo\bar.txt
```

### Git Repository Access

The Flashcrow repository is hosted on Github, under the [City of Toronto organization](https://github.com/orgs/CityofToronto).  To get permission to access it, you'll need to be a member of the [BigDataInnovationTeam team](https://github.com/orgs/CityofToronto/teams/bigdatainnovationteam).  The current point of contact here is [Raphael Dumas](mailto:Raphael.Dumas@toronto.ca).

### Communications Tools

We use [Slack](https://slack.com/) for instant messaging in our team.  You will need to join the `bditto.slack.com` workspace.  The current point of contact here is [Raphael Dumas](mailto:Raphael.Dumas@toronto.ca).

We use [Notion](https://www.notion.so) as a team wiki and task tracker.  You will need to join the `BDITTO` workspace.  The current point of contact here is [Andrew Konoff](mailto:Andrew.Konoff@toronto.ca).

In the near future, we may add Google Drive access for all team members.

Speak to other team members for a more detailed explanation of how to navigate these workspaces - there's a lot there!  Most importantly: Notion is used for slightly more high-level planning and lab notes, but for actionable development tasks you're better off looking at [Issues](https://github.com/CityofToronto/bdit_flashcrow/issues).

### IDE

It is highly recommended that you use [Visual Studio Code](https://code.visualstudio.com/).  The Flashcrow repo comes with a Visual Studio Code workspace configuration, and the rest of the team can help you set up extensions to integrate syntax highlighting and linting.

## Installation

Now on to the fun part: installing the application itself!  There are a few broad steps here:

- clone the Flashcrow repo;
- set up Flashcrow config files;
- install the Flashcrow development VM using [Vagrant](https://www.vagrantup.com/);
- run!

The remainder of this guide will assume you're developing on a Windows machine, which is the default OS installed for City of Toronto users.  That said, many of these steps are OS-agnostic!

### Install Dependencies

We recommend installing packages through [Scoop](https://scoop.sh/).  Open a PowerShell window and:

```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
scoop config proxy proxy.toronto.ca:8080
.\scripts\dev\scoop-requirements.ps1
```

This will install `git`, as well as several other packages that are useful in Flashcrow development.

### Clone the Flashcrow Repo

```powershell
git config --global http.proxy http://proxy.toronto.ca:8080
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```

### Set up Flashcrow config files

Our application config files are left out of source control to avoid exposing secrets (e.g. session cookie keys, database credentials, etc.).

First, create a file at `lib/config.js`, and generate your own passwords as needed.  A minimal config file is as follows:

```js
const path = require('path');
const vueConfig = require('../vue.config');

const DEV = 'development';
const { NODE_ENV } = process.env;
const ENV = NODE_ENV || DEV;

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
  ENV,
  PUBLIC_PATH: vueConfig.publicPath,
};

module.exports = config;
```

This configuration will not work in production, but for development it's fine.  To set up a working production configuration, talk to [Evan Savage](mailto:Evan.Savage@toronto.ca).

Next, take your database password `dbpassword` from above and create a file at `scripts/dev/provision.conf.yml` as follows:

```yaml
pg_password: "{dbpassword from above}"
proxy_user: "{your City of Toronto username}"
proxy_pass: "{your City of Toronto password}"
```

### Install Flashcrow development VM

 Install [Virtual Box](https://www.virtualbox.org/) if your machine does not already have it. Flashcrow provides a configuration based off the [Amazon Linux 2 VirtualBox image](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2-virtual-machine.html#amazon-linux-2-virtual-machine-download). This allows developers on any operating system to develop and test in an environment that closely mirrors our production environment. This image will be downloaded by `vagrant` by scripts that are in the flashcrow repository in the next set of instructions.

We already installed Vagrant above using `scoop-dependencies.ps1`, but we'll need a plugin:

```powershell
cd scripts\dev
vagrant plugin install vagrant-proxyconf
```

Now we can simply start up the Vagrant box:

```powershell
vagrant up
```

That's it!  This should install and run a working development environment.

### Run!

To run Flashcrow, you need to start two services: `webpack-dev-server` to serve static files, `server.js` for the REST API.  Each of these should be run from within a `vagrant ssh` session, which means that you will need two such sessions.

From the first PowerShell window:

```powershell
vagrant ssh
cd git/bdit_flashcrow
npm run serve
```

From the second PowerShell window:

```powershell
vagrant ssh
cd git/bdit_flashcrow
node ./server.js
```

Once both are running, open [https://localhost:8080/flashcrow](https://localhost:8080/flashcrow) in your browser.

## Development

Congratulations!  You've installed Flashcrow, and you're ready to go.  Now what?  This part of the guide will introduce you to some of our development practices.

### Editing

We use Visual Studio Code where possible.  It is highly recommended that you also use Visual Studio Code; with a small team, we have *very* low bandwidth to support alternate IDEs.

Our `Vagrantfile` syncs the `bdit_flashcrow` repository root on the host machine to `~/git/bdit_flashcrow` within the guest VM.  We edit files from the host machine, but run the application and all `git` commands within the guest VM.

### Git Workflow

We use a slightly modified version of the [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

Let's say you've been assigned one of our beautiful [Issues](https://github.com/CityofToronto/bdit_flashcrow/issues) - let's say it's a (hypothetical) issue #42 about reducing bundle size.  First, create a *feature branch* from within `~/git/bdit_flashcrow` on the guest VM:

```bash
git checkout -b gh42-reduce-bundle-size master
```

Branch names take the form `gh{id}-{description}`.  You start working, commit changes into your branch, and are always diligent in writing out concise but descriptive commit messages.

As you work, you run into some unexpected problems.  Don't worry!  The unexpected is expected; what's important is that you're *transparent* about challenges faced.  Document challenges, questions, etc. in the issue itself, and tag people as needed to get feedback.

OK.  You've worked on your shiny change, and you think it's ready.  Create a [pull request](https://github.com/CityofToronto/bdit_flashcrow/pulls) to merge your feature branch into `master`, and assign a reviewer to look over it.  If the pull request by itself closes the issue, include (e.g.) "Closes #42" in the pull request description - Github has a [special feature](https://help.github.com/en/articles/closing-issues-using-keywords) that can auto-close issues when pull requests containing text like that are merged.

It goes through review, you change things if necessary, and the reviewer merges.  At this point, you can:

```bash
git checkout master
git fetch
git merge origin/master
git branch -d gh42-reduce-bundle-size
```

in your guest VM.  Congratulations!  Your feature is ready for release.

Releases are cut from `master` and tagged accordingly.  We do not currently have a release tag / branch setup - this is primarily to simplify tooling and workflow, given our limited resources.

### Code Style

All code style is managed using linters: programs that automatically enforce style guides.  If you're using Visual Studio Code, we can help you integrate those with the IDE.  These linters are also run as part of the `pre-commit` hook.

Do *NOT* use `--no-verify` to bypass this hook unless you have a *really* good reason!  These hooks are our first line of defense against broken production builds.

### Testing

See "npm scripts" below, but essentially: unit tests are run as part of `pre-commit`.  We have separate integration / end-to-end tests that exercise the database access layer, REST API, and application frontend.

As Flashcrow moves from Alpha to Beta / Live, we will further solidify this plan, and we will be extending it to include security, accessibility, and other application requirements.  We will also be building out a CI / CD pipeline.  More specific issues to come :)

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
