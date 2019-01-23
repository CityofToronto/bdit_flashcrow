#!/bin/bash

set -e
set -o nounset

$PG_DATA_ARCHIVE="flashcrow.tar.gz"

cd $HOME
tar xzvf $PG_DATA_ARCHIVE
find flashcrow -type f
