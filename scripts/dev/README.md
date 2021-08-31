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

## General Assumptions

### Operating System: Windows

This guide assumes you're running Windows 10.  However, MOVE development itself takes place within a Linux-based VM managed by `vagrant`.  If you're using a different operating system:

- install mentioned packages and utilities using the appropriate package manager;
- note that file paths here use `\`, but your operating system may use `/` instead.

We also assume that you'll be using Visual Studio Code with remote development over SSH for development.  (You can use other tools, but our configurations are tailored to this particular IDE setup, and we don't have the resources to manage multiple IDE configurations.)

### You: City of Toronto Developer

For now, these instructions assume you're a developer at the City of Toronto.  We refer to several private config files, which are available on our internal wiki.  Currently we have neither externally-available versions nor any documentation on how to create them!

This may change in the future, but for now we have no immediate plans to fix it.  Given limited team resources, our priority at this time is supporting internal City of Toronto development.

See [City of Toronto Installation Specifics (internal-only)](https://www.notion.so/bditto/City-of-Toronto-Installation-Specifics-27f8e51998e64d4dabc47d8d74a8c4eb) for links to those files, as well as for information on configuring your system to use the corporate proxy.

## Set up System Prerequisites

You will need the following tools and applications to set up the MOVE development VM.

### Command-Line Tools: `git`, `ssh`, `vagrant`

Install [`git`](https://git-scm.com/) and [`vagrant`](https://www.vagrantup.com/downloads) for use on the command line.  For Windows machines, you'll also have to install OpenSSH.

[`scoop`](https://scoop.sh/) can help install these on Windows.  For instance:

```powershell
scoop install git-with-openssh vagrant
```

### VirtualBox

Install [VirtualBox](https://www.virtualbox.org/) as described on the VirtualBox site.

### Visual Studio Code

Install [Visual Studio Code](https://code.visualstudio.com/).

It is highly recommended that you use Visual Studio Code.  The MOVE repo comes with a Visual Studio Code workspace configuration; given limited team resources, we cannot support development in other IDEs / editors.

If you already have Visual Studio Code installed, make sure that you have updated to version 1.35 or later, as that version introduced support for [remote development over SSH](https://code.visualstudio.com/docs/remote/ssh).

## Clone the MOVE repository

Although development takes place within a Vagrant VM, we still clone the repo to the host machine so that we can use the Vagrant configuration from our repository.

To clone the repo:

```powershell
git clone https://github.com/CityofToronto/bdit_flashcrow.git
```

### Start up the VM

You can now set up your development VM:

```powershell
cd scripts\dev
vagrant up
```

That's it!  This should install and run the development VM.  The first time you run this, it will take about 20-30 minutes.

## Set up IDE

This section walks you through the setup of Visual Studio Code.

### Install Extensions

Open Visual Studio Code and install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension pack using the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

The list of extensions we use is documented in `bdit-flashcrow.code-workspace`; Visual Studio Code should automatically recommend these extensions and prompt you to install them.  Note that you only need to install the "Workplace Recommendations".

### SSH Configuration

We use the output of `vagrant ssh-config` to configure an OpenSSH-compatible version of `ssh`, which was installed previously by `scoop`.

```powershell
cd scripts\dev
vagrant ssh-config
```

From here, copy-paste the resulting output into `~\.ssh\config`, and edit the first line to read:

```conf
Host 127.0.0.1
# instead of Host default
```

You can now follow step 2 on the [Remote Development using SSH](https://code.visualstudio.com/docs/remote/ssh) directions, using `vagrant@127.0.0.1` as the host.

### Open MOVE Workspace

At this point, you'll be in a Visual Studio Code window with SSH access to the Vagrant VM, but you won't actually be in the MOVE workspace.

Go to **File > Open Workspace...** and open `~/flashcrow/bdit-flashcrow.code-workspace`.  You should only have to do this the first time you open the MOVE workspace; by default, Visual Studio Code re-opens your most recently open workspace on startup.

## Within the VM...

At this point, you've set up a development environment using the `vagrant` VM!  This next section sets up necessary configuration for MOVE.

### Install private config files

MOVE depends on two private configuration files: `lib/config/private.js` and `ssl/extra-ca-certs.cer`.  Both files are `.gitignore`'d, to prevent them from being committed to source control.

`lib/config/private.js` is used to configure session secrets, while `extra-ca-certs.cer` contains any self-signed SSL certificates that you want to mark as trusted.

See [City of Toronto Installation Specifics (internal-only)](https://www.notion.so/bditto/City-of-Toronto-Installation-Specifics-27f8e51998e64d4dabc47d8d74a8c4eb) for links to those files.

### Development Dataset

MOVE relies on a number of database schemas, views, and tables for traffic count and collision data.

In development, this is managed by a file `flashcrow-dev-data.sql`, which is available to internal City of Toronto developers.  You should do two things with this file:

- place it at `~/flashcrow-dev-data.sql`;
- load it into your development database using `psql -U flashcrow < ~/flashcrow-dev-data.sql`.

See [City of Toronto Installation Specifics (internal-only)](https://www.notion.so/bditto/City-of-Toronto-Installation-Specifics-27f8e51998e64d4dabc47d8d74a8c4eb) for instructions on installing this file.

### Database Updates

One final step before we can run MOVE: we need to update the database schema to the most recent version.  To do that, run our database update script:

```bash
~/flashcrow/scripts/db/db-update.sh --psqlArgs "-h localhost -U flashcrow flashcrow"
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

### Error: unknown encoding name from `vagrant up` on host machine

This can happen if you're running `vagrant` from a Windows host.  To fix it, change the active codepage:

```powershell
chcp 1252
```
