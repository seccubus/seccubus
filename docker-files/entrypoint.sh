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
set -x

STACK=${STACK:-'full'}
DBHOST=${DBHOST:-'127.0.0.1'}
DBPORT=${DBPORT:-'3306'}
DBNAME=${DBNAME:-'seccubus'}
DBUSER=${DBUSER:-'seccubus'}
DBPASS=${DBPASS:-'seccubus'}
TLS=${TLS:-'yes'}
BUILDSTACK="%BUILDSTACK%"


if [[ "$BUILDSTACK" != "full" ]]; then
    STACK="$BUILDSTACK"
fi

echo "Seccubus setup"
echo "--------------"

export PERL5LIB=/opt/seccubus

if [[ $1 == "scan" ]]; then
    STACK="perl"
    if [[ ! -z "$4" && "$(date '+%a')" != "$4" ]]; then
        echo "Today is $(date '+%a'), not $4"
        exit 0
    fi
fi

if [[ $1 == "help" ]]; then
    echo
    echo
    cat /README-docker.md
    exit 0
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

# Check sanity of parameters
if [[ "$STACK" != "full" && "$STACK" != "front" && "$STACK" != "api" && "$STACK" != "web" && \
    "$STACK" != "perl" && "$STACK" != "cron" ]]; then
    cat <<EOM
\$STACK is currently '$STACK', it should be one of the following
* full - Run the full stack in a single container
* front - Run a web server to serve just the front end HTML, Javascript and related files
* api - Run a web server to serve just the JSON api
* web - Run a web server to serve both the API and front end HTML, javascript etc
* perl - Provide the Perl backend code, but not database or webserver
* cron - Run a crontab scheduler with the perl backend
EOM
    exit 255
fi

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

if [[ "$STACK" == "front" ]] ; then
    # Frontend server, just serve HTML via nginx
    if [[ -z $APIURL ]]; then
        echo "\$STACK is set to '$STACK', but \$APIURL is empty, this won't work"
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

        mkdir -p /run/nginx
        nginx
    fi
else
    # Get rid of the log rotation for NGINX if we are not using it
    rm -f /etc/logrotate.d/nginx
fi

# Set up Mojolicious stack
if [[ "$STACK" == "api" ]] ; then
    # No need to have a public directory in API mode
    rm -rf /opt/seccubus/public
fi

# Set up SSH keys

if [[ "$STACK" != "front" ]] ; then
    echo "Setting up SSH keys"
    echo
    mkdir -p ~seccubus/.ssh
    chmod 700 ~seccubus/.ssh
    echo "$SSHKEY1" > ~seccubus/.ssh/SSHKEY1
    export SSHKEY1=""
    echo "$SSHKEY2" > ~seccubus/.ssh/SSHKEY2
    export SSHKEY2=""
    echo "$SSHKEY3" > ~seccubus/.ssh/SSHKEY3
    export SSHKEY3=""
    echo "$SSHKEY4" > ~seccubus/.ssh/SSHKEY4
    export SSHKEY4=""
    echo "$SSHKEY5" > ~seccubus/.ssh/SSHKEY5
    export SSHKEY5=""
    echo "$SSHKEY6" > ~seccubus/.ssh/SSHKEY6
    export SSHKEY6=""
    echo "$SSHKEY7" > ~seccubus/.ssh/SSHKEY7
    export SSHKEY7=""
    echo "$SSHKEY8" > ~seccubus/.ssh/SSHKEY8
    export SSHKEY8=""
    echo "$SSHKEY9" > ~seccubus/.ssh/SSHKEY9
    export SSHKEY9=""
    chown -R seccubus:seccubus ~seccubus/.ssh
    chmod 600 ~seccubus/.ssh/SSHKEY*
fi

if [[ "$STACK" != "front" ]]; then
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
fi

if [[ "$STACK" == "full" || "$STACK" == "web" || "$STACK" == "front" ]] ; then
    # Patch javascript for baseurl or APIURL
    if [[ ! -z "$APIURL" ]]; then
        sed -i.bak "s#baseUrl(){return\"/api/\"}#baseUrl(){return\"$APIURL\"}#" /opt/seccubus/public/seccubus/production.js
    else
        sed -i.bak "s#baseUrl(){return\"/api/\"}#baseUrl(){return\"..\/api/\"}#" /opt/seccubus/public/seccubus/production.js
    fi
fi

if [[ "$STACK" == "full" || "$STACK" == "api" || "$STACK" == "web" ]] ; then
    echo "Starting hypnotoad"
    # We need to start mojolicious
    cd /opt/seccubus
    PERL5LIB=/opt/seccubus hypnotoad seccubus.pl
    echo
fi

