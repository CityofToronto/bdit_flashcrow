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

This guide assumes you're running Windows 10.  However, MOVE development itself takes place within a Linux-based VM managed by `vagrant`.  If you're using a different operating system:

- install mentioned packages and utilities using the appropriate package manager;
- note that file paths here use `\`, but your operating system may use `/` instead.

We also assume that you'll be using Visual Studio Code with remote development over SSH for development.  (You can use other tools, but our configurations are tailored to this particular IDE setup, and we don't have the resources to manage multiple IDE configurations.)

## City of Toronto Developers: Read This!

Developers at the City of Toronto have a few additional steps, as well as some configurations that are specific to the internal City environment.  See [City of Toronto Installation Specifics](https://www.notion.so/bditto/City-of-Toronto-Installation-Specifics-27f8e51998e64d4dabc47d8d74a8c4eb), and refer to that guide throughout this process for further details.

## Set up System Prerequisites

### Command-Line Tools: `git` and `vagrant`

Install [`git`](https://git-scm.com/) and [`vagrant`](https://www.vagrantup.com/downloads) for use on the command line.

[`scoop`](https://scoop.sh/) can help install these on Windows; for other operating systems, use the appropriate package manager.

### VirtualBox

Install [VirtualBox](https://www.virtualbox.org/) as described on the VirtualBox site.

## Clone the MOVE repository

Although development takes place within a Vagrant VM, you'll still need the Vagrant configuration from our repository.  You can install that once you clone the repo:

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

It is highly recommended that you use [Visual Studio Code](https://code.visualstudio.com/).  The MOVE repo comes with a Visual Studio Code workspace configuration; to work in other editors, you will have to roll your own configuration.

If you already have Visual Studio Code installed, make sure that you have updated to version 1.35 or later, as that version introduced support for [remote development over SSH](https://code.visualstudio.com/docs/remote/ssh).

### Install Visual Studio Code

If you already have Visual Studio Code, update it to the latest version.  Otherwise, you can download the installer from the [Visual Studio Code website](https://code.visualstudio.com/) and run it.

Open Visual Studio Code and install the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension pack using the [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

The list of extensions we use is documented in `bdit-flashcrow.code-workspace`; Visual Studio Code should automatically recommend these extensions and prompt you to install them.

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

`lib/config/private.js` is used to configure session secrets.  At the very least, you will require OpenID Connect credentials (in `openId`) and a `session` secret, and you will need these for both a `development` and a `test` environment:

```js
export default {
  development: {
    openId: {
      // OpenID connect credentials
      clientMetadata: {
        client_id:
        token_endpoint_auth_method:
      },
    },
    session: {
      // session secret
      password:
    },
  },
  test: {
    openId: {
      clientMetadata: {
        client_id:
        token_endpoint_auth_method:
      },
    },
    session: {
      password:
    },
  },
};
```

The `session` secret can be anything - e.g. the result of `uuidgen -r`.  The `openId` configuration should refer to an OpenID Connect-based authentication service.  You can use the same configuration for both environments, or you can use different configurations.

`extra-ca-certs.cer` is used in case your `openId` configuration points to an OpenID Connect-based authentication service that uses self-signed SSL certificates.  If this is the case, copy-paste the full certificate chain into this file.  If not, you should still create this file, but can leave it empty.

### Development Dataset

One final piece: MOVE relies on a number of database schemas, views, and tables for traffic count and collision data.

In development, this is managed by a file `flashcrow-dev-data.sql`.  We have a version of this file available for City of Toronto developers, but currently we have neither an externally-available version nor any documentation on how to create one!  It's likely that this will come with efforts scheduled for Q1 / Q2 2021 to improve database documentation.

If you have access to such a file, though, there are two requirements:

- place it at `~/flashcrow-dev-data.sql`;
- load it into your development database using `psql -U flashcrow < ~/flashcrow-dev-data.sql`.

### Additional Steps

For linting bash scripts as part of our pre-commit checks, you'll need to install `ShellCheck`:

```bash
sudo yum install -y ShellCheck
```

You'll also need to manually load the `collision_factors` schema:

```bash
psql -U flashcrow < ~/flashcrow/scripts/test/db/collision_factors.sql
```

Finally, you'll need to run this command so the `pgrouting` function `pgr_astar` works properly in local development:

```bash
sudo ldconfig /usr/local/lib64
```

These steps will be included in future versions of the `vagrant` VM base box and/or provisioning script.

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

To fix this, you can change the active codepage:

```powershell
chcp 1252
```
