Seccubus V2 Change Log
======================
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.0 is marks the end of the beta phase for the 2.0 branch.
This code is the only actively developed and maintained branch and all support 
for Seccubus V1 has officially been dropped. 

Seccubus V2 works with the following scanners:
* Nessus 4.x and 5.x (professional and home feed)
* OpenVAS
* Nikto 
* NMap
* SSLyze

For more information visit [www.seccubus.com]

xx-xx-2012 - 2.1 - Bugfix release
=================================

Key new features / issues resolved
----------------------------------
* Added shell script to execute crontab job only on a certain day
* Added shell script to execute crontab job only on a weeknumber that can be devided by a certain number
* Correct application of Apache license is now part of the unit tests
* Resolved some caching issues with IE
* Resolved an issue that cause incomptibility with Nessus API version 5.2.1 (Thanks Trelor)

Bigs fixed (tickets closed):
----------------------------
* Issue #50 - Notification table not displayed on edit scan
* Issue #56 - IVIL conversion shell call needs qoutes around filename
* Issue #64 - New scan dialog shows 'new workspace' in title
* Issue #65 - Each CGI response header now invalidates caching
* Issue #66 - Username field too small
* Issue #72 - Apache license isn't applied correctly
* Issue #75 - Typo: datatbase in ConfigTest.pl
* Issue #77 - Seccubus incompatible with Nessus API 5.2.1
* Updated dependancies in RPM
* Fixed some minor DB error scripts
