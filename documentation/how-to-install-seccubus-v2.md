---
version: 2
category: documentation
layout: page
title: How to install Seccubus V2?
---
# How to install Seccubus V2?

Before you install Seccubus V2 you need to fulfill a number of prerequisites.
The following software needs to be installed on your machine:

  * Mysql
  * Apache
  * Perl
  * Ruby (Required if you want to run Nessus scans)

The following Perl libraries need to be present:

  * Algorithm::Diff
  * Carp
  * CGI
  * ExtUtils::MakeMaker
  * Getopt::Long
  * IPC::Open2
  * LWP::UserAgent
  * DBI
  * Data::Dumper
  * XML::Simple
  * HTML::Entities
  * LWP::Simple
  * MIME::Base64

## RPM based install

Install the rpm

    rpm –install Seccubus-2.x.x-x.noarch.rpm

Update the configuration file in /etc/seccubus/config.xml 

Now create the database and populate the database with the following
commands:

    > mysql << EOF
    create database Seccubus;
    grant all privileges on Seccubus.* to seccubus@localhost identified by ‘seccubus’;
    flush privileges;
    EOF

    > mysql -u seccubus -pseccubus Seccubus < /…/structure_vX.mysql # Use version
and path indicated on the screen
    > mysql -u seccubus -pseccubus Seccubus < /…/data_vX.mysql # Use version and
path indicated on the screen

Restart the webserver and surf to http://localhost/seccubus/ to
start using seccubus

     > service httpd restart

## Deb based install

Install the rpm

    apt-get install  Seccubus_2.x.Bx_all.dep

Update the configuration file in /etc/seccubus/config.xml 

Now create the database and populate the database with the following
commands:

    > mysql << EOF
    create database Seccubus;
    grant all privileges on Seccubus.* to seccubus@localhost identified by ‘seccubus’;
    flush privileges;
    EOF

    > mysql -u seccubus -pseccubus Seccubus < /…/structure_vX.mysql # Use version
and path indicated on the screen
    > mysql -u seccubus -pseccubus Seccubus < /…/data_vX.mysql # Use version and
path indicated on the screen

Restart the webserver and surf to http://localhost/seccubus/ to
start using seccubus

     > service httpd restart

## Github Clone

Seccubus can be installed directly from a github clone.

Clone the github repository

    > git clone git://github.com/schubergphilis/Seccubus_v2.git
    Cloning into ‘Seccubus_v2′…
    remote: Counting objects: 7413, done.
    remote: Compressing objects: 100% (3184/3184), done.
    remote: Total 7413 (delta 3907), reused 7301 (delta 3795)
    Receiving objects: 100% (7413/7413), 49.14 MiB | 3.84 MiB/s, done.
    Resolving deltas: 100% (3907/3907), done.

Next we need to make the tarball

    > cd Seccubus_v2
    > ./make_dist

You can now follow the tarball installation instructions using the tarball you
just created or run ./install.pl directly

## Tarball (tar.gz)

So you have downloaded the Seccubus V2 and want to get started. This page will
tell you how to install the software. This guide makes the following
assumptions:

  * There is a user seccubus on the system
  * This user account will be used to install the software
  * The home directory of the user seccubus is “/home/seccubus”
  * Apache’s web root is at …

Download the tarball

Extract the tarball

    > tar -xvzf Seccubus-2.x.X.tar.gz

Run Makefile.PL

    > cd Seccubus-2.x.x
    > perl Makefile.PL

If you get messages like the messages below, you need to install some
dependancies

    Warning: prerequisite XML::Simple 2.18 not found.

If you see messages like the messages below, you may have an older version
then the version used in development. Seccubus may still work, but has not
been tested with this release

    Warning: prerequisite XML::Simple 2.18 not found. We have 2.17.

Run make

    > make

Now you need to run install.pl as root

    > sudo su –
    > ./install.pl –help

Running ./install.pl –help will show the help message and show the paramers
for the Seccubus install. Now say that we want to install everything in
/home/seccubus but place the web files in /var/www/html. We would type the
following command:

    > ./install.pl –wwwdir /var/www/html/

Next we have to make sure that *.pl “is recognized as a CGI script” for this
we need to add the following line to httpd.conf and restart apache.

We also need to add the ExecCGI to the options section of the /var/www/html
directory

    AddHandler cgi-script .pl
    Options Indexes FollowSymLinks ExecCGI

First we have to make sure that the apache user can read the files in
/home/seccubus. Edit the /etc/group file and make apache a member of the
seccubus group and restart apache

    > vi /etc/group
    seccubus:x:502:apache
    > service apache restart

Make sure seccubus owns all files in /home/seccubus and the directory is group
readable

    > chown -R seccubus:seccubus .
    > chmod 750 /home/seccubus

Now we have to create its database and update its configuration.

Go to the configuration directory and copy config.xml.mysql.example to
config.xml

    > cd /home/seccubus/etc
    > cp config.xml.mysql.example config.xml

Edit config.xml and change the database server, username and password to the
values matching your setup

Now create the database and populate the database with the following
commands:

    > mysql << EOF
    create database Seccubus;
    grant all privileges on Seccubus.* to Seccubus@localhost identified by ‘<password>’;
    flush privileges;
    EOF
    > mysql -u seccubus –p Seccubus < /home/seccubus/db/structure_v1.mysql
    > mysql -u seccubus -p Seccubus < /home/seccubus/db/data_v1.mysql

