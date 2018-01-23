---
version: 2
category: user
layout: page
title: Installation on Debian
---
# DEB based install
By: [Scott Pack](https://twitter.com/packscott) and Frank Breedijk
Based on [this article](http://secopsmonkey.com/seccubus-on-ubuntu-the-missing-manual.html)

## From the package cloud repo

For the repo that is synced with current releases run

```bash
curl -s https://packagecloud.io/install/repositories/seccubus/releases/script.deb.sh | sudo bash
```

For the repo that is synced with the latest code pushes to master run

```bash
curl -s https://packagecloud.io/install/repositories/seccubus/latest/script.deb.sh | sudo bash
```

Once the repo is set up you can install Seccubus via the regular `apt-get` command

```bash
apt-get install seccubus
```

## Downloaded from GitHub

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

## Database tweaks

The following tweaks may be needed for /MariaDB if you are handling larger scan results in /etc/mysql/mariadb.conf.d/50-server.cnf

```
# * InnoDB
#
# InnoDB is enabled by default with a 10MB datafile in /var/lib/mysql/.
# Read the manual for more InnoDB related options. There are many!
innodb_log_file_size = 1024M

```
