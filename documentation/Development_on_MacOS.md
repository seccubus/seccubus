---
version: 2
category: documentation
layout: page
title: How to set up a Mac OS X development environment
---

Seccubus development on Mac OS X
================================

I recently switched from a Windows laptop to a Macbook and this means I now have a portable
development environment on me at all times.

This file details what you have to do to set up a development environment on Mac OS X.

Check out the code
------------------
I checked out my code in ~/Repositories with the following commend:

	cd ~/Repositories
	git clone https://github.com/schubergphilis/Seccubus_v2.git

I suggest that you actually first fork the repository to your own github account and clone from there. In my case the clone command was:

	git clone git@github.com:seccubus/Seccubus_v2.gi
	
Setup your webserver
--------------------

Edit the following file
	
	sudo vi /etc/apache2/users/USERNAME.conf

Obviously replace USERNAME with you username

For Yosemite

	<Directory "/Users/USERNAME/Sites/">
		Options Indexes Multiviews ExecCGI FollowSymLinks
		AllowOverride AuthConfig Limit
		require local
		AddHandler cgi-script .pl
	</Directory>

For earlier versions

	<Directory "/Users/USERNAME/Sites/">
		Options Indexes Multiviews ExecCGI FollowSymLinks
		AllowOverride AuthConfig Limit
		Order allow,deny
		Allow from 127.0.0.1
		AddHandler cgi-script .pl
	</Directory>

Create the Sites directory

	mkdir ~/Sites
	chmod 755 ~/Sites

Create a link to your repo directory

	cd ~/Sites
	ln -s ~/Repositories/Seccubus_v2/www/ seccubus

Start apache

	sudo apachectl start

You can go to the seccubus dev enviroment by visiting http://127.0.0.1/~USERNAME/seccubus/dev/seccubus/

Seccubus expects certain files to be in /opt/seccubus so we want to create this symlink too

	cd /opt
	sudo ln -s ~USERNAME/Repositories/Seccubus_v2/ seccubus

Yosemite specific
-----------------

In Yosemite you need to tweak the apache config
    
    vi /etc/apache/httpd.conf

Uncomment the following lines:

    #LoadModule userdir_module libexec/apache2/mod_userdir.so

    #Include /private/etc/apache2/extra/httpd-userdir.conf

    #LoadModule cgi_module libexec/apache2/mod_cgi.so

Edit httpd-userdir.conf

    vi /private/etc/apache2/extra/httpd-userdir.conf

Uncomment the flowwing line:

     #Include /private/etc/apache2/users/*.conf

Restart apache

    sudo apachectl restart


Setting up the database
-----------------------
I installed mysql via Homebrew

	brew install mysql
	mysql.server start

(!) Warning a standard mysql environment is not secure by default

Setting up perl and mysql
-------------------------

If you go to http://127.0.0.1/~USERNAME/seccubus/dev/seccubus/json/ConfigTest.pl you will 
see an error about JSON.pm being missing

	Software error:

	Can't locate JSON.pm in @INC (@INC contains: .. /Library/Perl/5.16/darwin-thread-multi-2level /Library/Perl/5.16 /Network/Library/Perl/5.16/darwin-thread-multi-2level /Network/Library/Perl/5.16 /Library/Perl/Updates/5.16.2 /System/Library/Perl/5.16/darwin-thread-multi-2level /System/Library/Perl/5.16 /System/Library/Perl/Extras/5.16/darwin-thread-multi-2level /System/Library/Perl/Extras/5.16 .) at /Users/fbreedijk/Sites/seccubus/dev/seccubus/json/ConfigTest.pl line 24.
	BEGIN failed--compilation aborted at /Users/fbreedijk/Sites/seccubus/dev/seccubus/json/ConfigTest.pl line 24.

FIrst we need to setup cpanm, I do this via Homebrew

	brew install cpanm

Next install the missing CPAN modules:

	sudo cpanm JSON
	sudo cpanm DBI
	sudo cpanm DBD::mysql
	sudo cpanm REST::Client

Setting up Seccubus
-------------------
Go to you repository. And create a config file
	
	cd ~/Repositories/Seccubus_v2
	cp config.xml.mysql.example config.xml
	vi config.xml

Change the database to the correct database

Surf to http://127.0.0.1/~USERNAME/seccubus/dev/seccubus/seccubus.html and follow setup instructions to create the database

	mysql -u root << EOF
	create database seccubus;
	grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
	flush privileges;
	EOF

Populate the database

	mysql -uroot seccubus < ~/Repositories/Seccubus_v2/db/structure_v5.mysql
	mysql -uroot seccubus < ~/Repositories/Seccubus_v2/db/data_v5.mysql
