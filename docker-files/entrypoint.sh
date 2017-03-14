#!/bin/bash
# Copyright 2017 Frank Breedijk
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

STACK=${STACK:-'full'}
DBHOST=${DBHOST:-'127.0.0.1'}
DBPORT=${DBPORT:-'3306'}
DBNAME=${DBNAME:-'seccubus'}
DBUSER=${DBUSER:-'seccubus'}
DBPASS=${DBPASS:-'seccubus'}
TZ=${TZ:-'UTC'}

# Fix timezone
if [[ -e "/usr/share/zoneinfo/$TZ" ]]; then
    rm -f /etc/localtime
    ln -s /usr/share/zoneinfo/$TZ /etc/localtime
else
    echo "*** Timezone '$TZ' does not exist, sticking to UTC"
fi

if [[ "$1" == "scan" ]]; then
    STACK="perl"
fi

# Check sanity of parameters
if [[ "$STACK" != "full" && "$STACK" != "front" && "$STACK" != "api" && "$STACK" != "web" && \
    "$STACK" != "perl" && "$STACK" != "cron" ]]; then
    cat <<EOM
\$STACK is currently \'$STACK\', it should be one of the following
* full - Run the full stack in a single container
* front - Run a web server to serve just the front end HTML, Javascript and related files
* api - Run a web server to serve just the JSON api
* web - Run a web server to serve both the API and front end HTML, javascript etc
* perl - Provide the Perl backend code, but not database or webserver
* cron - Run a crontab scheduler with the perl backend
EOM
fi

# Set up web stack
if [[ "$STACK" == "full" || "$STACK" == "web" ]] ; then
    cp /full.conf /etc/httpd/conf.d/seccubus.conf
fi

if [[ "$STACK" == "front" ]] ; then
    cp /front.conf /etc/httpd/conf.d/seccubus.conf
    if [[ -z $APIURL ]]; then
        echo "\$STACK is set to '$STACK', but \$APIURL is empty, this won't work"
        exit
    else
        # Patch javascript to access remote URL
        sed -i.bak "s#\\\"json\\/\\\"#\"$APIURL\"#" /opt/seccubus/www/seccubus/production.js
    fi
fi

if [[ "$STACK" == "api" ]] ; then
    cp /api.conf /etc/httpd/conf.d/seccubus.conf
fi

if [[ "$STACK" == "full" || "$STACK" == "front" || "$STACK" == "api" || "$STACK" == "web" ]]; then
    # Do we need to listen on a specific URI
    if [[ ! -z $BASEURI ]]; then
        sed -i.bak "s#^Alias /#Alias $BASEURI#" /etc/httpd/conf.d/seccubus.conf
    fi
    # Need to start apache
    apachectl -DFOREGROUND &
fi

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
        <modules>/opt/seccubus/SeccubusV2</modules>
        <scanners>/opt/seccubus/scanners</scanners>
        <bindir>/opt/seccubus/bin</bindir>
        <configdir>/opt/seccubus/etc</configdir>
        <dbdir>/opt/seccubus/db</dbdir>
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
    </auth>
</seccubus>
EOF

# Let's figure out if we need a database...
if [[ "$DBHOST" == "127.0.0.1" && "$DBPORT" == "3306" ]]; then
    if [[ ! -e /var/lib/mysql/ibdata1 ]]; then
        # Assume that DB directory is unitialized
        /usr/bin/mysql_install_db --datadir="/var/lib/mysql" --user=mysql
    fi
    mysqld_safe & 
    sleep 3
    if [[ ! -d /var/lib/mysql/seccubus ]]; then
        /usr/bin/mysql -u root << EOF
            create database seccubus;
            grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
            flush privileges;
EOF
        /usr/bin/mysql -u seccubus -pseccubus seccubus < `ls /opt/seccubus/db/structure*.mysql|tail -1`
        /usr/bin/mysql -u seccubus -pseccubus seccubus < `ls /opt/seccubus/db/data*.mysql|tail -1`

        # Add example data
        cd /opt/seccubus/www/seccubus
        # Workspace
        json/createWorkspace.pl name=Example
        # Three scans
        json/createScan.pl workspaceId=100 name=ssllabs scanner=SSLlabs "password= " "parameters=--hosts @HOSTS --from-cache" targets=www.seccubus.com
        json/createScan.pl workspaceId=100 name=nmap scanner=Nmap "password= " 'parameters=-o "" --hosts @HOSTS' targets=www.seccubus.com
        json/createScan.pl workspaceId=100 name=nikto scanner=Nikto "password= " 'parameters=-o "" --hosts @HOSTS' targets=www.seccubus.com
    fi        
fi

# Crontab
if [[ "$STACK" == "cron" || "$STACK" == "full" ]]; then
    /mkcron
    if [[ "$1" != "" ]]; then
        echo "Starting cron in background"
        if [[ -e "/var/run/crond.pid" && $(ps -ef|grep `cat /var/run/crond.pid`|grep cron|wc -l) -gt 0 ]]; then
            kill -9 `cat /var/run/crond.pid`
        fi
        /usr/sbin/crond -n &
    fi
fi


case $1 in
"")
    if [[ "$STACK" == "full" || "$STACK" == "front" || "$STACK" == "api" || "$STACK" == "web" ]]; then
        touch /var/log/httpd/access_log /var/log/httpd/error_log
        tail -f /var/log/httpd/*log
    fi
    if [[ "$STACK" == "cron" ]]; then
        if [[ -e "/var/run/crond.pid" && $(ps -ef|grep `cat /var/run/crond.pid`|grep cron|wc -l) -gt 0 ]]; then
            kill -9 `cat /var/run/crond.pid`
            sleep 2
        fi
        /usr/sbin/crond -x sch -n
    fi
    ;;
"scan")
    cd /opt/seccubus
    su - seccubus -c "bin/do-scan -w \"$2\" -s \"$3\""
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