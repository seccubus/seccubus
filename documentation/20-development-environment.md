---
version: 2
category: dev
layout: page
title: Setup development environment
---

Seccubus development on Mac OS X
================================

I recently switched from a Windows laptop to a Macbook and this means I now have a portable
development environment on me at all times.

This document details what you have to do to set up a development environment on Mac OS X.

Check out the code
------------------
I checked out my code in ~/Repositories with the following commend:

```bash
cd ~/Repositories
git clone https://github.com/schubergphilis/Seccubus_v2.git
```

I suggest that you actually first fork the repository to your own github account and clone from there. In my case the clone command was:

```bash
git clone git@github.com:seccubus/Seccubus.git
```

Setting up the database
-----------------------
I installed mysql via Homebrew

```bash
brew install mysql
mysql.server start
```

(!) Warning a standard mysql environment is not secure by default

Setting up perl and mysql
-------------------------

First we need to setup cpanm, I do this via Homebrew

```bash
brew install cpanm
```

Next install the missing CPAN modules:

```bash
sudo cpanm --installdeps .
```

Setting up Seccubus
-------------------
Go to you repository. And create a config file
	
```bash
cd ~/Repositories/Seccubus_v2
cp config.xml.mysql.example config.xml
vi config.xml
```

Change the database to the correct database

Starting Seccubus in development mode
-------------------------------------

```bash
morbo seccubus.pl
Server available at http://127.0.0.1:3000
```

Surf to <http://127.0.0.1:3000> and follow setup instructions on the status tab to create the database and populate it.

```bash
mysql -u root << EOF
create database seccubus;
grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
flush privileges;
EOF

mysql -uroot seccubus < ~/Repositories/Seccubus_v2/db/structure_v5.mysql
mysql -uroot seccubus < ~/Repositories/Seccubus_v2/db/data_v5.mysql
```

Done. Default admin password is 'GiveMeVulns!'.