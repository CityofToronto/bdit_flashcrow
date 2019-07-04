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

# update existing packages
yum update -y

# enable json-c support for PostGIS
yum install -y json-c-devel
cd /home/vagrant/postgis/postgis-2.4.7
./configure --with-raster --with-jsonc=/usr/include
make
make install

# for Cypress end-to-end testing
# TODO: we should eventually enable this, but it feels like overkill for now.
# yum install -y alsa-lib-devel GConf2-devel gtk-devel libXScrnSaver-devel libXtst-devel xorg-x11-server-Xvfb

chown vagrant:vagrant -R /var/run/postgresql
