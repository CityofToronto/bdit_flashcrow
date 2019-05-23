# Web Stack Deployment Guide

## Accessing the Web Stack

You will first need the `flashcrow-dev-key.pem` file, as provided by Cloud Services.  The rest of this guide assumes you have that file at `~\ssh\flashcrow-dev-key.pem`.

```powershell
ssh -i ~\ssh\flashcrow-dev-key.pem ec2-user@10.160.7.249
```

## Provisioning

```bash
cd git/bdit_flashcrow
./scripts/deployment/web/provision-web-ec2.sh
```

## Deployment

```bash
cd git/bdit_flashcrow
./scripts/deployment/web/deploy-web-ec2.sh
```
