#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"
openssl req -x509 -days 36500 -config ca.cnf -newkey rsa:4096 -sha256 -nodes -out ca.pem -outform PEM
openssl req -config localhost.cnf -newkey rsa:2048 -sha256 -nodes -out localhost.csr -outform PEM
openssl ca -config ca.cnf -policy signing_policy -extensions signing_req -out localhost.pem -infiles localhost.csr
cat localhost.pem ca.pem > localhost.crt
