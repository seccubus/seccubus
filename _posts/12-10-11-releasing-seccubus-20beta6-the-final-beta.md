---
layout: post
title: Releasing Seccubus-2.0beta6 – The final beta
---

11-10-2012 - 2.0.beta6 - The final Beta
---

New features / Issues resolved
------------------------------
* Sourcecode repository is now  GitHub (https://github.com/schubergphilis/Seccubus_v2/issues/6) in stead of  SourceForge
* Build is now automated using a Jenkins server at Schuberg Philis including
  the creation of RPMs and Debian packages via OpenSuse build services
* Fixed a few bugs

Bigs fixed (tickets closed):
----------------------------
* #7  - Import error on scan results from OpenVAS 3.0.1
* #7  - Error converting OpenVAS .nbe to IVIL
* #11 - ConfigTest is more verbose when it fails due to a missing config file
* #12 - Installation error with tarball
* #15 - Ungroup Compliance Scans
* #16 - More gracefull error handling when Nikto doesn't find a config
* #17 - File ~/scanners/Nikto/scan has no execute permission
* ##  - Fixed a broken symlink in the development environment
* #23 - Nessus xmlRPC port can now be selected
* #25 - Fixed tarball installation error
* #29 - JMVC framework updated to version 3.2.2
