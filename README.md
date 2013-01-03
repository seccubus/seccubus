Seccubus V2 Change Log
======================
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.0 is nearing the end of the beta phase. This code is the active 
developed and maintained version and all support for Seccubus V1 will be dropped
soon. Seccubus V2 works with the following scanners:
* Nessus 4.x and 5.x (professional and home feed)
* OpenVAS
* Nikto 
* NMap

xx-xx-201x - 2.0.rc1
====================

Key new features / issues resolved
----------------------------------
* Email notifications when a scan starts and a scan ends

Bigs fixed (tickets closed):
----------------------------
#27 - Email Reporting
https://github.com/schubergphilis/Seccubus_v2/issues/27
#32 - RPM: Files in /opt/Seccubus/www/seccubus/json have no exec permissions
https://github.com/schubergphilis/Seccubus_v2/issues/32
#33 - User permission issues not reported correctly
https://github.com/schubergphilis/Seccubus_v2/issues/33
#35 - -p vs --pw (OpenVAS)
https://github.com/schubergphilis/Seccubus_v2/issues/35
#39 - SeccubusScans exports uninitilized VERSION
https://github.com/schubergphilis/Seccubus_v2/issues/39
