Seccubus V2 Change Log

Seccubus V2 is currently in Alpha phase. Even though we tested this code
ourselves do not expect production ready code yet.

23-11-2011 - 2.0.alpha5
=======================
New features / Issues resolved
------------------------------
Perl compile tests and JMVC unit tests are now part to the build process
In the RPM install files in the scanner directories did not run because of
incorrect permissions (fixed)
All scanners but Nessus were broken due to an untested fix by the author

GUI rewrite
-----------
New GUI is in /seccubus/seccubus.html
First parts of the GUI rewritten using JMVC framework
Updated JMVC to get more clear build errors
Integrated JMVC building into the distribution building scripts

Bigs fixed (tickets closed):
----------------------------
#55 - Spec file is missing dependancies
https://sourceforge.net/apps/trac/seccubus/ticket/55
#56 - Scanner files not executable after install
https://sourceforge.net/apps/trac/seccubus/ticket/56
#59 - Nikto scanner not running
https://sourceforge.net/apps/trac/seccubus/ticket/59

