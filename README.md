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
* SSLyze
* Medusa
* Burp Suite
* Qualys SSL labs

For more information visit [www.seccubus.com]

Release notes
=============

??-??-2014 - 2.11 - 
======================================
Added asset management and the ability to execute custom SQL to Seccubus

Bug Fixes
============================================
* #141 - Multiple issues with Qualys SSLlabs scanner
* #144 - Perl-CGI is bundled with perl 5.8 rpm's so no need to bundle it
* #152 - Pull request for Asset management
