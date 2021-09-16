#!/bin/bash
#
# provision-vm-vagrant.sh
#
# This script is used by `vagrant` to install the MOVE application in our development VM
# as generated using `packer` (see `provision-vm-packer.sh`).  We perform these steps here
# to reduce the size of the VM image.

sudo systemctl start postgresql
sudo systemctl reload postgresql

PG_USER_PASSWORD=$(openssl rand -base64 32)
touch ~/.pgpass
chmod 0600 ~/.pgpass
echo "localhost:5432:flashcrow:flashcrow:$PG_USER_PASSWORD" >> ~/.pgpass

# shellcheck disable=SC2024
sudo -u postgres psql -v pgPassword="'$PG_USER_PASSWORD'" < ~/flashcrow/scripts/dev/provision-db-vagrant.sql

psql -h localhost -U flashcrow flashcrow < ~/move_etl/scripts/deployment/rds/collision_factors.sql
psql -h localhost -U flashcrow flashcrow < ~/flashcrow/scripts/db/db-update-install.sql

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
# shellcheck disable=SC1090
. ~/.bashrc
nvm install lts/*

# shellcheck disable=SC2164
cd ~/flashcrow
nvm use
npm install
