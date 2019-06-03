<br>
<br>

31-5-2019 - v2.51.1 - Development release
=========================================
Work in progress

Differences with 2.50

Enhancements
------------
* Integration tests (testssl.sh and ssllabs) now only run when commits are merged into master
* Switched from mysql-server to mariadb-server as a dependancy on Debian based systems

Bug Fixes
---------
* #678 - Works on Mojolicious 8 again
* #680 - RPMs are now signed again
* #685 - Test 54 did not initialize DB before test start
* #686 - New key staplingRevocationStatus added to ssllabs scanner
* #688 - RPM now requires openssl so fresh installs on EL listen on https too
* Added some test time dependancies to testssl unit test in CircleCI
* Failing unit tests for ssllabs and testssl have been fixed again