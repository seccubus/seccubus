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
* OpenVAS
* Nikto (local and remote)
* NMap (local and remote)
* SSLyze

For more information visit [www.seccubus.com]

xx-xx-2014 - 2.5 - Screen updates, restored
============================================
* Local Nikto and NMap scanning is working again

Key new features / issues resolved
----------------------------------
Fixed issue that broke local Nikto and NMap scanning

Bugs fixed (tickets closed):
----------------------------
#102 - Local Nikto scanning is broken
