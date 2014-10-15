---
layout: post
title: AutoNessus v1.1.1
---
I just finished the first part of a bugfixing session I had planned for today,
but will be part of today and part of tomorrow.

Version 1.1.1 is now available as download on sourceforge and in cvs.

From the Changelog:

BUG [ 1998001 ] – NEW status is changed by delta engine  
NEW findings now remain new untill status is changed by the user  
Reopened findings now get the status NEW in stead of CHANGED

BUG [ 1914354 ] get_scans.pl still displays IP address  
IP address is no longer shown

BUG [ 2130297 ] Make the scan list also show the version of AutoNessus  
Updates Makefile.PL to get version from www/autonessus.pm  
Modified autonessus.pm to contain the $VERSION variable  
Updated getScans.pl to get the version number

BUG [ 2130354 ] Remove CVS from scans list  
Updated getScans.pl

BUG [ 2027155 ] New functions for autoremark  
Added verious new patterns to autoremark

BUG [ 1912608 ] Add remark when reopening  
Added new function update_remark to process-scan.pl which adds a comment to a

remark with timestamp if the status gets changed by the delta engine.

BUG [ 2088990 ] Secunia references not translated to a URL  
Secunia: references are now translated to a hyperlink  
milw0rm: references are now translated to a hyperlink

BUG [ 2052985 ] ; not included as part of a URL  
Added ;:& and | as recognized part of a url

BUG [ 2042667 ] MIssing prereq perl modules  
Prerequisite for LWP::UserAgent 2.0 added.

