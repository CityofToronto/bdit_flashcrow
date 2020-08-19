# MOVE Installation Guide

New to MOVE development?  You're in the right place!  This guide walks you through the process of installing MOVE.

In this guide, you will:

- set up system prerequisites;
- clone the MOVE repository;
- set up the MOVE development VM;
- within the VM:
  - clone the MOVE repository;
  - install private config files;
  - install application dependencies;
  - run the application to verify installation.

Most of MOVE development takes place in a Vagrant VM.  This helps ensure that all developers have the same environment, and that this environment is as similar as possible to those in staging and production.

## City of Toronto Developers: Read This!

Developers at the City of Toronto have a couple of additional steps.  See [City of Toronto Installation Specifics](https://www.notion.so/bditto/City-of-Toronto-Installation-Specifics-27f8e51998e64d4dabc47d8d74a8c4eb), and refer to that guide throughout this process for further details.

## Set up System Prerequisites

### Command-Line Tools: `git` and `vagrant`

Install [`git`](https://git-scm.com/) and [`vagrant`](https://www.vagrantup.com/downloads) for use on the command line.

### VirtualBox

Install [VirtualBox](https://www.virtualbox.org/) as described on the VirtualBox site.

## Clone the MOVE repository

Although development takes place within a Vagrant VM, you'll still need the Vagrant configuration from our repository.  You can install that once you clone the repo:

```powershell
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```

## Set up the MOVE development VM

### Private Configuration

Generate a random database password and create a file at `scripts\dev\provision.conf.yml` as follows:

```yaml
gh_user: "{your Github username}"
gh_password: "{your Github password}"
pg_password: "{database password}"
```

This file should be `.gitignore`'d.  Double-check that you've named them properly by verifying that they do not show up as untracked in `git status`, and *NEVER* commit this files into the repo!

### Vagrant Cloud

MOVE provides a private base box image at `cot-move/cot-move-dev` on Vagrant Cloud, based off the [Amazon Linux 2 VirtualBox image](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2-virtual-machine.html#amazon-linux-2-virtual-machine-download).  This image will be downloaded by `vagrant`.

If you have never set up MOVE before, you will first need to log in to Vagrant Cloud:

```powershell
cd scripts\dev
vagrant login
```

See [Accounts](https://www.notion.so/bditto/Accounts-30b1efa06aef4baaa0468f10b60e69f3) for Vagrant Cloud credentials.

### Start up the VM

This will allow you to install the private base box image, which you can then start up using:

```powershell
cd scripts\dev
vagrant up
```

That's it!  This should install and run the development VM.  The first time you run this, it will take about 20-30 minutes.

## Within the VM...

To access the VM, you can use `vagrant ssh`:

```powershell
cd scripts\dev
vagrant ssh
```

### Clone the MOVE repository (again)

From within the development VM:

```bash
cd git
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```

### Install private config files

See [Accounts :: Web Application Credentials](https://www.notion.so/bditto/Accounts-30b1efa06aef4baaa0468f10b60e69f3#c8ce1f4bab564efb8b23b37c64e679a6) for private config files.  Install these files within the VM as directed there.

If you download these files to your host development machine, you can `scp` them over to the VM, e.g.:

```powershell
scp private.js vagrant@127.0.0.1:git/bdit_flashcrow/lib/config/private.js
```

Again: these files should be `.gitignore`'d.  Double-check that you've named them properly by verifying that they do not show up as untracked in `git status`, and *NEVER* commit these files into the repo!

## Set up IDE

It is highly recommended that you use [Visual Studio Code](https://code.visualstudio.com/).  The MOVE repo comes with a Visual Studio Code workspace configuration; to work in other editors, you will have to roll your own configuration.

If you already have Visual Studio Code installed, make sure that you have updated to version 1.35 or later, as that version introduced support for [remote development over SSH](https://code.visualstudio.com/docs/remote/ssh).

The rest of this guide will assume that you're using Visual Studio Code with remote development over SSH.

### Install Visual Studio Code

If you already have Visual Studio Code, update it to the latest version.  Otherwise, you can download the installer from the [Visual Studio Code website](https://code.visualstudio.com/) and run it.

Open Visual Studio Code and install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension pack using the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

The list of extensions we use is documented in `bdit-flashcrow.code-workspace`; Visual Studio Code should automatically recommend these extensions and prompt you to install them.

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

Go to **File > Open Workspace...** and open `git/bdit_flashcrow/bdit-flashcrow.code-workspace`.  You should only have to do this the first time you open the MOVE workspace; by default, Visual Studio Code re-opens your most recently open workspace on startup.

## Within the VM...

To finish this off, we'll now install application dependencies and run MOVE from our Visual Studio Code workspace.

### Install application dependencies

To install application dependencies:

```bash
nvm install
nvm use
npm install
```

### Run!

To run MOVE, at a minimum you must start the frontend and `web` backend:

- `npm run frontend` to serve static files;
- `npm run backend` for the web application REST API.

With the MOVE workspace open in Visual Studio Code, you can run each from a separate terminal.  Once both are running, open [https://localhost:8080](https://localhost:8080) in your browser.

To access reporting features, you will also need to run `reporter` and `scheduler`:

- `npm run reporter` to serve reports within the web interface;
- `npm run scheduler` to handle bulk report generation and other background tasks.

These can be run in additional separate terminals.

### Celebrate!

Congratulations!  Head back to the [MOVE Developer Handbook](https://www.notion.so/bditto/MOVE-Developer-Handbook-182de05ad8a94888b52ccc68093a497a#8da00ef06ab744bbafa1ca2a5b29ff6f) to continue your onboarding.

## Troubleshooting

If you encounter issues installing MOVE, document the problem and solution / workaround here.  If you haven't found a solution to your problem, reach out on Slack or submit a bug report.
