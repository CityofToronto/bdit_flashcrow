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
git clone https://github.com/CityofToronto/bdit_move_etl.git ~/move_etl

sudo amazon-linux-extras enable epel postgresql11
yum clean metadata
sudo yum install -y epel-release postgresql postgresql-contrib postgresql-server

sudo service postgresql initdb
sudo systemctl enable postgresql

# LINKER CONFIGURATION

sudo bash -c "cat > /etc/ld.so.conf.d/cot-move-dev-x86_64.conf" <<'EOF'
/usr/local/lib
/usr/local/lib64
EOF
sudo ldconfig

# POSTGIS DEPENDENCIES

sudo yum install -y autoconf automake gcc gcc-c++ json-c-devel libtool libxml2-devel postgresql-devel postgresql-server-devel proj-devel proj-nad protobuf-c-compiler

mkdir -p ~/geos
cd ~/geos
wget http://download.osgeo.org/geos/geos-3.6.2.tar.bz2
tar xvjf geos-3.6.2.tar.bz2
cd geos-3.6.2
env CXX="g++ -std=c++98" ./configure
make
sudo make install
sudo ldconfig

mkdir -p ~/gdal
cd ~/gdal
wget http://download.osgeo.org/gdal/2.1.4/gdal-2.1.4.tar.gz
tar xvzf gdal-2.1.4.tar.gz
cd gdal-2.1.4
./configure \
  --with-geos \
  --with-geotiff=internal \
  --with-hide-internal-symbols \
  --with-libtiff=internal \
  --with-libz=internal \
  --with-threads \
  --without-bsb \
  --without-cfitsio \
  --without-cryptopp \
  --with-curl \
  --without-dwgdirect \
  --without-ecw \
  --without-expat \
  --without-fme \
  --without-freexl \
  --without-gif \
  --without-gif \
  --without-gnm \
  --without-grass \
  --without-grib \
  --without-hdf4 \
  --without-hdf5 \
  --without-idb \
  --without-ingres \
  --without-jasper \
  --without-jp2mrsid \
  --without-jpeg \
  --without-kakadu \
  --without-libgrass \
  --without-libkml \
  --without-libtool \
  --without-mrf \
  --without-mrsid \
  --without-mysql \
  --without-netcdf \
  --without-odbc \
  --without-ogdi \
  --without-openjpeg \
  --without-pcidsk \
  --without-pcraster \
  --with-pcre \
  --without-perl \
  --with-pg \
  --without-php \
  --without-png \
  --without-python \
  --without-qhull \
  --without-sde \
  --without-sqlite3 \
  --without-webp \
  --with-xerces \
  --with-xml2
make
sudo make install
sudo ldconfig

git clone https://github.com/google/protobuf.git ~/protobuf
cd ~/protobuf
./autogen.sh
./configure
make
sudo make install
sudo ldconfig

mkdir -p ~/protobuf-c
cd ~/protobuf-c
wget https://github.com/protobuf-c/protobuf-c/releases/download/v1.4.0/protobuf-c-1.4.0.tar.gz
tar xzvf protobuf-c-1.4.0.tar.gz
cd protobuf-c-1.4.0
env PKG_CONFIG_PATH=/usr/local/lib/pkgconfig ./configure
make
sudo make install
sudo ldconfig

# POSTGIS

mkdir -p ~/postgis
cd ~/postgis
wget https://download.osgeo.org/postgis/source/postgis-2.5.2.tar.gz
tar xzvf postgis-2.5.2.tar.gz
cd postgis-2.5.2
env PKG_CONFIG_PATH=/usr/local/lib/pkgconfig ./configure \
  --with-geosconfig=/usr/local/bin/geos-config \
  --with-jsonc=/usr/include \
  --with-raster
make
sudo make install
sudo ldconfig

# PGROUTING DEPENDENCIES

sudo yum install -y boost-devel cmake3 gmp-devel mpfr-devel perl-Data-Dumper

mkdir -p ~/cgal
cd ~/cgal
wget https://github.com/CGAL/cgal/releases/download/releases%2FCGAL-4.14.3/CGAL-4.14.3.tar.xz
tar xvf CGAL-4.14.3.tar.xz
cd CGAL-4.14.3
cmake3 .
make
sudo make install
sudo ldconfig

# PGROUTING
mkdir -p ~/pgrouting
cd ~/pgrouting
wget https://github.com/pgRouting/pgrouting/archive/v2.6.1.tar.gz
tar xzvf v2.6.1.tar.gz
cd pgrouting-2.6.1
mkdir -p build
cd build
cmake3 ..
make
sudo make install
sudo ldconfig

# OTHER TOOLS / DEPENDENCIES

sudo yum install -y ShellCheck

# CLEANUP

cd
rm -rf ~/cgal ~/gdal ~/geos ~/pgrouting ~/postgis ~/protobuf ~/protobuf-c

# POSTGRES ACCESS
sudo cp /var/lib/pgsql/data/pg_hba.conf{,.bak}
sudo bash -c "cat > /var/lib/pgsql/data/pg_hba.conf" <<'EOF'
local   all   postgres                peer
local   all   all                     md5
host    all   all       127.0.0.1/32  md5
host    all   all       ::1/128       md5
EOF
