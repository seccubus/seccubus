---
version: 2
category: documentation
layout: page
title: How to set up a development environment
---
In you development environment you will need the following tools/modules:
* git
* CGI.pm
* JSON.pm
* XML::Simple
* DBD:mysql.pm
* mysql (server)
* Algorpthm::Diff.pm
* Ruby

To do this with yum run: yum install git perl-CGI perl-JSON perl-XML-Simple mysql perl-Algorithm-Diff perl-DBD-mysql mysql ruby mysql-server

Create a symlink for /opt/seccubus
/opt/seccubus -> your Seccubus checkout dir (e.g. ~frank/Seccubus_v2)
