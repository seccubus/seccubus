Seccubus V2 Read Me
===================
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.x is the only actively developed and maintained branch and all support 
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

For more information visit [www.seccubus.com]

![Travis build status](https://travis-ci.org/schubergphilis/Seccubus_v2.svg?branch=master)

---
xx-xx-2016 - 2.25 - 
=============================================

...

Enhancements
------------
* #319 - RPM now builds and installs under CentOs/RHEL 5 too
* #320 - Nessus6 scanner now downloads PDF and HTML version of report too
* #312 - SSLLabs and Nessus6 scanner no longer depend on perl-REST-Client
* #322 - Removed old scanners: Nessus v5 and earlier, OpenVAS v5 and earlier
* Improved exit codes for the onlyonxday.sh utility

Bug Fixes
---------
* #323 - Non-critical warnings in unit tests fixed
* #305 - Finding change records are generated even if a finding did not actually change
* #327 - OpenVAS target is always created with the default portlist
* #328 - CopyRight year unit test appears to be broken on Travis
* #333 - LWP::UserAgent is missing method delete on RH5 and RH6
* #344 - Nessus6 scanner script using LWP::UserAgent is too brittle
