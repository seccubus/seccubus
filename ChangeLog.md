Seccubus V2 Change Log
======================

Seccubus automates regular vulnerability scans with vrious tools and aids
security people in the fast analysis of its output, both on the first scan and
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged
when they first appear in the scan results or when their output changes.

This code is the only actively developed and maintained branch and all support
for Seccubus V1 has officially been dropped.

Seccubus V2 works with the following scanners:
* Nessus 4.x, 5.x 6.x (professional and home feed)
* Skipfish (local and remote)
* OWASP ZAP Proxy (local and remote)
* OpenVAS
* Nikto (local and remote)
* NMap (local and remote)
* SSLyze
* Medusa
* Burp Suite
* Qualys SSL labs

For more information visit [www.seccubus.com]

17-09-2015 - 2.17 - GNU Terry Pratchett (Fixed!)
================================================
The bonanza of after summer fixes and small enhancements continues
Our dear contributor @Ar0xa notified us of a bug in v2.16 which has been fixed in this release
See bug #260

Bug Fixes
---------
* #260 - Runs not showing in Seccubus v2.16

15-09-2015 - 2.16 - GNU Terry Pratchett
=======================================
The bonanza of after summer fixes and small enhancements continues

Enhancements
------------
* #185 - GNU Terry Pratchett
* #214 - NMap, include port status in port number
* #223 - Make the Bulk Update feature much faster in the GUI
* #228 - SSL Labs: Warn if MaxAge is below the recommended 180 days
* #226 - Create Travis Unit tests for DB upgrade
* #241 - Unit tests for delta engine
* Moved to new Travis build infra. See: http://docs.travis-ci.com/user/migrating-from-legacy/

Bug Fixes
---------
* #180 - NMAP script output ignored
* #186 - Custom SQL table is missing from DB init scripts
* #198 - Unable to add more then 1 asset
* #199 - asset_host broken in v6 and upgrade problems
* #200: Error using ZAP remote
* Fixed ZAP file handling issue
* Fixed a new found bug in ivil2zap, more output now in findings
* Fixed SSLlabs error exception
* #213 - .spec file still references v4 data structures instead of v6
* #222 - SSL Labs: hasSct and sessionTickets findings not saved in IVIL file
* #224 - Bulk Update controller not updated after update of remark only
* #236 - Database upgrades inconsistent
* #243 - do-scan -q is not very quiet
* #247 - SSLLabs: certain values for PoodleTLS not handled
* #248 - SSLLabs Reneg finding empty is reneg is not supported 
* Copyright related unit tests now work on Travis CI too
* #252 - scannerparam column in scans table too small
* #255 - Incorrect use of CGI.pm may cause parameter injection vulnerability

13-08-2015 - 2.15 - Summer time bug fixes
=========================================
Using the quiet(er) time after summer to get some bug fixes in.

Enhancements
------------
* #211 - Host filter now splits on / as well as . 

Bug Fixes
---------
* #197 - Error loading nmap results
* #212 - Extraports not handled correctly when parsing nmap.xml
* #202 - SSLLabs scan results filtering per Asset broken
* #205 - SSLlabs test uses the dev version of the API by default in stead of the prod version
* #206 - SSLlabs scanner does not honor coolOff period
* #207 - ssllabs - poodleTLS is incorrecly stating vuln status
* #208 - SSLlabs script uses wrong bitwise and operator :(
* #209 - SSLlabs scanner does not attach results bug
* #210 - SSLlabs scanner did not call process results bug
* #212 - Extraports not handled correctly when parsing nmap.xml


23-02-2015 - 2.14 - SSL labs API
================================
The SSL labs scanner now uses the SSL labs API (see https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md) to check the SSL configuration of your website in stead of scraping the site.

Bug Fixes
=========
* No additional bugfixes

20-01-2015 - 2.13 - OWASP ZAP Proxy
======================================

Seccubus OWASP ZAP Proxy release

The OWASP Zed Attack Proxy (ZAP) is an easy to use integrated penetration testing tool for finding vulnerabilities in web applications.

It is designed to be used by people with a wide range of security experience and as such is ideal for developers and functional testers who are new to penetration testing as well as being a useful addition to an experienced pen testers toolbox. 

The intergration with Seccubus will make you able to launch the ZAP proxy scanner from the commandline and proccess the results into Seccubus. The default policy will be applicable when the scanner is launched. This can be altered by running the program "normally" with ./zap.sh and adjust the policy in the ZAP Gui

Download the OWASP ZAP Proxy and extract the tar.gz

http://sourceforge.net/projects/zaproxy/files/2.3.1/ZAP_2.3.1_Linux.tar.gz/download

More information about ZAP Proxy can be found here:
http://code.google.com/p/zaproxy/wiki/Introduction?tm=6

