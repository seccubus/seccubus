---
layout: post
title: v 2.3 – Improved stability, Nmap and Nikto on remote hosts
---
Just after the performance release of version 2.2 we bring you Seccubus
version 2.3 which improves on v2.2 in three important ways.

  * Version 2.2 introduced some bugs in the sorting of host fields and these bug have been removed
  * Version 2.x had a database connection stability issue which is fixes
  * Version 2.3 allows you to run Nmap and Nikto scans on remote hosts in addition to the local host

You can download the release [from
GitHub](https://github.com/schubergphilis/Seccubus_v2/releases/tag/v2.3).

Here are the release notes:

    
    
    19-10-2013 - 2.3 - Improved stability, Nmap and Nikto on remote hosts
    ---
    
    Key new features / issues resolved
    ----------------------------------
    Seccubus now checks the state of the DBI handle before performing queries
    Improved handling of Nessus 5.2 file format
    Fixed some issues related to the new backend filters
    
    Bugs fixed (tickets closed):
    ----------------------------
    * #62 - Would like to be able to run Nmap/Nikto/SSLyze scans on a remote host
    * #84 - Nessus critical findings got severity 0
    * #87 - Hostname ordering was weird because of wildards for hostnames
    * #88 - '*' is not selected in filters when no filter is given
    * #89 - Scans fail to import due to database timeouts
    * #90 - Hostnames are not sorted in filters, IP addresses are
    * OBS build script now echos link to OBS project

