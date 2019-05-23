#!/bin/bash
#
# provision-user.sh
#
# Installs Python, node, and the Flashcrow application itself during
# provisioning.  This script is intended to be run as a non-root user, and is run
# and is run after provision-admin.sh.
#
# This script should *not* contain any calls to sudo.  If you have commands
# that must be run as root, add them to provision-admin.sh.
#
# TODO: DRY with scripts/dev/provision-user.sh

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

# We run .bashrc here to make sure that pyenv, nvm are accessible in the
# sudo shell.
# shellcheck disable=SC1090
. ~/.bashrc

# install pyenv
if command -v pyenv; then
  echo "pyenv already installed, skipping..."
else
  echo "installing pyenv..."
  git clone https://github.com/pyenv/pyenv.git ~/.pyenv
  cat <<'EOF' >> ~/.bashrc
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi
EOF
fi

# install nvm
if command -v nvm > /dev/null 2>&1; then
  echo "nvm already installed, skipping..."
else
  echo "installing nvm..."
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
fi

# ensure that pyenv, nvm shims are available in current shell session
# shellcheck disable=SC1090
. ~/.bashrc

# install correct version of Python
echo "installing Python 3.7.2..."
pyenv install -s 3.7.2
pyenv rehash
pyenv global 3.7.2
pip install --upgrade pip

# install correct version of node
echo "installing node@lts/*..."
nvm install lts/*
echo "lts/*" > ~/.nvmrc
npm install -g npm@latest shellcheck

# configure git
echo "configuring git..."
git config --global core.autocrlf false
git config --global credential.helper cache

# install Python, node dependencies
echo "installing Python, node dependencies..."
cd ~/git/bdit_flashcrow
pip install -r requirements.txt
nvm use
npm install

# create log directories
echo "creating log directories..."
mkdir -p "$HOME/log/flashcrow"

# install application database
echo "installing application database..."
cd ~/git/bdit_flashcrow
psql -U flashcrow_dba -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow < ./scripts/deployment/web/provision-db-ec2.sql
./scripts/db/db-update.sh --psqlArgs "-U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow"
