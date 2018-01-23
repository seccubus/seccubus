---
version: 2
category: user
layout: page
title: Installation on Fedora
---
# How to install Seccubus on RedHat/Centos?

[Click here for other operating systems](../11-installation)

Attention. Redhat/CentOS packages are only available for version Enterprise Linux version 7 at the moment.

You will need some perl packages which are not available in the standard RedHat/CentOS repository. You will need to enable the epel repository first.

```bash
sudo yum install epel-release
```

## From the package cloud repo

For the repo that is synced with current releases run

```bash
curl -s https://packagecloud.io/install/repositories/seccubus/releases/script.rpm.sh | sudo bash
```

For the repo that is synced with the latest code pushes to master run

```bash
curl -s https://packagecloud.io/install/repositories/seccubus/latest/script.rpm.sh | sudo bash
```

Once the repo is set up you can install Seccubus via the regular yum command

```bash
sudo yum install seccubus
```

If you get an error about the package not being trusted, then please run `apt-get install gpg` before you run the script from packagecloud.io

## Dowloaded from Github

Install the rpm

```bash
wget https://github.com/schubergphilis/Seccubus/releases/download/2.xx/Seccubus-2.x.x-x.noarch.rpm
wget https://github.com/schubergphilis/Seccubus/releases/download/2.xx/perl-EV-4.xx-x.x86_64.rpm
wget https://github.com/schubergphilis/Seccubus/releases/download/2.xx/perl-IO-Socket-IP-0.xx-x.noarch.rpm
wget https://github.com/schubergphilis/Seccubus/releases/download/2.xx/perl-Mojolicious-7.xx-x.noarch.rpm	
# You can also find these packes at (https://github.com/schubergphilis/Seccubus/releases/latest)
sudo yum install Seccubus-2.x.x-x.noarch.rpm perl*
```

Update the configuration file in /etc/seccubus/config.xml 

Now create the database and populate the database with the following
commands:

```bash
sudo systemctl start mariadb # If mariadb isn't running
mysql << EOF
create database seccubus;
grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
flush privileges;
EOF

mysql -u seccubus -pseccubus seccubus < /opt/seccubus/var/structure_vX.mysql 
                # Use version and path indicated on the screen
mysql -u seccubus -pseccubus seccubus < /opt/seccubus/var/data_vX.mysql 
                # Use version and path indicated on the screen
```

Replace X with the database version that you need. 

## Restart the service

```bash
systemctl restart seccubus.service
```
