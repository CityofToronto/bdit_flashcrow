#!/bin/bash
#
# provision-user.sh
#
# Installs Python, node, and the Flashcrow application itself during
# provisioning.  This script is intended to be run as a non-root user
# (e.g. vagrant in development, ec2-user in production), and is run
# after provision-admin.sh.
#
# This script should *not* contain any calls to sudo.  If you have commands
# that must be run as root, add them to provision-admin.sh.

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

PG_PASSWORD=

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --pgPassword )
      PG_PASSWORD="$2"
      shift
      ;;
      * )
      echo "Invalid argument $1!"
      exit 1
      ;;
    esac
    shift
  done

  if [[ -z "$PG_PASSWORD" ]]; then
    echo "PostgreSQL password required!"
    exit 1
  fi
}

parse_args "$@"

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

# set proxy
if grep HTTP_PROXY ~/.bashrc; then
  echo "HTTP_PROXY, HTTPS_PROXY already set, skipping..."
else
  echo "setting HTTP_PROXY, HTTPS_PROXY..."
  cat <<'EOF' >> ~/.bashrc
export HTTP_PROXY=http://proxy.toronto.ca:8080
export HTTPS_PROXY=http://proxy.toronto.ca:8080
EOF
fi

# set PATH
if grep pgsql-9.6 ~/.bashrc; then
  echo "PostgreSQL utils already added to PATH, skipping..."
else
  echo "Adding PostgreSQL utils to PATH..."
  cat <<'EOF' >> ~/.bashrc
export PATH="$PATH:/usr/pgsql-9.6/bin"
export PGDATA="$HOME/data/pgsql-9.6"
EOF
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
git config --global core.autocrlf true

# install Python, node dependencies
echo "installing Python, node dependencies..."
cd ~/git/bdit_flashcrow
pip install -r requirements.txt
nvm use
npm config --global set proxy http://proxy.toronto.ca:8080
npm install

# create log directories
echo "creating log directories..."
mkdir -p "$HOME/log/flashcrow"

# set up PostgreSQL
echo "setting up PostgreSQL..."
PGLOG="$HOME/log/pgsql-9.6"
if [ -d "$PGDATA" ]; then
  echo "PostgreSQL database already initialized, skipping..."
else
  echo "initializing PostgreSQL database..."
  mkdir -p "$PGDATA"
  mkdir -p "$PGLOG"
  pg_ctl initdb
fi
pg_ctl status && pg_ctl stop
pg_ctl -l "$PGLOG/pgsql.log" -w start

# install application database
echo "installing application database..."
psql -U vagrant postgres -v pgPassword="'$PG_PASSWORD'" < /vagrant/provision-db-vagrant.sql
echo "Configuring .pgpass..."
  cat <<EOF > ~/.pgpass
#hostname:port:database:username:password
localhost:5432:flashcrow:flashcrow:$PG_PASSWORD
EOF
chmod 0600 ~/.pgpass
cd ~/git/bdit_flashcrow
./scripts/db/db-update.sh --psqlArgs "-U flashcrow"
