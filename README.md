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

23-10-2015 - 2.20 - What is the issue?
======================================
This release introduces a major new feature that has been in my head since the beginning of Seccubus version 2: Issues.

An issue is a sort of trouble ticket that allows you to link multiple findings together, in order to help keeping track of the remediation process.
An issues can be linked to multiple findings (e.g. because you have the same finding across different hosts) and at the same time a single finding can be linked to multiple issue (e.g. multiple certificate issues found in a single finding).

If you want to know more about issue, please see the online documentation at [www.seccubus.com]

Enhancements
------------
# 238 - Issues

Bug Fixes
---------