if [[ "$STACK" == "full" ]] ; then
    # Let's figure out if we need a database...
    if [[ "$DBHOST" == "127.0.0.1" && "$DBPORT" == "3306" ]]; then
        echo "Setting up MariaDB"
        echo
        DBDIR="/var/lib/mysql"
        if [[ -e /opt/seccubus/data/db ]]; then
            DBDIR="/opt/seccubus/data/db"
            sed -i.bak "s#/var/lib/mysql#$DBDIR#" /etc/mysql/mariadb.conf.d/50-server.cnf
            if [[ ! -e "$DBDIR/ibdata1" ]]; then
                # Assume that DB directory is unitialized
                /usr/bin/mysql_install_db --datadir="$DBDIR" --user=mysql
            fi
            (cd /usr ; /usr/bin/mysqld_safe --datadir="/var/lib/mysql" --socket="/run/mysqld/mysqld.sock" --user=mysql  >/dev/null 2>&1 &)
            sleep 3
            /usr/bin/mysqladmin -u root password 'dwofMVR8&E^#3owHA0!Y'
        else
            (cd /usr ; /usr/bin/mysqld_safe --datadir="/var/lib/mysql" --socket="/run/mysqld/mysqld.sock" --user=mysql  >/dev/null 2>&1 &)
            sleep 3
        fi
        if [[ ! -d "$DBDIR/seccubus" ]]; then
    /usr/bin/mysql -u root --password='dwofMVR8&E^#3owHA0!Y'<<EOF
        create database seccubus;
        grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
        flush privileges;
EOF
            /usr/bin/mysql -u seccubus -pseccubus seccubus < $(ls /opt/seccubus/db/structure*.mysql|tail -1)
            /usr/bin/mysql -u seccubus -pseccubus seccubus < $(ls /opt/seccubus/db/data*.mysql|tail -1)

            /usr/bin/mysql -u seccubus -pseccubus seccubus <<EOF1
        INSERT INTO workspaces VALUES (1,'Example');
        INSERT INTO scans VALUES
            (1,'ssllabs','SSLlabs','--hosts @HOSTS --from-cache','','www.seccubus.com',1),
            (2,'nmap','Nmap','-o \"\" --hosts @HOSTS','','www.seccubus.com',1),
            (3,'nikto','Nikto','-o \"\" --hosts @HOSTS','','www.seccubus.com',1);
EOF1
            (cd /opt/seccubus/;bin/seccubus_passwd -u admin -p 'GiveMeVulns!')
        fi
    else
        # If we don't need a DB, we don't need to logrotate it
        rm -f /etc/logrotate.d/mysql-server
    fi
elif [[ "$STACK" != "front" ]]; then
    if [[ "$DBHOST" == "127.0.0.1" && "$DBPORT" == "3306" ]]; then
        echo "*** There is no local database in this image, you have to set \$DBHOST"
        exit 255
    fi
fi

# syslog
touch /var/log/messages
if [[ "$STACK" == "full" || "$STACK" == "cron" || "$STACK"  == "api" || "$STACK"  == "web" ]]; then
    /sbin/syslogd
fi


# Crontab
if [[ "$STACK" == "cron" || "$STACK" == "full" ]]; then
    echo "Setting up crontab and mail"
    echo
    CRON_MAIL_TO=${CRON_MAIL_TO:-"$SMTPFROM"}
    #if [[ ! -z $1 ]]; then

    #fi
    if [[ ! -z $SMTPSERVER ]]; then
        SMTPDOMAIN=$(echo $SMTPFROM|sed "s/^.*@//")
        echo "localhost" >/etc/mailname
        cat <<EOF >/etc/ssmtp/ssmtp.conf
root=$CRON_MAIL_TO
mailhub=$SMTPSERVER
rewriteDomain=$SMTPDOMAIN
hostname=$(hostname).$SMTPDOMAIN
EOF
        /etc/init.d/ssmtp start
    fi
    /docker/mkcron
    /usr/sbin/crond
    echo
fi

if [[ "$STACK" != "front" && "$STACK" != "web" && "$STACK" != "api" ]]; then
    echo "Updating nikto"
    cd /opt/nikto
    git pull
    echo
    echo "Updating testssl.sh"
    cd /opt/testssl.sh
    git pull
    echo
fi

# Return to home
cd

echo
echo "*** Setup DONE ***"
echo

# Execute commands if needed
case $1 in
"")
    if [[ "$STACK" == "front" ]]; then
        touch /var/log/nginx/error.log
        tail -f /var/log/nginx/*
    fi
    if [[ "$STACK" == "full" || "$STACK" == "api" || "$STACK" == "web" ]]; then
        tail -f /var/log/seccubus/* /var/log/messages
    fi
    if [[ "$STACK" == "cron" ]]; then
        tail -f /var/log/messages
    fi
    if [[ "$STACK" == "perl" ]]; then
        su - seccubus -c bash
    fi
    ;;
"scan")
    (tail -f /var/log/messages 2>&1)&
    cd /opt/seccubus
    su - seccubus -c ". ~/.bashrc;bin/do-scan -w \"$2\" -s \"$3\" -v"
    ;;
"help")
    echo
    echo
    cat /README-docker.md
    ;;
*)
    exec "$@"
    ;;
esac
