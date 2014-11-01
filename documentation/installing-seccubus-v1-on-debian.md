---
version: 1
category: documentation
layout: page
title: Installing Seccubus V1 on Debian
---
libalgorithm-diff-xs-perl

liblwp2

libwww-perl

make

nikto (optional)

all of which can be installed through apt-get or aptitude.

If you plan to use OpenVAS instead of Nessus, you need to

apt-get -t experimental install openvas-scanner openvas-client

Seccubus install

This can be followed from the Seccubus website.

* Get the tarball seccubus-.tar.gz via the download link at [http://www.seccubus.com](http://www.seccubus.com/) and place it in a temporary location (e.g./tmp/seccubus)

* It is recommended that you run Seccubus via a dedicated seccubus user if you have not created it, create it now. Make sure it is part of apache’s group and apache is part of its group.

* Extract the tarball

# tar -xvzf seccubus-0.1.tar.gz

seccubus-0.1/

seccubus-0.1/bin/

* cd into the newly created directory

* Run perl makefile.PL to install

# perl Makefile.PL

Checking if your kit is complete…

Looks good

Writing Makefile for seccubus

* run make

# make

cp install.pl blib/lib/install.pl

cp dist_install.pl blib/lib/dist_install.pl cp www/index.html
blib/script/index.html

/usr/bin/perl5.8.8 “-MExtUtils::MY” -e “MY->fixin(shift)”
blib/script/index.html

* run the installer command ‘blib/script/install ‘ where is the directory you want Seccubus to install, e.g. /home/seccubus

# blib/script/install.pl /home/seccubus

cp blib/script/EveryXXXWeek.sh /home/seccubus/bin

Creating www directory

mkdir /home/seccubus/www

cp blib/script/seccubusweb.pm /home/seccubus/www

Updating /home/seccubus/etc/config.dist

rm /home/seccubus/etc/config.dist.orig

rm: cannot remove `/home/seccubusetc/config.dist.orig’: No such file or
directory mv /home/seccubus/etc/config.dist
/home/seccubus/etc/config.dist.orig

sed -e ‘s:HOME=/home/seccubus:HOME=/home/seccubus:’
/home/seccubus/etc/config.dist.orig >

/home/seccubus/etc/config.dist

Updating /home/seccubus/www/seccubusweb.pm rm
/home/seccubus/www/seccubusweb.pm.orig

rm: cannot remove `/home/seccubus/www/seccubusweb.pm.orig’: No such file or
directory mv /home/seccubus/www/seccubusweb.pm
/home/seccubus/www/seccubusweb.pm.orig

sed -e ‘s:our $HOME = “/home/seccubus”:our $HOME = “/home/seccubus”:’

/home/seccubus/www/seccubusweb.pm.orig >/home/seccubus/www/seccubusweb.pm

You do not have a config file please copy config.dist to config, and edit it
to match your system

Installation finished

Post-installation tasks

After the installation, there are a couple of things that you need to do:

* Changing file ownership and permissions

* Setting up the www directory

* Setting up the web server

* Edit etc/config

* Update www/seccubus.pm

* Setting up update cron jobs

Changing file ownership and permissions

Your webserver will need to be able to read and execute files in the www
directory and read and write files in the var directory.

Assuming apache is your webserver user and seccubus is the user running
Seccubus you will need to do the following:

# cd ~seccubus

# chown -R seccubus:www-data www var

# cd var

# find . -type f -exec chmod 664 {} ;

# find . -type d -exec chmod 775 {} ;

# cd ../www

# chmod 770 *

Information

Note: The web group on Debian is www-data rather than apache.

Setting up the www directory

By default the Seccubus installer stores the files for the Web GUI in a www
subdirectory of you install directory, this could be a place where your
webserver cannot go. You can move the directory to a place where it can be
read by the webserver and replace the www directory with a symlink. E.g. in
the demo setup we have chosen to install in /home/seccubus but we want the
demo gui to be in /var/www/seccubus.com/htdocs/demo

# cd ~seccubus

# mv www /var/www//htdocs/

# ln -s /var/www/sonsofthunder/htdocs/nessus www

For instance, the directory may be called /var/www/sonsofthunder/htdocs/nessus

If you do not create a symlink like this you may experience upgrade problems
in the future.

Setting up the webserver

By default your webserver will not run the .pl files, but simply serve them.
You need to put the following directive in the right part of you apache
configuration. On Debian, this is in /etc/apache2/mods-available/mime.conf:

AddHandler cgi-script .pl

I usually place this after the commented line

#AddHandler cgi-script .cgi

Then in the directory directive you have to add “ExecCGI” to the “Options”
directive. You may also want to use the Indexes directive. This portion of the
configuration goes in /etc/apache/sites-available/default. Add the following
Directory directive to this file:

Options ExecCGI

Order deny,allow

Update etc/config

The etc directory in your installdir contains the file config which contains
the default configuration parameters of Seccubus which can be overwritten with
per scan settings.

If you do not allready have a configfile, you can copy config.dist to config.
The installer script will allready have updated the path to your installation
directory.

You will have to update the following parameters:

Configuration directive  What to put there

HOST= # This is the host running your nessusd  The IP address or hostname of
the host running the nessus scanner here. If you have nessus installed on the
same box you can set it to localhost

PORT=1241 # Nessusd port (1241 = default)  This is the port you nessus daemon
is listening on. 1241 is the default. OpenVAS default is 9390.

USER= # Nessusd user name  This is the default user name you will use to
authenticate to your nessus daemon

PASS= # Nessusd password  This is the default user name you will use to
authenticate to your nessus daemon

NESSUSBIN=/usr/bin/nessus # The full path to your nessus client  This is the
full path to your nessus client binary

EMAIL= # This is the default email address  Default email address to mail
results to

HOME=/home/seccubus/ # Home location of seccubus  This is set to the install
directory by the installer script

VAR=$HOME/var # This is where the ‘database’ lives  This should point to the
var directory where the ‘database’ lives

SENDMAIL=/usr/sbin/sendmail # Path to sendmail  The full path of you sendmail
binary.

Update autopnessus.pm

The seccubusweb.pm file in www contains a line like this:

# You need to point this to where seccubus lives our $HOME =
“/home/seccubus/”;

This tells the web GUI part where to find the database. Normally this line
should be set by the install script.

You should now be ready to setup the first scan.

Setting up update cron jobs

In order to make sure your configuration files are updated it is recommended
to setup a cronjob that runs bin/update-rcs e.g.

0 21 * * * ~/bin/update-rcs

This will update etc/full -nessusrc and etc/safe-nessusrc with theplug id’s
and preferences of the plugin’s loaded by the nessus daemon. update-rcs uses
you primary nessus scanner which you specified in etc/config.

