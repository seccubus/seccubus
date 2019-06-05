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
* Nessus
* OpenVAS
* Skipfish
* Medusa (local and remote)
* Nikto (local and remote)
* NMap (local and remote)
* OWASP-ZAP (local and remote)
* SSLyze
* Medusa
* Qualys SSL labs
* testssl.sh (local and remote)


For more information visit [www.seccubus.com]

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

5-11-2018 - v2.50 - Seccubus Alpine
===================================
This release brings new Alpine based docker containers and fixes a compatibility issue with MySQL/MariaDB version 8 and above.

Differences with 2.48

Enhancements
------------
* Seccubus containers are now built based on Alpine
* Minimal specialized docker containers available for front end, api, front end+api, perl and cron

Bug Fixes
---------
* Seccubus rpm's are now also being built for Fedora version 27 and 28
* RPMs for Fedora version 25 depricated
* Fixed building of supporting Centos v7 rpms
* #585 - Added default credentials to the readme file
* #660 - Sudo added to docker images
* #655 - Shell set to /bin/bash for user seccubus
* #662 - Fixing documentation typos
* #673 - PERL5LIB set to /opt/seccubus for seccubus user via debian package

9-5-2018 - v2.48 - Tenable.io compatibility and more
====================================================
This release is fully compatible with the Tenable.io vulnerability management platform.

Differences with 2.46

Enhancements
------------
* Seccubus now support Tenable.io as a scanning platform
* Added parsing of the ROBOT (bleichenbacher) attack to the SSLlabs scanner
* Added a dev environment example config
* Increased the size of the scannerparam field in the database

Bug Fixes
---------
* #635 - Hypnotoad path was set incorrectly in systemd startup script on CentOS 7
* #642 - Updated readme to address how to run a scan on a running container
* Fixed an error in the Docker examples in README.md
* Added zip to the docker image because it is needed for import/export


