#!/bin/bash
# Copyright 2017-2018 Frank Breedijk
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------
# This program creates users from the command line, usefull if you have not set
# up any users in the web gui, or if you are writing Seccubus and the GUI does
# not exist yet ;)
# ------------------------------------------------------------------------------
#
set -x
set -e

echo "Seccubus frontend setup"
echo "-----------------------"

TZ=${TZ:-'UTC'}
TLS=${TLS:-'yes'}

# Fix timezone
if [[ "$TZ" == "UTC" ]] ; then
    echo "Timezone set to 'UTC'"
else
    if [[ -e "/usr/share/zoneinfo/$TZ" ]]; then
        rm -f /etc/localtime
        ln -s /usr/share/zoneinfo/$TZ /etc/localtime
        echo "Timezoen set to '$TZ'"
    else
        echo "*** Timezone '$TZ' does not exist, sticking to UTC"
    fi
fi
echo

# Handle TLS certificates
if [[ "$TLS" == "yes" ]]; then
    echo "Creating TLS certificate"
    echo
    if [[ -e "/opt/seccubus/data/seccubus.pem" && -e "/opt/seccubus/data/seccubus.key" ]]; then
        TLSCERT="/opt/seccubus/data/seccubus.pem"
        TLSKEY="/opt/seccubus/data/seccubus.key"
    else
        if [[ ! -z "$TLSCERT" && ! -z "$TLSKEY" ]]; then
            echo "$TLSCERT" > "/opt/seccubus/data/seccubus.pem"
            echo "$TLSKEY" > "/opt/seccubus/data/seccubus.key"
        else
            openssl genrsa -des3 -passout pass:x12345 -out /opt/seccubus/data/seccubus.pass.key 4096
            openssl rsa -passin pass:x12345 -in /opt/seccubus/data/seccubus.pass.key -out /opt/seccubus/data/seccubus.key
            rm /opt/seccubus/data/seccubus.pass.key
            openssl req -new -key /opt/seccubus/data/seccubus.key -out /opt/seccubus/data/seccubus.csr \
                -subj "/CN=Seccubus"
            openssl x509 -req -days 365 -in /opt/seccubus/data/seccubus.csr \
                -signkey /opt/seccubus/data/seccubus.key -out /opt/seccubus/data/seccubus.pem
            rm /opt/seccubus/data/seccubus.csr
        fi
        TLSCERT="/opt/seccubus/data/seccubus.pem"
        TLSKEY="/opt/seccubus/data/seccubus.key"
    fi
    PORT=443
    echo
else
    TLSCERT=""
    TLSKEY=""
    PORT=80
fi

# Frontend server, just serve HTML via nginx
if [[ -z $APIURL ]]; then
    echo "\$APIURL is empty, this won't work"
    exit
else
    echo "Setting up nginx"
    echo
    # Sanitize urls
    [[ ! "$APIURL" = */ ]] && APIURL="$APIURL/"
    [[ ! -z "$BASEURI" ]] && [[ ! "$BASEURI" = /* ]] && BASEURI="/$BASEURI"

    rm /etc/nginx/conf.d/*
    if [[ "$TLS" == "yes" ]]; then
        cp /docker/front-tls.conf /etc/nginx/conf.d/seccubus.conf
    else
        cp /docker/front.conf /etc/nginx/conf.d/seccubus.conf
    fi
    # Patch BASEURI
    sed -i.bak "s#%BASEURI%#$BASEURI#g" /etc/nginx/conf.d/seccubus.conf
    mv /etc/nginx/conf.d/*.bak /tmp

    sed -i.bak "s#baseUrl(){return\"/api/\"}#baseUrl(){return\"$APIURL\"}#" /opt/seccubus/public/seccubus/production.js

    mkdir -p /run/nginx
    nginx
    echo "nginx is listening on port $PORT"
fi

# syslog
touch /var/log/messages
/sbin/syslogd

# Return to home
cd

echo
echo "*** Setup DONE ***"
echo

# Execute commands if needed
case $1 in
"")
    touch /var/log/nginx/error.log
    tail -f /var/log/nginx/*
    ;;
"help")
    echo
    echo
    cat /README.md
    ;;
*)
    exec "$@"
    ;;
esac
