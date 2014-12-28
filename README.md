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

---

Release notes
=============
Thanks for this release goes to Alexander Smirnoff (@Akranoi) and his employer Parallels Inc.

Alexander whipped together the Nessus 6 compatibility, fixed issues with the Qualys SSLlabs scanner.
Further more his employer Parallels Inc. sponsored the development of the asset management and custom
SQL feature.

28-12-2014 - 2.11 - Nessus 6 compatibility, assets, custom SQL and more
======================================
* Nessus 6 compatibility release. Tennable decided to change the Nessus API between 
versions 5 and 6, therefore the Nessus plugin did not work correctly with version 6 
anymore. Alexander Smirnoff was kind enough to provide a new Nessus6 scanner plugin that
supports the new Nessus API.
* Added asset management and the ability to execute custom SQL to Seccubus
* Added indexes to findings (host,port,plugin) to speed up large DB queries

Bug Fixes
============================================
* #140 - Nessus 6 integration
* #141 - Multiple issues with Qualys SSLlabs scanner
* #144 - Perl-CGI is bundled with perl 5.8 rpm's so no need to bundle it
* #152 - Pull request for Asset management
* #159 - It was impossible to launch scan with policy that lacks template UUID
