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

# install PostgreSQL server and utilities
amazon-linux-extras enable postgresql9.6
yum clean metadata
yum install -y postgresql postgresql-server postgresql-contrib postgresql-devel
chown -R vagrant:vagrant /var/run/postgresql

# as per https://trac.osgeo.org/postgis/wiki/UsersWikiPostgreSQLPostGIS, PostgreSQL 9.6
# requires (and supports!) PostGIS >= 2.2.
#
# as per http://svn.osgeo.org/postgis/tags/2.5.2/NEWS, PostGIS 2.5.0 dropped support for
# GEOS < 3.5, and PostGIS 2.2.0 introduced a PROJ4 >= 4.6 requirement.
#
# EPEL has GEOS 3.4.2, PROJ 4.8.0, and...PostGIS 2.0.7 :(  Given this, we decide to:
#
# - install GEOS / PROJ from EPEL;
# - install PostGIS 2.4.7 from source.
yum install -y gcc make gcc-c++ libtool libxml2-devel geos geos-devel proj proj-devel proj-nad

# see http://en.joysword.com/posts/2015/05/configuring_geo_spatial_stack_on_amazon_linux/
mkdir /home/vagrant/postgis
cd /home/vagrant/postgis
wget https://download.osgeo.org/postgis/source/postgis-2.4.7.tar.gz
tar xzvf postgis-2.4.7.tar.gz
cd postgis-2.4.7
./configure --without-raster
make
make install

find extensions -name "*.control" | xargs -I{} cp {} /usr/share/pgsql/extension
find extensions -name "*.sql" | xargs -I{} cp {} /usr/share/pgsql/extension

yum install -y postgresql postgresql-server postgresql-contrib postgresql-devel
