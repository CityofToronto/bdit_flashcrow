# Web Stack Deployment Guide

This guide is **deprecated**.  We previously managed deployments via this process, but have moved to an AWS CodeCommit / CodeDeploy-backed process.  Some of the scripts in this folder are used by the new process, while others have had bits and pieces borrowed for various machine images and deployment configurations.

## Accessing the Web Stack

You will first need the `flashcrow-dev-key.pem` file, as provided by Cloud Services.  The rest of this guide assumes you have that file at `~\ssh\flashcrow-dev-key.pem`.

```powershell
ssh -i ~\ssh\flashcrow-dev-key.pem ec2-user@10.160.7.249
```

## Provisioning

```bash
cd flashcrow
./scripts/deployment/web/provision-web-ec2.sh
```

## Deployment

```bash
cd flashcrow
./scripts/deployment/web/deploy-web-ec2.sh
```
