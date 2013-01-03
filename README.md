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
* Scan create and edit dialog now display default parameters
* do-scan now has a --no-delete option to preserve temporary files

Bigs fixed (tickets closed):
----------------------------
Issue #9 - Missing Hosts File in Nmap Scan
https://github.com/schubergphilis/Seccubus_v2/issues/9
Issue #14 - Permit --nodelete option on do-scan
https://github.com/schubergphilis/Seccubus_v2/issues/14
Issue #27 - Email Reporting
https://github.com/schubergphilis/Seccubus_v2/issues/27
Issue #32 - RPM: Files in /opt/Seccubus/www/seccubus/json have no exec permissions
https://github.com/schubergphilis/Seccubus_v2/issues/32
Issue #33 - User permission issues not reported correctly
https://github.com/schubergphilis/Seccubus_v2/issues/33
Issue #34 - $HOSTS vs @HOSTS confusion
https://github.com/schubergphilis/Seccubus_v2/issues/34
Issue #35 - -p vs --pw (OpenVAS)
https://github.com/schubergphilis/Seccubus_v2/issues/35
Issue #39 - SeccubusScans exports uninitilized VERSION
https://github.com/schubergphilis/Seccubus_v2/issues/39
Issue #42 - Nessus help (and scan?) not consistent with regards to the use of -p
https://github.com/schubergphilis/Seccubus_v2/issues/42
Issue #43 - Sudo option missing from NMAP scanner help (web)
https://github.com/schubergphilis/Seccubus_v2/issues/43