14-12-2017 - v2.46 - RedHat 7 / Centos 7 packages
=================================================
This release adds RPM support for RedHat 7 and CentOS 7. Because Mojolicious and some of its dependancies were not available
as RPM on any of the standard repos for el7 we are also buildign these RPMs as part of our el7 build street now and are
pushing these packages to our [packagecloud.io](https://packagecloud.io/seccubus) repository. This makes tweaks like [this one](https://t.co/svO7z1RiRb) by @Ar0xA unneccasary.

Enhancements
------------
* Added support for RedHat 7 / CentOS 7 RPM packages. With the extra needed packages being added to packagecloud.io

Bug Fixes
---------
* #588 - Fix Nmap Plugin ID leak (Thanks @alirezakv)
* #589 - Fix OpenVAS scan execution bug with only 1 target defined (Thanks @alirezakv)
* #603 - Nessus scan fails when pdf files cannot be exported (Thanks @Ar0xA)
* #615 - Docker: when the database was on the data volume the database failed to start

15-11-2017 - v2.44 - PackageCloud release
==================================================================
This release clean up technical debt. Package building has been moved from OpenSuse Build Services to CicleCI
and packages now automatically are uploade to [our PackageCloud repositories](https://packagecloud.io/seccubus/).
Here you will find two repositories:
* [Latest](https://packagecloud.io/seccubus/latest) - Follows the latest code that gets merged into the master branch
* [Releases](https://packagecloud.io/seccubus/releases) - Follows the regular releases

You can configure these repositories on your operating system to include Seccubus upgrades in your regular package updates.

Enhancements
------------
* #597 - do-scan and import ivil now log to syslog
* #605 - Container scan command allows scans to only starts on a certain weekday
* Fedora, Ubuntu and Debian package building has been moved to CircleCI
* Packages are automatically uploaded to [packagecloud.io](https://packagecloud.io/seccubus/seccubus)


Bug Fixes
---------
* #593 - Fixed incorrect parsing of the values for poodleTls finding in SSLlabs.
* #595 - Fixed incorrect parsing of the values for Ticketbleed finding in SSLlabs.

20-10-2017 - v2.42 - Kali, Certificate validation and State Engine
==================================================================
Three major improvements in this release:

* It fixes a big issue with the validation of SSL certificates. Certificate validation was cot correctly turned off in the Nessus scanner when an internal scanner is used
* Debian packages now work on Debian, Ubuntu and Kali
* The state engine still had a bug when findings needed to recover from the Gone status


Enhancements
------------
* Unit testing moved from Circle CI v1.0 to CircleCI v2.0 to increase testing speed
* Now also building .deb file on Circle CI and testing them against debian v8 and v9, Ubuntu and Kali Linux


Bug Fixes
---------
* #580 - --cdn option did not add IPs to finding if findings were not consitent across endpoints
* #572 - Issues with disabling SSL verification in Nessus
* #571 - @SHoekstra fixed: testssl scan fails on docker because hexdump is not installed
* #563 - Fixed an issue with picking the wrong color for notes (Severity 4)
* #533 - Installation of .deb package on Kali failed (Thanks @rhertzog)
* #509 - Fixed a bug in the state engine, causing incorrect recovery from gone when an issue was previously closed
* Fixed an issue where duplicate asset_hosts were created on certain platforms (e.g. docker)
* Fixed an issue in how filters were composed if
* Removed debug output from entrypoint.sh
* Fixed git complaining about unrelated histories

15-9-2017 - v2.40 - Fixes and improvements
==========================================

This release mainly fixes installation issues on Debian and issue in docker that are due to the PERL5LIB path
that doesn't include the current directory anymore.
It also fixes the issue where people were unable to connect to a Nessus instance with a self signed certificate
that was trigged by altered behaviour of a perl library.
I've also fixed and tweaked the user interface a bit.


Enhancements
------------
# #539 - Status tab will become the default instead of the login tab if there is a config issue


Bug Fixes
---------
* #499 - Status change buttons in findings grid not working
* #529 - No all buttons were working correctly when working with linked issues
* #536 - Seccubus did not install on debian because openssl passphrase was too short (also effected docker container)
* #534 - Fixed an error that prevented connections to a Nessus instance with a self signed certificate on certain OSes
* #542 - Docker broken
* #548 - Notifications editor did not work correctly
* #549 - Deleting notifications did not work correctly
* #559 - PERL5LIB path was not set in cron container
* #563 - Removed some dedug output

2-8-2017 - v2.38 - Various fixes and improvements
=================================================

We've fixed various bug and implemented some enhancements in this version.

Enhancements
------------
* #421 - Implemented a scoring system for SSLlabs findings
* #477 - Finding coloring better reflects the urgency now
* #464 - Scan objects in Nessus are now reused in stead of created from scratch
* #500 - Added --cdn switch to testssl.sh too
* #504 - Changed container crontab shell for sh to bash
* #506 - Allow cron email to be sent externally
* #512 - New ssllabs finding httpForwarding
* #522 - You can now configure which formats get exported from nessus

Bug Fixes
* #490 - --cdn switch doesn't work as expected
* #491 - Help message of load_ivil didn't align nicely
* #492 - Finding history wasn't showing in the GUI
* #494 - Prototype mismatch warning in Nessus scanner
* #502 - Incorrect path set when using CRON in a container
* #507 - It is not longer possible to add duplicate users
* #522 - Nessus scans now get correctly recycled or created

29-6-2017 - v2.36 - TestSSL.sh release
======================================

This release has been in the making for a long time. In fact the first pull
request for it's main feature was back in June 2016 by our friend and then
colleague Glenn ten Cate.

This release marks the integration of Dirk Wetter's excellent tool testssl.sh
into Seccubus. With testssl.sh you can get a detailed overview of how well
your TLS enabled service is set up. Not just for websites, but for any TCP
service, even those that use STARTTLS.

In addition we introduced the --cdn switch for ssllabs, to reduce noise for
CDN enabled sites, we the ability to dynamically create users via JIT
provisionsing and we added CSRF protection for enhanced security.

To boost future code quality, Perl::Critic testing has been integrated in the
unit testing process.

Besides that we squased some bugs, five of which got introduced in the previous release :(

Enhancements
------------
#302 - Testssl.sh support for Seccubus
#401 - JIT provisioning of users
#442 - Add --cdn option to ssllabs
* Perl Critic is now part of unit testing. All critique was handled

Bug Fixes
---------
* #132 - We have CSRF protection now. Non-get requests should have content-type application/json.
* #461 - Update button on finding edit screen isn't working properly
* #474 - Some typo/style fixes by Jericho (attrition.org)
* #478 - Conralive should check if cron isn't ignored
* #480 - Editing/showing notifications broken
* #483 - add_user broken
* #484 - Failure to update 1+n scan configuration in Manage Scans (And all other update funtions)

15-6-2017 - v2.34 - Backemnd rewritten in Mojolicious
=====================================================

The Seccubusd backend has been REST-ish ever since release v2.0. This web backend was implemented
via Perl CGI scripts (yes, using CGI.pm). Needless to say something needed to change.

This backend rewrite has been in the making for some time now and we are finally ready to release
it into the wild.

What are the major changes?
* Backend rewritten in [Mojolicious](http://mojolicious.org/)
* Backend API is now REST compliant and located at /api
* There is no need to run an external webserver for Seccubus, it is built into Mojolicious
* Seccubus now has built in user authentication (Defaqult admin password is 'GiveMeVulns!')
* Fixed a lot off old issues
* Unfortunately there is no solid Mojolicious v6/v7 rpms for RedHat/Centos, so we can no longer provide RPMs for those operating systems

Enhancements
------------
* #411 - Ported the backend to Mojolicious and pure REST
* #448 - Allow import and export utility to read config from specific file

Bug Fixes
---------
* Fixed a weird sorting bug when using Chrome
* #138 - Can't locate SeccubusV2.pm in @INC (you may need to install the SeccubusV2 module)
* #143 - Make RPM so that nginx is supported too
* #171 - column formatting in custom SQL is off
* #190 - XSS in custom SQL query
* #193 - RFE: please add a logout button for additional security
* #263 - SeccubusHelpers.pm contains two unused functions
* #363 - API calls for asset use workspace iso of workspaceId which is the standard
* #384 - Missing SMTP server config should be warning, not error
* #396 - ConfigTest should return non 200 if config is not ok
* #417 - Docker container is not https-enabled by default
* #418 - Docker images lacks proper data management
* #430 - Set correct paths for perl and nikto so that do-scan and nikto can now be run by any user
* #445 - RPM errors
* #457 - Mine attachment not sent correctly
* #465 - JSON::false returns "false" on certain platforms
* #466 - /api/version should not be an authenticated call

18-4-2017 - v2.32 - Added dist tag to RPM filename
==================================================

This release is a fixup release of version 2.30. It fixes two errors in import/export and provides
specific RPMs for el5, el6 and el7 now.

Enhancements
------------

Bug Fixes
---------
#438 - Export failed when a scan did not have any attachments
#440 - Import fails if issue it is linked is older then before
#443 - Added dist tag to RPM filename

13-4-2017 - v2.30 -  Improved delta engine and import and export tools
======================================================================

One of the things that has been lacking for a while were proper workspace export and import tools. This release adds them and fixes another issue that has been on our whishlist for long, better handling of gone findings reappearing.

Now when a finding that was previously marked as gone reappears in a scan the 'status before gone' is taken into account.

When the 'status before gone' was:
* New - The finding will reappear as new
* Changed - The finding will reappear as changed
* Open - The finding will reappear as open, unless the finding text has changed, then it will reappear as changed
* No issue - The finding wil reappear as no issue, unless the finding text has changed, then it will reappear as changed
* MASKED - The finding will stay MASKED

Enhancements
------------
* #126 - Delta engine improved: Beter recovery from GONE findings
* #257 - Import/export tools added
* #408 - Seccubus now refuses to load an ivil file with 0 findings
* #412 - Disabled tofu to enhance Docker support
* #419 - Enable crontab support in docker images
* #423 - Show futureGrade in SSLlabs scan results

Bug Fixes
---------
* #403 - SSLlabs scanner help file was not up to date
* #414 - Mkdir error will no longer appear if entrypoint.sh is run twice
* #426 - Corrections to README.md from Karol Kozakowski merged
* #432 - StaticPkpPolicy not recognized

20-2-2017 - v2.28 - The Docker edition
======================================

For my work at [Schuberg Philis](https://www.schubergphilis.com) we wanted to run Seccubus in Docker
containers. This and inspiration from [Karl Newell](https://hub.docker.com/r/karlnewell/seccubus/)
caused me to add a Dockerfile (and some other files) to Seccubus so that Seccubus can now be
run in a docker container.

In addition I fixed a couple of bugs and changed the ssllabs scanner so it now uses the v3 API endpoint.

## Enhancements
- #361 - arkenoi created a netsparker2ivil tool that allows you to manually import Netsparker scans
- #331 - Now using SSLLabs API v3
- #386 - New SSL labs API output featues incorporporated
- #389 - API endpoint URL has moved to a single function so it can be patched if deployed in a
       three tier architecture
- #392 - Alternative handling of the updateFIndings.pl API
- #397 - Allow seccubus to authenticate via an http request header
- #399 - Create a Docker container for Seccubus

## Bug Fixes
- #364 - auto_gen column was missing from asset_host table
- #358 - Could not get findings when an asset was used for the query
- #360 - Not able to export report in PDF format - This breaks the scan
- #336 - Non-critical RPM errors on CentOS 5
- #376 - Removed 50 host limit in filters as it was counterproductive
- #374 - Fixed Nikto path detection code
- #377 - Hostname filter wasn't working correctly, typed Hostname iso HostName
- #385 - SSLlabs failed because cypher preference order was split out per protocol by SSLlabs now.
- #394 - SSLlabs scanner failed if all enpoints fail and --gradeonly was used

Docker image at https://hub.docker.com/r/seccubus/seccubus/

12-7-2016 - 2.26 - Speed improvements and a whole log of bugfixes
=================================================================
This release is especially interesting for those of you that are working with large result sets.
The number of findigns that is returned is now limited to 200 results by default and can be adjusted
up or down.
A lot of the filter logic has been moved from the Perl backend to more intelligent database queries
where caching and other optimalisations techniques prevent timeouts when working with larger result
sets.

Additional improvements are done the rpm packaging and the Nessus6 scanner wich now no longer depends
on certain excotic perl modules.

The number of change records that is created and displayed has been reduced and some other more minor
have been fixed too.

Enhancements
------------
* #128 - Limit the amount of findings that is returned from the back end
* #312 - SSLLabs and Nessus6 scanner no longer depend on perl-REST-Client
* #319 - RPM now builds and installs under CentOs/RHEL 5 too
* #320 - Nessus6 scanner now downloads PDF and HTML version of report too
* #322 - Removed old scanners: Nessus v5 and earlier, OpenVAS v5 and earlier
* Improved exit codes for the onlyonxday.sh utility

Bug Fixes
---------
* #344 - Nessus6 scanner script using LWP::UserAgent is too brittle
* #330 - Add perl-LWP-Protocol-https as RPM dependency
* #328 - CopyRight year unit test appears to be broken on Travis
* #327 - OpenVAS target is always created with the default portlist
* #323 - Non-critical warnings in unit tests fixed
* #333 - LWP::UserAgent is missing method delete on RH5 and RH6
* #305 - Finding change records are generated even if a finding did not actually change
* #300 - Editing an issue and updating the severity doesn't work
* #295 - Trigger in notification edit will fall back to previous on re-edit
* #277 - Remove redundant documentation from source tree
* #183 - SSL validation ingore not corretly implemented

22-04-2016 - 2.24 - RPM and cert improvements
=============================================

Not everything went perfect upgrading the build process, so we had to tweak the RPM a little and fix an error in the UpToDate.pl script.

Enhancements
------------
* #310 - Root CA for v2.seccubus.com ([LetsEncrypt](https://letsencrypt.org/)) is now pinned for the version check
* #316 - Clarify create database and grant statement in ConfigTest.pl

Bug Fixes
---------
* #310 - Version check does not like my certificate
* #311 - RPM: Config could not be found after version upgrade to 2.22
* #313 - RPM: Seccubus.conf not placed in correct directory (v2.22)
* #314 - RPM: v2.22 /opt/seccubus/www/dev should not exist
* #315 - RPM: v2.22 dependancy mysql-server is not installed

08-04-2016 - 2.22 - OpenVAS intergration fixed
==============================================

Enhancements
------------
* Improved the release process (see [https://www.seccubus.com/documentation/22-releasing/])
* #308 - Rewrote the OpenVAS scan script with the following objectives:

  - Remove dependancy on the omp utility (because I don't have it on my Mac for starters)
  - XML parsing is now done with XML::Simple in stead of manually (which is fragile)
  - Better error handling


Bug Fixes
---------
* #289 - Online version test needs a unit test
* #269 - Correct handling of multiple address nodes in NMap XML
* #298 - OpenVAS6: fix scan and import to ivil
* #297 - Port field abused to store port state
* #307 - OpenVAS integration was broken

28-10-2015 - 2.20 - What is the issue?
======================================
This release introduces a major new feature that has been in my head since the beginning of Seccubus version 2: Issues.

An issue is a sort of trouble ticket that allows you to link multiple findings together, in order to help keeping track of the remediation process.
An issues can be linked to multiple findings (e.g. because you have the same finding across different hosts) and at the same time a single finding can be linked to multiple issue (e.g. multiple certificate issues found in a single finding).

If you want to know more about issue, please see the online documentation at [www.seccubus.com]

Enhancements
------------
#238 - Issues

Bug Fixes
---------
#244 - Database model and database not consistent anymore

08-10-2015 - 2.18 - Fixed a notifications error
================================================
Some people noticed that notifications were not visible anymore, Jordan and I fixed them

Enhancements
------------
* Unit tests for notifications API

Bug Fixes
---------
* #267 - Email notification config is not showing

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
