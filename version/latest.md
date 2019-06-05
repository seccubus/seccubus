<br>
<br>
5-6-2019 - v2.52 Varna release
=========================================
Hello! It is the first Seccubus release made by Glanc team. Mostly bug fixes.

Differences with 2.50

Enhancements
------------
* Integration tests (testssl.sh and ssllabs) now only run when commits are merged into master
* Switched from mysql-server to mariadb-server as a dependancy on Debian based systems
* Online version check is now served from the main seccubus.com website

Bug Fixes
---------
* #678 - Works on Mojolicious 8 again
* #680 - RPMs are now signed again
* #685 - Test 54 did not initialize DB before test start
* #686 - New key staplingRevocationStatus added to ssllabs scanner
* #688 - RPM now requires openssl so fresh installs on EL listen on https too
* Added some test time dependancies to testssl unit test in CircleCI
* Failing unit tests for ssllabs and testssl have been fixed again
