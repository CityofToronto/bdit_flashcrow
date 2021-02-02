#!/bin/bash
#
# provision-vm-packer.sh
#
# This script is used by `packer` to set up our development VM by installing system dependencies.
# You should not need to call it yourself; rather, it is intended to be edited every time a new
# system dependency is added, so that we can capture this in the development setup process.

set -euo pipefail

sudo yum install -y git
git clone https://github.com/CityofToronto/bdit_flashcrow.git ~/flashcrow

sudo amazon-linux-extras enable epel postgresql9.6
yum clean metadata
sudo yum install -y epel-release postgresql postgresql-contrib postgresql-server

sudo service postgresql initdb
sudo systemctl enable postgresql

mkdir -p ~/postgis
cd ~/postgis
wget https://download.osgeo.org/postgis/source/postgis-2.4.7.tar.gz
tar xzvf postgis-2.4.7.tar.gz
cd postgis-2.4.7
sudo yum install -y gcc gdal-devel geos-devel json-c-devel libxml2-devel postgresql-devel proj-devel proj-nad
./configure --with-raster --with-jsonc=/usr/include
make
sudo make install

mkdir -p ~/cgal
cd ~/cgal
curl -L https://github.com/CGAL/cgal/releases/download/releases%2FCGAL-4.14.3/CGAL-4.14.3.tar.xz > CGAL-4.14.3.tar.xz
tar xvf CGAL-4.14.3.tar.xz
cd CGAL-4.14.3
sudo yum install -y boost-devel cmake3 gcc-c++ gmp-devel mpfr-devel
cmake3 .
make
sudo make install
sudo ldconfig /usr/local/lib64

mkdir -p ~/pgrouting
cd ~/pgrouting
curl -L https://github.com/pgRouting/pgrouting/archive/v2.4.2.tar.gz > v2.4.2.tar.gz
tar xzvf v2.4.2.tar.gz
cd pgrouting-2.4.2
mkdir -p build
cd build
sudo yum install -y perl-Data-Dumper
cmake3 ..
make
sudo make install

cd
rm -rf ~/postgis ~/cgal ~/pgrouting

sudo cp /var/lib/pgsql/data/pg_hba.conf{,.bak}
sudo bash -c "cat > /var/lib/pgsql/data/pg_hba.conf" <<'EOF'
local   all   postgres                peer
local   all   all                     md5
host    all   all       127.0.0.1/32  md5
host    all   all       ::1/128       md5
EOF
