# MOVE Developer Guide

New to MOVE development?  You're in the right place!  This guide walks you through the process of setting up your MOVE development environment at the City of Toronto.

## Access and Permissions

To get started with MOVE development at the City of Toronto, you'll need the right hardware, permissions, and approvals.  This may seem like a daunting process; don't worry!  From experience, all of this takes at most 1 week end-to-end, and several people on the Big Data Innovation Team can help you sort through any confusing steps.

### Computer and Network Access

Before you do anything else, you will need a City of Toronto-issued desktop or notebook with access to the internal City network.  Onsite Ethernet access should always work.

To test that you have internal City network access, visit [InsideTO](http://insideto.toronto.ca/index.htm) in your browser.

For notebooks, it is recommended that you also install the certificates necessary to access COT-STAFF and the BIG-IP VPN; these will allow you to access the internal City network from any wifi access point.  You can do this by running `gpupdate` from a Command Prompt:

```cmd
gpupdate /Target:user
```

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

The MOVE repository is hosted on Github, under the [City of Toronto organization](https://github.com/orgs/CityofToronto).  To get permission to access it, you'll need to be a member of the [BigDataInnovationTeam team](https://github.com/orgs/CityofToronto/teams/bigdatainnovationteam).  The current point of contact here is [Raphael Dumas](mailto:Raphael.Dumas@toronto.ca).

### Communications Tools

We use [Slack](https://slack.com/) for instant messaging in our team.  You will need to join the `bditto.slack.com` workspace.  The current point of contact here is [Raphael Dumas](mailto:Raphael.Dumas@toronto.ca).

We use [Notion](https://www.notion.so) as a team wiki and task tracker.  You will need to join the `BDITTO` workspace.  The current point of contact here is [Andrew Konoff](mailto:Andrew.Konoff@toronto.ca).

In the future, we may add Google Drive access for all team members.

Speak to other team members for a more detailed explanation of how to navigate these workspaces - there's a lot there!  Most importantly: Notion is used for slightly more high-level planning and lab notes, but for actionable development tasks you're better off looking at [Issues](https://github.com/CityofToronto/bdit_flashcrow/issues).

## Install MOVE

In this section, you will:

- install system prerequisites;
- clone the MOVE repository;
- on your host machine, add config files;
- start up the MOVE development VM;
- copy config files from your host machine to the VM;
- within the VM, run the application.

Most of MOVE development takes place in a Vagrant VM.  This helps ensure that all developers have the same environment, and that this environment is as similar as possible to those in staging and production.

The remainder of this guide will assume you're developing on a Windows machine, which is the default OS installed for City of Toronto users.  That said, many of these steps are OS-agnostic, with comparable packages for Mac OS X and Linux systems.

### System Prerequisites

#### PowerShell 5+

You should have PowerShell 5 or later installed.  You can follow [Microsoft docs](https://docs.microsoft.com/en-us/skypeforbusiness/set-up-your-computer-for-windows-powershell/download-and-install-windows-powershell-5-1) for details on setting that up.

#### Scoop

We recommend installing packages through [Scoop](https://scoop.sh/).  Open a PowerShell window and:

```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
scoop config proxy proxy.toronto.ca:8080
.\scripts\dev\scoop-requirements.ps1
```

#### VirtualBox and Vagrant

Install [VirtualBox](https://www.virtualbox.org/) if your machine does not already have it.

We already installed Vagrant above using `scoop-dependencies.ps1`, but we'll need a plugin:

```powershell
cd scripts\dev
vagrant plugin install vagrant-proxyconf
```

### Clone the MOVE Repository

Although development takes place within a Vagrant VM, you'll still need the Vagrant configuration from our repository.  You can install that with:

```powershell
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```
### Set up MOVE config files on Host Machine

Our application config files are left out of source control to avoid exposing secrets (e.g. session cookie keys, database credentials, etc.).

First, create a file at `lib\config.js`, and generate your own passwords as needed.  A minimal config file is as follows:

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

Next, take your database password `dbpassword` from above and create a file at `scripts\dev\provision.conf.yml` as follows:

```yaml
gh_user: "{your Github username}"
gh_password: "{your Github password}"
pg_password: "{dbpassword from above}"
proxy_user: "{your City of Toronto username}"
proxy_pass: "{your City of Toronto password}"
```

These files should be `.gitignore`'d.  Double-check that you've named them properly by verifying that they do not show up as untracked in `git status`, and *NEVER* commit these files into the repo!

### Start up the VM

MOVE provides a private base box image at `cot-move/cot-move-dev` on Vagrant Cloud, based off the [Amazon Linux 2 VirtualBox image](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2-virtual-machine.html#amazon-linux-2-virtual-machine-download).  This image will be downloaded by `vagrant`.

If you have never set up MOVE before, you will first need to log in to Vagrant Cloud:

```powershell
cd scripts\dev
vagrant login

# enter username and password as provided by lead dev
```

This will allow you to install the private base box image, which you can then start up using:

```powershell
vagrant up
```

That's it!  This should install and run a working development environment.  The first time you run this, it will take about 20-30 minutes.

### Copy configs to VM

You will need to `scp` your config files from your host machine to the VM:

```powershell
scp lib\config.js vagrant@127.0.0.1:git/bdit_flashcrow/lib/config.js
scp scripts\dev\provision.conf.yml vagrant@127.0.0.1:git/bdit_flashcrow/scripts/dev/provision.conf.yml
```

Again: these files should be `.gitignore`'d.  Double-check that you've named them properly by verifying that they do not show up as untracked in `git status`, and *NEVER* commit these files into the repo!

### Set up IDE

It is highly recommended that you use [Visual Studio Code](https://code.visualstudio.com/).  The MOVE repo comes with a Visual Studio Code workspace configuration; to work in other editors, you will have to roll your own configuration.

In particular, make sure that you have Visual Studio Code version 1.35 or later, as that version introduced support for [remote development over SSH](https://code.visualstudio.com/docs/remote/ssh).

The rest of this section will assume that you're installing Visual Studio Code.

#### Install Visual Studio Code

If you already have Visual Studio Code, use your Elevated Access User to update to the latest version.

Otherwise, you can download the installer from the [Visual Studio Code website](https://code.visualstudio.com/).  Download and install it as your Elevated Access User, and make sure you're installing it system-wide (for all users).

Once that's installed, log back in as your normal user.  Open Visual Studio Code and install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension pack using the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

The list of extensions we use is documented in `bdit_flashcrow.code-workspace` - in the future, we'll figure out how to configure Visual Studio Code to automatically install and update those extensions.  For now, work with an existing developer to install these, or install them from the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery) if you're already familiar with that process.

#### SSH Configuration

We use the output of `vagrant ssh-config` to configure an OpenSSH-compatible version of `ssh`, which was installed previously by `scoop`.

```powershell
cd scripts\dev
vagrant ssh-config | Out-File -Encoding utf8 ~\.ssh\config
```

From here, edit the first line of `~\.ssh\config` to read:

```conf
Host 127.0.0.1
# instead of Host default
```

You can now follow step 2 on the [Remote Development using SSH](https://code.visualstudio.com/docs/remote/ssh) directions, using `vagrant@127.0.0.1` as the host.

#### Open MOVE Workspace

At this point, you'll be in a Visual Studio Code window with SSH access to the Vagrant VM, but you won't actually be in the MOVE workspace.

Go to **File > Open Workspace...** and open `git/bdit_flashcrow/bdit_flashcrow.code-workspace`.  You should only have to do this the first time you open the MOVE workspace; by default, Visual Studio Code re-opens your most recently open workspace on startup.

### Run!

To run Flashcrow, you need to start two services: `webpack-dev-server` to serve static files, `server.js` for the REST API.  With the MOVE workspace open in Visual Studio Code, you can run each from a separate terminal.

From the first terminal:

```bash
# runs webpack-dev-server
npm run frontend
```

From the second terminal:

```bash
# runs server.js
npm run backend
```

Once both are running, open [https://localhost:8080/flashcrow](https://localhost:8080/flashcrow) in your browser.

## Development

Congratulations!  You've installed Flashcrow, and you're ready to go.  Now what?  This part of the guide will introduce you to some of our development practices.

### Editing

We use Visual Studio Code.  It is highly recommended that you also use Visual Studio Code; with a small team, we have *very* low bandwidth to support alternate IDEs.

Our `Vagrantfile` clones the `bdit_flashcrow` repository root into `~/git/bdit_flashcrow` within the Vagrant VM.  We *always* edit files on the Vagrant VM from Remote Development in Visual Studio Code, *not* on the host machines.  We also run all `git` commands from Remote Development.

### Git Workflow

We use a slightly modified version of the [Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow).

Let's say you've been assigned one of our beautiful [Issues](https://github.com/CityofToronto/bdit_flashcrow/issues) - let's say it's a (hypothetical) issue #42 about reducing bundle size.  First, create a *feature branch* from within `~/git/bdit_flashcrow` on the guest VM:

```powershell
cd scripts\dev
vagrant ssh
```

```bash
cd git/bdit_flashcrow
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

Do *NOT* use `--no-verify` to bypass this hook unless you have a *really* good reason!  These hooks are our first line of defense against broken builds.

### Testing

See "npm scripts" below, but essentially: unit tests are run as part of `pre-commit`.  We have separate integration / end-to-end tests that exercise the database access layer, REST API, and application frontend.

As Flashcrow moves from Alpha to Beta / Live, we will further solidify this plan, and we will be extending it to include security, accessibility, and other application requirements.  We will also be building out a CI / CD pipeline.  More specific issues to come :)
