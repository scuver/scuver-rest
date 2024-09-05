#!/bin/bash
CONFIG="
[ req ]
distinguished_name=req_distinguished_name
prompt=no
[ req_distinguished_name ]
countryName=PT
stateOrProvinceName=Oeiras
localityName=Oeiras
organizationName=Tastic
organizationalUnitName=Tastic
commonName=localhost

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = localhost
IP.1 = 127.0.0.1
"

#openssl genrsa -out wildcard.local.key 4096
#openssl req -new -key wildcard.local.key -out wildcard.local.csr
#openssl x509 -req -in wildcard.local.csr -signkey wildcard.local.key -out wildcard.local.crt -days 365
openssl req -x509 -new -nodes -key wildcard.local.key \
            -config <(echo "$CONFIG") -extensions v3_req -days 365 \
            -out wildcard.local.crt
