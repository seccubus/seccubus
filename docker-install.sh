#!/bin/bash -x
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
 
cd /build/seccubus 
rm -rf *.tar.gz

# Build
./make_dist
# Extract tarbal
cd ..
tar -xvzf seccubus/Seccubus*.tar.gz
cd Seccubus-*

# Make sure perl is set to the correct path
perl Makefile.PL
make clean
perl Makefile.PL | tee makefile.log

# Check if we have all perl dependancies
if [[ `grep "Warning: prerequisite" makefile.log| wc -l` -gt 0 ]]; then
	echo *** ERROR: Not all perl dependancies installed ***
	cat makefile.log
	exit 255
fi

# create users
useradd -c "Seccubus system user" -d /opt/seccubus -G "apache" -m seccubus
groupmems -g seccubus -a apache

# Install the software
./install.pl --basedir /opt/seccubus --wwwdir /opt/seccubus/www --stage_dir /build/stage --createdirs

# Fix permissions
chown -R seccubus:seccubus /opt/seccubus
chmod 755 /opt/seccubus

# Build up the database
/usr/bin/mysql_install_db --datadir="/var/lib/mysql" --user=mysql
/usr/bin/mysqld_safe --datadir="/var/lib/mysql" --socket="/var/lib/mysql/mysql.sock" --user=mysql  >/dev/null 2>&1 &
sleep 3
/usr/bin/mysql -u root << EOF
	create database seccubus;
	grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
	flush privileges;
EOF
/usr/bin/mysql -u seccubus -pseccubus seccubus < `ls /opt/seccubus/db/structure*.mysql|tail -1`
/usr/bin/mysql -u seccubus -pseccubus seccubus < `ls /opt/seccubus/db/data*.mysql|tail -1`

# Set up some default content
cat <<EOF >/opt/seccubus/etc/config.xml
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
        <modules>/opt/seccubus/SeccubusV2</modules>
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
</seccubus>
EOF

cd /opt/seccubus/www/seccubus
# Workspace
json/createWorkspace.pl name=Example
# Three scans
json/createScan.pl workspaceId=100 name=ssllabs scanner=SSLlabs "password= " "parameters=--hosts @HOSTS --from-cache" targets=www.seccubus.com
json/createScan.pl workspaceId=100 name=nmap scanner=Nmap "password= " 'parameters=-o "" --hosts @HOSTS' targets=www.seccubus.com
json/createScan.pl workspaceId=100 name=nikto scanner=Nikto "password= " 'parameters=-o "" --hosts @HOSTS' targets=www.seccubus.com

# Install Nikto
cd /opt
git clone https://github.com/sullo/nikto.git

# Install testssl.sh
cd /opt
git clone https://github.com/drwetter/testssl.sh.git
ln -s /opt/nikto

# Cleanup default OS stuff
rm -f /etc/httpd/conf.d/welcome.conf

# Cleanup build stuff
rm -rf /build

yum -y erase java-1.7.0-openjdk "perl(ExtUtils::MakeMaker)" 
yum -y autoremove