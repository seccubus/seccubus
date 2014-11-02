---

category: faq
layout: page
title: Having trouble after upgrading to Seccubus 1.5.0?
---
There have been some reports about troubles after upgrading from Seccubus 1.4
and earlier to version 1.5.0

I have analysed what causes these problems and have found the following: In
order to support installation via RPM we had to alter a few things. In the
original design the etc and var directories lived directly below the Seccubus
home directory, but OS maintainers like to break this apart. They like to e.g.
stor the var directory in /var/lib/Seccubus and the etc durectory in
/etc/Seccubus. In order to facilitate this the reference to $HOME or
$ENV{HOME} in certain scripts have been to explicit references to these
directories in both the software and the configuration.

Those users upgrading from a previous version are lacking these configuration
items in their etc/config file. THe missing entires are:

VAR=$HOME/var # This is where the ‘database’ lives  
BIN=$HOME/bin # This is where the binaries live  
CONFIG=$HOME/bin # This is where the config lives

If you add these three lines to your configuration file scanning with Seccubus
should work as expected again.

There is also an issue with viewing idividual findigns (view_finding.pl call)
in the web interface. An emergency release hto adress this issue has been
uploaded to SourceForge (tar.gz verison only)

![Sorry - On Australia Day a Creative Commons SHare Alike picutre from Dave
Keeashan's fotostream
](http://farm3.static.flickr.com/2240/2219132087_373029368d.jpg)

