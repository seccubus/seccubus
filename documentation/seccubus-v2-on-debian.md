---
version: 2
category: documentation
layout: page
title: How to install Seccubus V2 on Debian
---
# DEB based install
By: [Scott Pack](https://twitter.com/packscott)  
Based on [this article](http://secopsmonkey.com/seccubus-on-ubuntu-the-missing-manual.html)

## Software Installation
Install the pre-requisites

```bash
aptitude install apache2 mysql-server ruby libalgorithm-diff-perl libjson-perl libxml-simple-perl libhtml-tree-perl libapache2-mod-perl2
```

Download and install the Seccubus application

```bash
wget https://github.com/schubergphilis/Seccubus_v2/releases/download/x/seccubus_x.Bx_all.deb
dpkg -i seccubus_2.x.Bx_all.deb
```

Update the configuration file in `/etc/seccubus/config.xml`

## Configure the Database
Now create the database and populate the database with the following commands:

```bash
mysql -u root -p << EOF
create database seccubus;
grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
flush privileges;
EOF
mysql -u seccubus -pseccubus seccubus < /var/lib/seccubus/structure_vx.mysql
mysql -u seccubus -pseccubus seccubus < /var/lib/seccubus/data_vx.mysql
```

Replace `structure_vx.mysql` and `data_vx.mysql` with the highest versioned file in the directory.

## Web Server Setup
Make any necessary changes to `/etc/apache2/conf.d/seccubus.conf`. Once completed run the following
commands to properly load the necessary Apache modules.:

```bash
a2enmod perl
a2enmod cgi
```

Restart the webserver and surf to http://localhost/seccubus/ to start using seccubus

```bash
service httpd restart
```
