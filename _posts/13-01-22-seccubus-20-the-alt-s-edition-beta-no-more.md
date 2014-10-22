---
layout: post
title: Seccubus 2.0 – The Alt-S edition (Beta no more)
---

Seccubus V2 works with the following scanners:  
* Nessus 4.x and 5.x (professional and home feed)  
* OpenVAS  
* Nikto  
* NMap  
* SSLyze  
  



For more information visit [www.seccubus.com](http://www.seccubus.com)  
  



22-01-2012 - 2.0 - The Alt-S version  
---  
  



Key new features / issues resolved  
----------------------------------  
  



* Email notifications when a scan starts and a scan ends  
* Scan create and edit dialog now display default parameters  
* do-scan now has a --no-delete option to preserve temporary files  
* SSLyze support  
  



Bigs fixed (tickets closed):  
----------------------------  
* [Issue #9](https://github.com/schubergphilis/Seccubus_v2/issues/9) - Missing Hosts File in Nmap Scan  
* [Issue #14](https://github.com/schubergphilis/Seccubus_v2/issues/14) - Permit --nodelete option on do-scan  
* [Issue #26](https://github.com/schubergphilis/Seccubus_v2/issues/26) - Update installation instructions  
* [Issue #27](https://github.com/schubergphilis/Seccubus_v2/issues/27) - Email Reporting  
* [Issue #32](https://github.com/schubergphilis/Seccubus_v2/issues/32) - RPM: Files in /opt/Seccubus/www/seccubus/json have no exec permissions  
* [Issue #33](https://github.com/schubergphilis/Seccubus_v2/issues/33) - User permission issues not reported correctly  
* [Issue #34](https://github.com/schubergphilis/Seccubus_v2/issues/34) - $HOSTS vs @HOSTS confusion  
* [Issue #35](https://github.com/schubergphilis/Seccubus_v2/issues/35) - -p vs --pw (OpenVAS)  
* [Issue #39](https://github.com/schubergphilis/Seccubus_v2/issues/39) - SeccubusScans exports uninitilized VERSION  
* [Issue #42](https://github.com/schubergphilis/Seccubus_v2/issues/42) - Nessus help (and scan?) not consistent with regards to the use of -p  
* [Issue #43](https://github.com/schubergphilis/Seccubus_v2/issues/43) - Sudo option missing from NMAP scanner help (web)

