#!/bin/sh
# Copyright 2018 Frank Breedijk
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
set -x
set -e

BUILDSTACK=$1

if [[ "$BUILDSTACK" != "full" && "$BUILDSTACK" != "front" && "$BUILDSTACK" != "web" && \
      "$BUILDSTACK" != "api" && "$BUILDSTACK" != "perl" && "$BUILDSTACK" != "cron" ]]; then
    echo "Don't know how to install for '$BUILDSTACK'"
    exit 255
fi

# Install prerequisites
apk update
# Basics
APKS="tzdata make bash perl logrotate"

if [[ "$BUILDSTACK" == "full" || "$BUILDSTACK" == "front" ]]; then
    # Web server
    APKS="$APKS nginx"
fi
if [[ "$BUILDSTACK" != "perl" && "$BUILDSTACK" != "cron"  ]]; then
    # Web server
    APKS="$APKS openssl"
fi
if [[ "$BUILDSTACK" != "front" ]]; then
    # Perl modules
    APKS="$APKS perl-dbd-mysql perl-dbi perl-date-format perl-html-parser perl-json perl-libwww perl-lwp-protocol-https
        perl-net-ip perl-term-readkey perl-xml-simple perl-app-cpanminus perl-mojolicious perl-algorithm-diff
        perl-module-build perl-namespace-autoclean perl-moo perl-strictures perl-test-fatal perl-digest-hmac
        perl-type-tiny"
fi
if [[ "$BUILDSTACK" == "full" || "$BUILDSTACK" == "cron" ]]; then
    # Cron
    APKS="$APKS busybox-suid"
    # Mail
    APKS="$APKS ssmtp"
fi
if [[ "$BUILDSTACK" == "full" || "$BUILDSTACK" == "perl" || "$BUILDSTACK" == "cron" ]] ; then
    # Scan tools
    APKS="$APKS git nmap"
fi
if [[ "$BUILDSTACK" == "full" ]] ; then
    # Database
    APKS="$APKS mariadb mariadb-client"
fi

# Install
apk add $APKS

if [[ "$BUILDSTACK" != "front" ]]; then
    apk add --virtual .build-dependancies wget linux-headers perl-dev perl-app-cpanminus gcc libc-dev
    # Perl modules
    cpanm Digest::SHA3
    cpanm Crypt::PBKDF2
    apk del .build-dependancies
fi

# Extract tarbal
cd /build/seccubus
tar -xzf build/Seccubus*.tar.gz
cd Seccubus-*

if [[ "$BUILDSTACK" != "front" ]]; then
    # Make sure perl is set to the correct path
    perl Makefile.PL
    make clean
    perl Makefile.PL 2>&1| tee makefile.log

    # Check if we have all perl dependancies
    if [[ $(grep "Warning: prerequisite" makefile.log| grep -v 'Perl::Critic' |wc -l) -gt 0 ]]; then
        echo '*** ERROR: Not all perl dependancies installed ***'
        cat makefile.log
        exit 255
    fi
fi

# create user
mkdir -p /opt/seccubus
addgroup seccubus
adduser -h /opt/seccubus -g "Seccubus system user" -s /bin/bash -S -D -G seccubus seccubus
addgroup seccubus wheel

chown -R seccubus:seccubus /opt/seccubus
chmod 755 /opt/seccubus

# Install the software
./install.pl --basedir /opt/seccubus /opt/seccubus/www --stage_dir /build/stage --createdirs --owner seccubus -v -v

# Create mountpoint for data directory
mkdir /opt/seccubus/data
chmod 755 /opt/seccubus/data
chown seccubus:seccubus /opt/seccubus/data
chmod 755 /opt/seccubus

mkdir /var/log/seccubus
chmod 755 /var/log/seccubus
chown seccubus:seccubus /var/log/seccubus

