#!/bin/bash
#
# provision-admin.sh
#
# Installs amazon-linux-extras and yum packages during provisioning.  This
# script is intended to be run as root.
#
# This script should *not* contain any calls to sudo.
#
# TODO: DRY with other provision-admin scripts

set -e
set -o nounset

cd "$(dirname "$0")"
PROVISION_ENV="$1"

# setup nginx
amazon-linux-extras install nginx1.12
chkconfig nginx on
service nginx status && service nginx stop
rm -rf /run/nginx.pid

# install nginx configs
cp "$PROVISION_ENV/nginx/nginx.conf" /etc/nginx/
cp "$PROVISION_ENV/nginx/default.d/*.conf" /etc/nginx/default.d/
service nginx start

# install yum packages
yum install -y gcc gcc-c++ make git patch openssl-devel zlib-devel readline-devel sqlite sqlite-devel bzip2 bzip2-devel libffi-devel xz xz-devel
yum install -y jq mailx

# install EPEL repository (see https://aws.amazon.com/blogs/compute/extending-amazon-linux-2-with-epel-and-lets-encrypt/)
curl https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm > /tmp/epel.rpm
yum install -y /tmp/epel.rpm

# install EPEL packages
yum install -y ShellCheck

# install PostgreSQL utilities
amazon-linux-extras enable postgresql9.6
yum clean metadata
yum install -y postgresql postgresql-contrib
