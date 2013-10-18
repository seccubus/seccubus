Seccubus V2 Read Me
===================
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
* Nikto (local and remote)
* NMap (local and remote)
* SSLyze

For more information visit [www.seccubus.com]

xx-10-2013 - 2.3 - Improved stability
=====================================

Key new features / issues resolved
----------------------------------
Seccubus now checks the state of the DBI handle before performing queries
Improved handling of Nessus 5.2 file format
Fixed some issues related to the new backend filters

Bugs fixed (tickets closed):
----------------------------
* #84 - Nessus critical findings got severity 0
* #87 - Hostname ordering was weird because of wildards for hostnames
* #88 - '*' is not selected in filters when no filter is given
* #89 - Scans fail to import due to database timeouts
* #90 - Hostnames are not sorted in filters, IP addresses are
* OBS build script now echos link to OBS project
