#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

set +u
source ~/.bash_profile
set -u

# section: enable_amazon_linux_extras
sudo amazon-linux-extras enable nginx1.12

# section: install_base
sudo yum update -y
sudo yum install -y nginx gcc gcc-c++ git patch openssl-devel zlib-devel readline-devel sqlite-devel bzip2-devel libffi-devel xz-devel jq mailx postgresql postgresql-devel postgresql-contrib

# section: pre_install_flashcrow
## /install_node.sh
if command -v nvm > /dev/null 2>&1; then
  echo "nvm already installed, skipping..."
else
  echo "installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
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
echo "lts/*" > ~/.nvmrc
nvm use
npm install -g forever npm@latest

## /install_python.sh
echo "installing pyenv..."
if [ ! -d ~/.pyenv ]; then
  git clone https://github.com/pyenv/pyenv.git ~/.pyenv
  cat <<'EOF' >> ~/.bashrc
  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  if command -v pyenv 1>/dev/null 2>&1; then
    eval "$(pyenv init -)"
  fi
EOF
fi

# ensure that pyenv shims are available in current shell session
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi

# install correct version of Python
echo "installing Python 3.7.2..."
pyenv install -s 3.7.2
pyenv rehash
pyenv global 3.7.2
pip install --upgrade pip
