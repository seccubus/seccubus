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
set -e

echo "Seccubus setup"
echo "--------------"

export PERL5LIB=/opt/seccubus

DBHOST=${DBHOST:-'not-set'}
DBPORT=${DBPORT:-'3306'}
DBNAME=${DBNAME:-'seccubus'}
DBUSER=${DBUSER:-'seccubus'}
DBPASS=${DBPASS:-'seccubus'}
TLS=${TLS:-'yes'}

# Let's figure out if we have a database...
if [[ "$DBHOST" == "not-set" && "$DBPORT" == "3306" ]]; then
    echo "*** You have not specified a \$DBHOST, but this docker image does not contain a database engine"
    echo
    echo "You must specify an external database server"
    echo
    exit 255
fi

TZ=${TZ:-'UTC'}

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
if [[ "$TLS" == "yes" && "$STACK" != "cron" && "$STACK" != "perl" ]]; then
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


# Configure Seccubus
echo "Configuring Seccubus"
echo
if [[ -z "$SESSION_KEY" ]]; then
    SESSION_KEY=$(cat /opt/seccubus/etc/SESSION_KEY)
fi

cat <<EOF >/opt/seccubus/etc/config.xml
    <seccubus>
        <database>
            <engine>mysql</engine>
            <database>$DBNAME</database>
            <host>$DBHOST</host>
            <port>$DBPORT</port>
            <user>$DBUSER</user>
            <password>$DBPASS</password>
        </database>
        <paths>
            <modules>/opt/seccubus/lib</modules>
            <scanners>/opt/seccubus/scanners</scanners>
            <bindir>/opt/seccubus/bin</bindir>
            <configdir>/opt/seccubus/etc</configdir>
            <dbdir>/opt/seccubus/db</dbdir>
            <logdir>/var/log/seccubus</logdir>
        </paths>
        <smtp>
            <server>$SMTPSERVER</server>
            <from>$SMTPFROM</from>
        </smtp>
        <tickets>
            <url_head>$TICKETURL_HEAD</url_head>
            <url_tail>$TICKETURL_TAIL</url_tail>
        </tickets>
        <auth>
            <http_auth_header>$HTTP_AUTH_HEADER</http_auth_header>
            <sessionkey>$SESSION_KEY</sessionkey>
            <jit_group>$JIT_GROUP</jit_group>
        </auth>
        <http>
            <port>$PORT</port>
            <cert>$TLSCERT</cert>
            <key>$TLSKEY</key>
            <baseurl>$BASEURI</baseurl>
        </http>
    </seccubus>
EOF

if [[ ! -z "$APIURL" ]]; then
    sed -i.bak "s#baseUrl(){return\"/api/\"}#baseUrl(){return\"$APIURL\"}#" /opt/seccubus/public/seccubus/production.js
else
    sed -i.bak "s#baseUrl(){return\"/api/\"}#baseUrl(){return\"..\/api/\"}#" /opt/seccubus/public/seccubus/production.js
fi

echo "Starting hypnotoad"
# We need to start mojolicious
cd /opt/seccubus
PERL5LIB=/opt/seccubus hypnotoad seccubus.pl
echo

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
    tail -f /var/log/seccubus/* /var/log/messages
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
