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
12-7-2016 - 2.26 - Speed improvements and others
================================================
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