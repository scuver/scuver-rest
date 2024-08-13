#!/bin/bash
CONFIG="
[ req ]
default_bits        = 4096
default_md          = sha256
distinguished_name  = req_distinguished_name
prompt              = no
x509_extensions         = v3_req
[ req_distinguished_name ]
countryName=        YourCountryCode
stateOrProvinceName=    YourState
localityName=       YourTown
organizationName=   YourCompany
organizationalUnitName= YourUnit
commonName=     *
[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = email:whatever@localhost

"

#openssl genrsa -out wildcard.local.key 4096
#openssl req -new -key wildcard.local.key -out wildcard.local.csr
openssl x509 -req -in wildcard.local.csr -signkey wildcard.local.key -out wildcard.local.crt -days 365
#openssl req -x509 -new -nodes -key wild.key \
#            -config <(echo "$CONFIG") -days 365 \
#            -out wild.crt
