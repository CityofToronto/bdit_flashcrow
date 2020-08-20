#!/bin/bash
#
# provision-user.sh
#
# Installs Python, node, and the MOVE application itself during
# provisioning.  This script is intended to be run as a non-root user, and is run
# and is run after provision-admin.sh.
#
# This script should *not* contain any calls to sudo.  If you have commands
# that must be run as root, add them to provision-admin.sh.
#
# TODO: DRY with other provision-user scripts

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

# We run .bashrc here to make sure that pyenv, nvm are accessible in the
# sudo shell.
# shellcheck disable=SC1090
. "$HOME/.bashrc"

# install pyenv
if command -v pyenv; then
  echo "pyenv already installed, skipping..."
else
  echo "installing pyenv..."
  git clone https://github.com/pyenv/pyenv.git "$HOME/.pyenv"
  cat <<'EOF' >> "$HOME/.bashrc"
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
. "$HOME/.bashrc"

# install correct version of Python
echo "installing Python 3.7.2..."
pyenv install -s 3.7.2
pyenv rehash
pyenv global 3.7.2
pip install --upgrade pip

# install correct version of node
echo "installing node@lts/*..."
nvm install lts/*
echo "lts/*" > "$HOME/.nvmrc"
npm install -g npm@latest shapefile shellcheck

# configure git
echo "configuring git..."
git config --global core.autocrlf false
git config --global credential.helper cache

# clone git repo
git clone https://github.com/CityofToronto/bdit_flashcrow.git "$HOME/flashcrow"

# install Python, node dependencies
echo "installing Python, node dependencies..."
cd "$HOME/flashcrow"
pip install -r requirements.txt
nvm use
npm install
