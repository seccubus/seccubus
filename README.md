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
* Nikto (local and remote)
* NMap (local and remote)
* SSLyze

For more information visit [www.seccubus.com]

21-05-2014 - 2.6 - Bug Fixes
============================================
A couple of bugs are now fixed thanks to Arkanoi and SphaZ

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
