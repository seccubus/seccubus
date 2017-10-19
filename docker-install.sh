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

# Exit on error
set -e

cd /build/seccubus

cpanm --installdeps --notest .

# Build
./build_all
# Extract tarbal
cd ..
tar -xvzf seccubus/build/Seccubus*.tar.gz
cd Seccubus-*

# Make sure perl is set to the correct path
perl Makefile.PL
make clean
perl Makefile.PL 2>&1| tee makefile.log

# Check if we have all perl dependancies
if [[ $(grep "Warning: prerequisite" makefile.log| wc -l) -gt 0 ]]; then
	echo '*** ERROR: Not all perl dependancies installed ***'
	cat makefile.log
	exit 255
fi
# create users
useradd -c "Seccubus system user" -d /opt/seccubus -m seccubus -s /bin/bash

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

# Build up the database
/usr/bin/mysql_install_db --datadir="/var/lib/mysql" --user=mysql
#(cd /usr ; /usr/bin/mysqld_safe --datadir="/var/lib/mysql" --socket="/var/lib/mysql/mysql.sock" --user=mysql  >/dev/null 2>&1 &)
#sleep 3
/etc/init.d/mysql start
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
        (3,'nikto','Nikto','-o \"\" --hosts @HOSTS','','www.seccubus.com',1),
        (4,'testssl.sh','testssl.sh','-o \"\" --hosts @HOSTS','','www.seccubus.com',1);
EOF1


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

cd /opt/seccubus/
perl -I . bin/seccubus_passwd -u admin -p 'GiveMeVulns!'

# Setup default environment
echo >/etc/profile.d/seccubus.sh 'export PATH="$PATH:/opt/seccubus/bin"'
echo >>/etc/profile.d/seccubus.sh 'export PERL5LIB="/opt/seccubus:/opt/seccubus/lib"'
chmod +x /etc/profile.d/seccubus.sh
echo >/root/.bashrc 'export PATH="$PATH:/opt/seccubus/bin"'
echo >>/root/.bashrc 'export PERL5LIB="/opt/seccubus:/opt/seccubus/lib"'


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

# Cleanup build stuff
rm -rf /build

apt-get autoremove default-jre-headless -y

