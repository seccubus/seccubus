Seccubus V2 Change Log
======================
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.0 is marks the end of the beta phase for the 2.0 branch.
This code is the only actively developed and maintained branch and all support 
for Seccubus V1 has officially been dropped. 

Seccubus V2 works with the following scanners:
* Nessus 4.x and 5.x (professional and home feed)
* OpenVAS
* Nikto 
* NMap
* SSLyze

For more information visit [www.seccubus.com]

22-01-2012 - 2.1 - Bugfix release
=================================

Key new features / issues resolved
----------------------------------
* 

Bigs fixed (tickets closed):
----------------------------
* Issue #50 & #51 - Scan notifications are not listed and cannot be editted
* Issue #52 - When running do-can with nmap as user seccubus with --sudo, chown on tmp files fails.
* Issue #53 - Broken path in debian package
* Issue #55 - Notifications table creates double header in certain cases
