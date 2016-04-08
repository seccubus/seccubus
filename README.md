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
xx-xx-201x - 2.21 - 
======================================

Enhancements
------------
* #308 - Rewrote the OpenVAS scan script with the following objectives:

  * Remove dependancy on the omp utility (because I don't have it on my Mac for starters)
  * XML parsing is now done with XML::Simple in stead of manually (which is fragile)
  * Better error handling

Improved the release process (see [https://www.seccubus.com/documentation/22-releasing/])

Bug Fixes
---------
* #289 - Online version test needs a unit test
* #269 - Correct handling of multiple address nodes in NMap XML
* #298 - OpenVAS6: fix scan and import to ivil 
* #297 - Port field abused to store port state
* #307 - OpenVAS integration was broken

Contributors
------------
[Floris Kraak](https://github.com/randakar) and [Davaro](https://github.com/Danvaro)