if [[ "$BUILDSTACK" == "front" ]]; then
    # Only keep the parts we need
    ls -d /opt/seccubus/*|grep -v "\/data"|grep -v "\/public"|xargs rm -rf
else
    if [[ "$BUILDSTACK" == "web" || "$BUILDSTACK" == "api" ]]; then
        rm -rf /opt/seccubus/bin/* /opt/seccubus/scanners/*
    fi
    if [[ "$BUILDSTACK" != "web" && "$BUILDSTACK" != "full" ]]; then
        rm -rf  /opt/seccubus/public
    fi
    if [[ "$BUILDSTACK" != "full" ]]; then
        rm -rf  /opt/seccubus/db/*
    fi
    rm -rf /opt/seccubus/docs
fi

if [[ "$BUILDSTACK" == "full" ]]; then
    # Setup database
    DB_DATA_PATH="/var/lib/mysql"
    DB_ROOT_PASS="dwofMVR8&E^#3owHA0!Y"
    DB_USER="mariadb_user"
    DB_PASS="dwofMVR8&E^#3owHA0!Y"
    MAX_ALLOWED_PACKET="200M"
    mysql_install_db --user=mysql --datadir=${DB_DATA_PATH}

    (cd /usr ; /usr/bin/mysqld_safe --datadir="/var/lib/mysql" --socket="/run/mysqld/mysqld.sock" --user=mysql  >/dev/null 2>&1 &)
    sleep 3
    #/etc/init.d/mariadb start
    /usr/bin/mysql <<EOF
        create database seccubus;
        grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
        flush privileges;
EOF
    /usr/bin/mysql seccubus < $(ls /opt/seccubus/db/structure*.mysql|tail -1)
    /usr/bin/mysql seccubus < $(ls /opt/seccubus/db/data*.mysql|tail -1)

    /usr/bin/mysql seccubus <<EOF1
        INSERT INTO workspaces VALUES (1,'Example');
        INSERT INTO scans VALUES
            (1,'ssllabs','SSLlabs','--hosts @HOSTS --from-cache','','www.seccubus.com',1),
            (2,'nmap','Nmap','-o \"\" --hosts @HOSTS','','www.seccubus.com',1),
            (3,'nikto','Nikto','-o \"\" --hosts @HOSTS','','www.seccubus.com',1),
            (4,'testssl.sh','testssl.sh','-o \"\" --hosts @HOSTS','','www.seccubus.com',1);
EOF1
fi

if [[ "$BUILDSTACK" != "front" ]]; then
    # Set up some default content
    SESSION_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    echo $SESSION_KEY > /opt/seccubus/etc/SESSION_KEY
    cat <<EOF2 >/opt/seccubus/etc/config.xml
    <seccubus>
        <database>
            <engine>mysql</engine>
            <database>seccubus</database>
            <host>127.0.0.1</host>
            <port>3306</port>
            <user>seccubus</user>
            <password>seccubus</password>
        </database>
        <paths>
            <modules>/opt/seccubus/lib</modules>
            <scanners>/opt/seccubus/scanners</scanners>
            <bindir>/opt/seccubus/bin</bindir>
            <configdir>/opt/seccubus/etc</configdir>
            <dbdir>/opt/seccubus/db</dbdir>
        </paths>
        <smtp>
            <server></server>
            <from></from>
        </smtp>
        <tickets>
            <url_head></url_head>
            <url_tail></url_tail>
        </tickets>
        <auth>
            <http_auth_header></http_auth_header>
            <sessionkey>$SESSION_KEY</sessionkey>
        </auth>
        <http>
            <port>443</port>
            <cert>testdata/seccubus.crt</cert>
            <key>testdata/seccubus.key</key>
        </http>
    </seccubus>
EOF2

    # Setup default environment
    echo >/etc/profile.d/seccubus.sh 'export PATH="$PATH:/opt/seccubus/bin"'
    echo >>/etc/profile.d/seccubus.sh 'export PERL5LIB="/opt/seccubus:/opt/seccubus/lib"'
    chmod +x /etc/profile.d/seccubus.sh
    echo >/root/.bashrc 'export PATH="$PATH:/opt/seccubus/bin"'
    echo >>/root/.bashrc 'export PERL5LIB="/opt/seccubus:/opt/seccubus/lib"'

    # Clone bashrc
    cp ~/.bashrc ~seccubus/.bashrc
    chown seccubus:seccubus ~seccubus/.bashrc
fi

# Copy README files
cp README.md README-docker.md /


if [[ "$BUILDSTACK" == "full" ]]; then
    cd /opt/seccubus/
    perl -I . bin/seccubus_passwd -u admin -p 'GiveMeVulns!'
fi

if [[ "$BUILDSTACK" == "full" || "$BUILDSTACK" == "perl" || "$BUILDSTACK" == "cron" ]]; then
    # Install Nikto
    cd /opt
    git clone https://github.com/sullo/nikto.git
    echo 'export PATH="$PATH:/opt/nikto/program"' > /etc/profile.d/nikto.sh
    echo 'export PATH="$PATH:/opt/nikto/program"' >> /root/.bashrc
    chmod +x /etc/profile.d/nikto.sh


    # Install testssl.sh
    cd /opt
    git clone https://github.com/drwetter/testssl.sh.git
    echo 'export PATH="$PATH:/opt/testssl.sh"' > /etc/profile.d/testssl.sh.sh
    echo 'export PATH="$PATH:/opt/testssl.sh"' >> /root/.bashrc
fi

# Cleanup build stuff
set +e
rm -rf /build
rm -rf /var/cache/apk/*

