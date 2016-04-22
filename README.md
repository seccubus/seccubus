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
* Nessus 4.x and 5.x (professional and home feed)
* Skipfish
* OpenVAS
* Medusa (local and remote)
* Nikto (local and remote)
* NMap (local and remote)
* OWASP-ZAP (local and remote)
* SSLyze
* Medusa
* Burp Suite
* Qualys SSL labs

For more information visit [www.seccubus.com]

![Travis build status](https://travis-ci.org/schubergphilis/Seccubus_v2.svg?branch=master)

---
22-04-2016 - 2.24 - RPM and cert improvements
=============================================

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
