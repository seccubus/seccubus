---
version: 2
category: user
layout: page
title: Installation on Debian
---
# DEB based install
By: [Scott Pack](https://twitter.com/packscott) and Frank Breedijk
Based on [this article](http://secopsmonkey.com/seccubus-on-ubuntu-the-missing-manual.html)

## Software Installation

Download and installing the Seccubus application

```bash
wget https://github.com/schubergphilis/Seccubus_v2/releases/download/x/seccubus_x.Bx_all.deb
sudo apt-get update
sudo dpkg -i seccubus_2.32.143-0_amd64.deb     # This will fail
sudo apt-get -f install                        # This will install failed dependancies
```

Update the configuration file in `/etc/seccubus/config.xml`

Reload the seccubus service if you changed the config.

```bash
service seccubus reload
```

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

The applicaiton will be listening on port 8443 by default.

Default admin password is `GiveMeVulns!`. You can change it on the command line:

```bash
sudo su - seccubus
bin/seccubus_passwd -u root
```
