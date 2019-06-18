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

GH_USER=
GH_PASSWORD=
PG_PASSWORD=

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --ghUser )
      GH_USER="$2"
      shift
      ;;
      --ghPassword )
      GH_PASSWORD="$2"
      shift
      ;;
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

  if [[ -z "$GH_USER" ]]; then
    echo "Github username required!"
    exit 1
  fi
  if [[ -z "$GH_PASSWORD" ]]; then
    echo "Github password required!"
    exit 1
  fi
  if [[ -z "$PG_PASSWORD" ]]; then
    echo "PostgreSQL password required!"
    exit 1
  fi
}

parse_args "$@"

# clone git repository
mkdir -p "$HOME/git"
git clone "https://${GH_USER}:${GH_PASSWORD}@github.com/CityofToronto/bdit_flashcrow.git" "$HOME/git/bdit_flashcrow"

# install Python, node dependencies
echo "installing Python, node dependencies..."
cd "$HOME/git/bdit_flashcrow"
pip install -r requirements.txt
nvm use
npm config --global set proxy http://proxy.toronto.ca:8080
npm install

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
