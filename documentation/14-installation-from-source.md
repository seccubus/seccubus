---
version: 2
category: user
layout: page
title: Installation from source
---
# How to install Seccubus from source?

Seccubus can be installed directly from a github clone.

## Clone the github repository

```bash
git clone https://github.com/schubergphilis/Seccubus.git
```

## Make sure you have prerequisite software 

You need to have the following software to build seccubus
* git
* Make
* Java
* Mojolicious

On Debian based systems (e.g. Kali linux) you can run the following command to install it:

```bash
sudo apt-get install make git openjdk-11-jre libmojolicious-perl
```

## Build

```bash
cd Seccubus
./build_all
```

## Install

Now you need to run install.pl as root

```bash
cd build
sudo ./install.pl –-help
```

Running ./install.pl –help will show the help message and show the paramers
for the Seccubus install. E.g. if you want to install everything in /opt/seccubus do:

```bash
sudo ./install.pl --basedir=/opt/seccubus
```

## Start seccubus


```bash
cd /opt/seccubus
PERL5LIB=/opt/seccubus hypnotoad seccubus.pl
```

## Configure seccubus

Now we have to create its database and update its configuration.

Go to the configuration directory and copy config.xml.mysql.example to
config.xml

```bash
cd /opt/seccubus/etc
cp config.xml.mysql.example config.xml
```

Edit config.xml and change the database server, username and password to the
values matching your setup

## Create database

Now create the database and populate the database with the following
commands:

```bash
mysql << EOF
create database seccubus;
grant all privileges on seccubus.* to seccubus@localhost identified by '<password>';
flush privileges;
EOF
mysql -u seccubus –p seccubus < /opt/seccubus/db/structure_vX.mysql
mysql -u seccubus -p seccubus < /opt/seccubus/db/data_vX.mysql
```

## Reload seccubus

```bash
cd /opt/seccubus
hypnotoad seccubus.pl
```
