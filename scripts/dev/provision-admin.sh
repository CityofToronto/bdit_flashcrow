#!/bin/bash
#
# provision-admin.sh
#
# Installs amazon-linux-extras and yum packages during provisioning.  This
# script is intended to be run as root.
#
# This script should *not* contain any calls to sudo.

set -e
set -o nounset

# setup nginx
amazon-linux-extras install nginx1.12
cp /vagrant/flashcrow.conf /etc/nginx/default.d/flashcrow.conf
chkconfig nginx on
service nginx status && service nginx stop
rm -rf /run/nginx.pid
service nginx start

# update existing packages
yum update -y

# install yum packages
yum install -y gcc gcc-c++ make git patch openssl-devel zlib-devel readline-devel sqlite sqlite-devel bzip2 bzip2-devel libffi-devel xz xz-devel
yum install -y jq mailx

# install EPEL repository (see https://aws.amazon.com/blogs/compute/extending-amazon-linux-2-with-epel-and-lets-encrypt/)
curl https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm > /tmp/epel.rpm
yum install -y /tmp/epel.rpm

# install EPEL packages
yum install -y ShellCheck

# install PostgreSQL repository
curl https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-6-x86_64/pgdg-ami201503-96-9.6-2.noarch.rpm > /tmp/pgdg.rpm
yum install -y /tmp/pgdg.rpm

# install PostgreSQL server and utilities
yum install -y postgresql96-server postgresql96-contrib
chown -R vagrant:vagrant /var/run/postgresql
