# MOVE Installation Guide

New to MOVE development?  You're in the right place!  This guide walks you through the process of installing MOVE.

In this guide, you will:

- install system prerequisites;
- clone the MOVE repository;
- on your host machine, add config files;
- start up the MOVE development VM;
- copy config files from your host machine to the VM;
- within the VM, run the application.

Most of MOVE development takes place in a Vagrant VM.  This helps ensure that all developers have the same environment, and that this environment is as similar as possible to those in staging and production.

The remainder of this guide will assume you're developing on a Windows machine, which is the default OS installed for City of Toronto users.  That said, many of these steps are OS-agnostic.

## System Prerequisites

### PowerShell 5+

You should have PowerShell 5 or later installed.  You can follow [Microsoft docs](https://docs.microsoft.com/en-us/skypeforbusiness/set-up-your-computer-for-windows-powershell/download-and-install-windows-powershell-5-1) for details on setting that up.

### Scoop

We recommend installing packages through [Scoop](https://scoop.sh/).  Open a PowerShell window and:

```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
iex (new-object net.webclient).downloadstring('https://get.scoop.sh')
scoop config proxy currentuser:proxy.toronto.ca:8080
```

### Git

Now we'll install Git using Scoop, and set up the proxy:
```powershell
scoop install git
git config --global http.proxy http://proxy.toronto.ca:8080
```

### Clone the MOVE Repository

Although development takes place within a Vagrant VM, you'll still need the Vagrant configuration from our repository.  You can install that once you clone the repo:

```powershell
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```
That's when a window will pop up and ask you what credential manager you want to use. Select `manager`, and tell it to remember that setting. Then enter your GitHub credentials.

### Install the rest of the Scoop requirements

Now that we've got Scoop installed, and we've got MOVE cloned, we can read the Scoop requirements and install them:

```powershell
cd bdit_flashcrow
.\scripts\dev\scoop-requirements.ps1
```

If you run into a `Out-File : Could not find a part of the path 'C:\Users\akonoff\AppData\Roaming\pip\pip.ini'` error, simply create the pip folder:
```powershell
New-Item -Path $env:APPDATA -Name "pip" -ItemType "directory"
```
Now you should be ready to rock!

### VirtualBox and Vagrant

Install [VirtualBox](https://www.virtualbox.org/) if your machine does not already have it.

We already installed Vagrant above using `scoop-dependencies.ps1`, but we'll need a plugin to allow us to use it with a proxy, and, hilariously, we'll first have to configure Vagrant to use our proxy to download the proxy plugin:

```powershell
cd scripts\dev
$env:http_proxy="http://proxy.toronto.ca:8080" 
vagrant plugin install vagrant-proxyconf
```


## Set up MOVE config files on Host Machine

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

## Start up the VM

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

## Copy configs to VM

You will need to `scp` your config files from your host machine to the VM:

```powershell
scp lib\config.js vagrant@127.0.0.1:git/bdit_flashcrow/lib/config.js
scp scripts\dev\provision.conf.yml vagrant@127.0.0.1:git/bdit_flashcrow/scripts/dev/provision.conf.yml
```

Again: these files should be `.gitignore`'d.  Double-check that you've named them properly by verifying that they do not show up as untracked in `git status`, and *NEVER* commit these files into the repo!

## Set up IDE

It is highly recommended that you use [Visual Studio Code](https://code.visualstudio.com/).  The MOVE repo comes with a Visual Studio Code workspace configuration; to work in other editors, you will have to roll your own configuration.

In particular, make sure that you have Visual Studio Code version 1.35 or later, as that version introduced support for [remote development over SSH](https://code.visualstudio.com/docs/remote/ssh).

The rest of this section will assume that you're installing Visual Studio Code.

### Install Visual Studio Code

If you already have Visual Studio Code, use your Elevated Access User to update to the latest version.

Otherwise, you can download the installer from the [Visual Studio Code website](https://code.visualstudio.com/).  Download and install it as your Elevated Access User, and make sure you're installing it system-wide (for all users).

Once that's installed, log back in as your normal user.  Open Visual Studio Code and install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension pack using the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

The list of extensions we use is documented in `bdit_flashcrow.code-workspace` - in the future, we'll figure out how to configure Visual Studio Code to automatically install and update those extensions.  For now, work with an existing developer to install these, or install them from the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery) if you're already familiar with that process.

### SSH Configuration

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

### Open MOVE Workspace

At this point, you'll be in a Visual Studio Code window with SSH access to the Vagrant VM, but you won't actually be in the MOVE workspace.

Go to **File > Open Workspace...** and open `git/bdit_flashcrow/bdit_flashcrow.code-workspace`.  You should only have to do this the first time you open the MOVE workspace; by default, Visual Studio Code re-opens your most recently open workspace on startup.

## Run!

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

## Celebrate!

Congratulations!  Head back to the [MOVE Developer Handbook](https://www.notion.so/bditto/MOVE-Developer-Handbook-182de05ad8a94888b52ccc68093a497a#8da00ef06ab744bbafa1ca2a5b29ff6f) to continue your onboarding.

## Troubleshooting

If you encounter issues installing MOVE, document the problem and solution / workaround here.  If you haven't found a solution to your problem, reach out on Slack or submit a bug report.