Don't forget you need a Java, Ubuntu example:
 sudo apt-get install openjdk-7-jre-headless

Below are some authentication options examples for ZAP usage:

ZAP option for authentication with session cookie:
 -o "-C JSESSIONID=KJHSAFKJH34SAFL572LKJ"

ZAP option for Basic Header authentication:
 -o "-A user:pass"

ZAP option for performing Login and authenticate and exclude logout URL:
 -o "--auth-form http://example.org/login --auth-user myuser --auth-pass mypass --auth-verify-url http://example.org/profile -X /logout"

Bug Fixes
============================================
* No bug fixes in this version, only release with OWASP ZAP support

10-10-2014 - 2.10 - Miami vice edition
======================================
* Password fields are used to store passwords and hide them in de GUI (#127)
* Limited support for OpenVAS6 and OpenVAS7 thanks to @FGuillaume
* Python script by @Ar0Xa to email findings from a scan
* Fixed some bugs

Bug Fixes
============================================
* #96  - Incorrect temp file usage Nikto scanner
* #120 - Post install chcon action gives error
* #124 - Multi file attachments
* #125 - rpm dependancy name is wrong
* #127 - Passwords can be hidden in the GUI
* #134 - SSLlabs scanner did not handle submit errors
* #135 - Host name creation not handled correctly with SSLlabs
* #136 - Workspaces are now sorted by name
* Extra cache control headers because of Chrome

18-08-2014 - 2.9 - Qualys SSLlabs integration
=============================================
Seccubus can now fetch the results of www.ssllabs.com automatic scanner and monitor for deltas

Bug Fixes
============================================
* #122 - SSLlabs integration
* #120 - SELinux problem on RHEL6
* #99 - The ability to remote is not reflected in the scanner help text
* #67 - -o usage needs to be more specific for e.g. nikto and nmap scanner
* #63 - Scan table does not display scanner correctly
* #59 - Explanation of $ATTACH: in notifications is not very clear

01-08-2014 - 2.8 - New scanner and Burp parser
============================================
Medusa is added to scanner tools thnx to @Arkanoi
Added burp parser to ivil thnx to @SphaZ 

Bug Fixes
============================================
A couple of bugs are now fixed thanks to Arkanoi and SphaZ

21-05-2014 - 2.6 - Bug Fixes
============================================
A couple of bugs are now fixed thanks to @Arkanoi and @SphaZ

26-02-2014 - 2.5 - Skipfish remote option
============================================

Key new features / issues resolved
----------------------------------
Large nessus scans failed
Password are not masked on screen

Bugs fixed (tickets closed):
----------------------------
Issue #105 - please mask scanner passwords
Issue #106 - long Nessus scan results are not loaded

============================================

xx-xx-2014 - 2.5 - Screen updates, restored
============================================

Key new features / issues resolved
----------------------------------

Bugs fixed (tickets closed):
----------------------------

19-12-2013 - 2.4 - Screen updates, restored
===========================================

Key new features / issues resolved
----------------------------------
A bug that broke the automatic updating of the GUI mast fixed

Bugs fixed (tickets closed):
----------------------------
#97 - Screen refresh doesn't work anywhere (basically)

18-10-2013 - 2.3 - Improved stability, Nmap and Nikto on remote hosts
=====================================================================

Key new features / issues resolved
----------------------------------
Seccubus now checks the state of the DBI handle before performing queries
Improved handling of Nessus 5.2 file format
Fixed some issues related to the new backend filters

Bugs fixed (tickets closed):
----------------------------
* #62 - Would like to be able to run Nmap/Nikto/SSLyze scans on a remote host
* #84 - Nessus critical findings got severity 0
* #87 - Hostname ordering was weird because of wildards for hostnames
* #88 - '*' is not selected in filters when no filter is given
* #89 - Scans fail to import due to database timeouts
* #90 - Hostnames are not sorted in filters, IP addresses are
* OBS build script now echos link to OBS project

15-10-2013 - 2.2 - Nessus 5.2.1, unicode and performance
========================================================

Key new features / issues resolved
----------------------------------
* Major performance increase by moving processing of sttus buttons and filters to bac
kend
* Resolved an issue that cause incomptibility with Nessus API version 5.2.1 (Thanks Trelor)
* Resolved an issue around encoding of Unicode chracters in Nessus output
* Added shell script to execute crontab job only on a certain day
* Added shell script to execute crontab job only on a weeknumber that can be devided by a certain number
* Correct application of Apache license is now part of the unit tests
* Resolved some caching issues with IE

Bigs fixed (tickets closed):
----------------------------
* Issue #48 - Filters need to be processed in backend, not front end
* Issue #50 - Notification table not displayed on edit scan
* Issue #56 - IVIL conversion shell call needs qoutes around filename
* Issue #64 - New scan dialog shows 'new workspace' in title
* Issue #65 - Each CGI response header now invalidates caching
* Issue #66 - Username field too small
* Issue #72 - Apache license isn't applied correctly
* Issue #75 - Typo: datatbase in ConfigTest.pl
* Issue #77 - Seccubus incompatible with Nessus API 5.2.1
* Issue #78 - Unicode in nessus file breaks ivil import
* Issue #86 - getFilters API
* Updated dependancies in RPM
* Fixed some minor DB error scripts

02-02-2012 - 2.1 - Bugfix release
=================================

Key new features / issues resolved
----------------------------------
* Bugfixes

Bigs fixed (tickets closed):
----------------------------
* Issue #50 & #51 - Scan notifications are not listed and cannot be editted
* Issue #52 - When running do-can with nmap as user seccubus with --sudo, chown on tmp files fails.
* Issue #53 - Broken path in debian package
* Issue #55 - Notifications table creates double header in certain cases


22-01-2012 - 2.0 - The Alt-S version
====================================

Key new features / issues resolved
----------------------------------
* Email notifications when a scan starts and a scan ends
* Scan create and edit dialog now display default parameters
* do-scan now has a --no-delete option to preserve temporary files
* SSLyze support

Bigs fixed (tickets closed):
----------------------------
* Issue #9 - Missing Hosts File in Nmap Scan
* Issue #14 - Permit --nodelete option on do-scan
* issue #26 - Update installation instructions
* Issue #27 - Email Reporting
* Issue #32 - RPM: Files in /opt/Seccubus/www/seccubus/json have no exec permissions
* Issue #33 - User permission issues not reported correctly
* Issue #34 - $HOSTS vs @HOSTS confusion
* Issue #35 - -p vs --pw (OpenVAS)
* Issue #39 - SeccubusScans exports uninitilized VERSION
* Issue #42 - Nessus help (and scan?) not consistent with regards to the use of -p
* Issue #43 - Sudo option missing from NMAP scanner help (web)

11-10-2012 - 2.0.beta6 - The final Beta
=======================================

New features / Issues resolved
------------------------------
* Sourcecode repository is now
  [GitHub] (https://github.com/schubergphilis/Seccubus_v2/issues/6) in stead of   SourceForge
* Build is now automated using a Jenkins server at Schuberg Philis including
  the creation of RPMs and Debian packages via OpenSuse build services
* Fixed a few bugs
    
Bigs fixed (tickets closed):
----------------------------
* #7  - Import error on scan results from OpenVAS 3.0.1
* #7  - Error converting OpenVAS .nbe to IVIL
* #11 - ConfigTest is more verbose when it fails due to a missing config file
* #12 - Installation error with tarball
* #15 - Ungroup Compliance Scans
* #16 - More gracefull error handling when Nikto doesn't find a config
* #17 - File ~/scanners/Nikto/scan has no execute permission
* ##  - Fixed a broken symlink in the development environment
* #23 - Nessus xmlRPC port can now be selected
* #25 - Fixed tarball installation error
* #29 - JMVC framework updated to version 3.2.2
    
15-8-2012 - 2.0.beta5 
=====================
This is basically version 2.0.beta4 with a nasty critical error removed.

New features / Issues resolved
------------------------------
Removed an error that caused the previous version to fail

Bigs fixed (tickets closed):
----------------------------
91 - Scan_ids is a mandatory parameter

10-6-2012 - 2.0.beta4 
=====================

New features / Issues resolved
------------------------------
Fixed major performance issues
Fixed installer bug

Bigs fixed (tickets closed):
----------------------------
82 - Install.pl fails to write all necesary files
83 - convert_v2_v2 does not work with default install directory from RPM (/var/lib/seccubus)
84 - getWorkspaces slow with large database
85 - getScans slow with large databases
86 - getFindings slow with workspaces with lots of findings

14-3-2012 - 2.0.beta3 (a.k.a. the Blackhat edition)
==================================================

New features / Issues resolved
------------------------------
* Nessus5 tested and found compatilble
* Findings can now be opened and edited individually
* The edit finding dialog shows the change history of the finding
* Long(ish) findings now render with a more link that allows you to expand the
  the finding, causing the findigns table to generally dispaly more compact.
* Clarified the purpose of status buttons, filters and bul update form in GUI.
* Added the capability to filter on severity, finding text and remark text
* Added the ability for scan scripts to add attachments to runs
* All scan scripts add attachments to runs
* Script to convert Seccubus v1 data to V2 data adds attachments to runs
* Scan history can now be viewed in the GUI and attachments can be dowloaded
* IP numbers now sort correctly
* Restyled status buttons and edit button
* Removed www/oldstyle GUI
* Removed Seccubus.Scan.List

Bigs fixed (tickets closed):
----------------------------
60 - Not all items from a Nikto scan appear to create a finding in Seccubus
https://sourceforge.net/apps/trac/seccubus/ticket/60
62 - Default locations for config.xml does not include ~seccubus/etc/config.xml
https://sourceforge.net/apps/trac/seccubus/ticket/62
67 - Links in top right of UI do nothing
https://sourceforge.net/apps/trac/seccubus/ticket/67
71 - Scan result should "window shade" in the UI to hide lengthy text
https://sourceforge.net/apps/trac/seccubus/ticket/71
75 - Bulk update: Comments only get added when you select overwrite
https://sourceforge.net/apps/trac/seccubus/ticket/75
74 - Minor bugs in nmap2ivil when using nmap 5.21
https://sourceforge.net/apps/trac/seccubus/ticket/74

17-01-2012 - 2.0.beta2
======================
New features / Issues resolved
------------------------------
Workspace management tab
* Create workspaces
* Modify workspaces
Scan management tab
* Create scans
* Edit scans
Developer documentation updated
End user documentation updated

Bigs fixed (tickets closed):
----------------------------
62 - Default locations for config.xml does not include ~seccubus/etc/config.xml
https://sourceforge.net/apps/trac/seccubus/ticket/62
57 - Scan names with two words not handled correctly
https://sourceforge.net/apps/trac/seccubus/ticket/57
54 - Scanner selection wasn;t dynamic in the GUI
https://sourceforge.net/apps/trac/seccubus/ticket/54
53 - nessus2ivil still contains references to nbe
https://sourceforge.net/apps/trac/seccubus/ticket/53

07-01-2012 - 2.0.beta1
======================
New features / Issues resolved
------------------------------
With this release Seccubus goes into BETA phase. It also marks the end of
active development for Seccubus V1 (last current version is 1.5.5)
Seccubus V1 is still maintained at a minimum level, meaning that if bugs are
found and they are not too complex to fix, they will be fixed, but no new
features will be added to the V1 branch of the product.

GUI rewrite
-----------
Old GUI is in /oldstyle
Complete GUI code was rewritten using JMVC framework
Those www api calls needed to make this current GUI work have been rewritten
to JSON
New, less confusing, layout of Findings screen

Bigs fixed (tickets closed):
----------------------------
49 - Incorrect status selection possible in GUI for Gone findings
https://sourceforge.net/apps/trac/seccubus/ticket/49
58 - Cannot give GONE findings the status CLOSED 
https://sourceforge.net/apps/trac/seccubus/ticket/58


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

13-09-2011 - 2.0.alpha4
=======================
New features / Issues resolved
------------------------------

### Nmap support
Scanning with is supported from the same server that is running the Nessus
Seccubus GUI
### The results of the Nessus Policy Compliance family of plugins is now
supported
These plugins are different in the sense that they return multiple results
all direntified by a single pluginID

Bigs fixed (tickets closed):
----------------------------
#8 - Integrate nmap scans into Seccubus
https://sourceforge.net/apps/trac/seccubus/ticket/8
#50 - scanners/nessus/scan should give a clear error message when ruby is
not on system
http://sourceforge.net/apps/trac/seccubus/ticket/50

15-08-2011 - 2.0.alpha3
=======================
New features / Issues resolved
* Major bug in the delta engine resolved. It turned out that statusses where
  not processed after a scan, but was called by the load_ivil utility.

Bugs fixed:
-----------
#36 - Nessus scans don't seem to see targets
https://sourceforge.net/apps/trac/seccubus/ticket/36
#12 - Gone hosts not not detected correctly
https://sourceforge.net/apps/trac/seccubus/ticket/12
#42 - Scan parameters --workspace and --scan should be added automatically
https://sourceforge.net/apps/trac/seccubus/ticket/42

17-03-2011 - 2.0.alpha2 
=======================
New features / Issues resolved
------------------------------
Fixed slow speed of updates to multiple findings  
Scanning with Nessus should work a lot better in this version

Bug fixed:
----------
#30 - Document running scans
https://sourceforge.net/apps/trac/seccubus/ticket/30
#32 - load_ivil command line argument 'scan' is ignored
https://sourceforge.net/apps/trac/seccubus/ticket/32
#34 - Default port for OpenVAS scanning not set correctly
https://sourceforge.net/apps/trac/seccubus/ticket/34
#35 - ivil does not import title of Nessus finiding
https://sourceforge.net/apps/trac/seccubus/ticket/35
#37 - @HOSTS gets expanded to /tmp/seccus.hosts.PID in stead of
/tmp/seccubus.hosts.PID
https://sourceforge.net/apps/trac/seccubus/ticket/37
#38 - nessus2ivil should not die on unknown attribute
https://sourceforge.net/apps/trac/seccubus/ticket/38

15-03-2011 - 2.0.alpha1 - First internal alpha release
======================================================
