#!/bin/bash
CONFIG="
HOME            = /var/lib/cert
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

openssl genrsa -out wild.key 4096

openssl req -x509 -new -nodes -key wild.key \
            -config <(echo "$CONFIG") -days 365 \
            -out wild.crt
