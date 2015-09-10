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

Release notes
=============

13-08-2015 - 2.16 - 
=========================================
This version fixes an issue where the output of NMap scripts (NSE) was completly ignored

Enhancements
------------
* #185 - GNU Terry Pratchett
* #214 - NMap, include port status in port number
* #223 - Make the Bulk Update feature much faster in the GUI
* #228 - SSL Labs: Warn if MaxAge is below the recommended 180 days
* #226 - Create Travis Unit tests for DB upgrade
* #241 - Unit tests for delta engine

Bug Fixes
---------
* #180 - NMAP script output ignored
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