#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

set +u
source /home/ec2-user/.bash_profile
set -u

# section: enable_amazon_linux_extras
sudo amazon-linux-extras enable nginx1.12

# section: install_base
sudo yum update -y
sudo yum install -y nginx postgresql postgresql-contrib

# section: pre_install_flashcrow
## /install_node.sh
if command -v nvm > /dev/null 2>&1; then
  echo "nvm already installed, skipping..."
else
  echo "installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
  # ensure that nvm shims are available in current shell session
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
fi

# confirm
echo "$NVM_DIR"

# install correct version of node
echo "installing node@lts/*..."
nvm install lts/*
echo "lts/*" > /home/ec2-user/.nvmrc
nvm use lts/*
npm install -g forever
