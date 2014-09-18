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

For more information visit [www.seccubus.com]

18-08-2014 - 2.10 - Quick fixes
=============================================
Fixed some bugs

Bug Fixes
============================================
* #134 - SSLlabs scanner did not handle submit errors
* #127 - rpm defendancy name is wrong
* #120 - Post install chcon action gives error
* #96  - Incorrect temp file usage Nikto scanner
* #124 - Multi file attachments
