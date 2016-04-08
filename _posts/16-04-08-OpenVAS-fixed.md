---
layout: post
title: Seccubus v2.22 - OpenVAS integration fixed
---

Seccubus v2.22 - OpenVAS integration fixed
==========================================

OpenVAS integration has been a freebee for a while, until OpenVAS and Nessus split their respective interfaces.
Seccubus' OpenVAS OMP integration has never been super stable, but it is now, and it doesn't depend on the omp 
command line utility anymore.
Furthermore two critical bug where fixed and the release process got a major overhaul.

As usual you can download it [here](https://github.com/schubergphilis/Seccubus_v2/releases)

Enhancements
------------
* Improved the release process (see [https://www.seccubus.com/documentation/22-releasing/])
* [#308](https://github.com/schubergphilis/Seccubus_v2/issues/308) - Rewrote the OpenVAS scan script with the following objectives:

  - Remove dependancy on the omp utility (because I don't have it on my Mac for starters)
  - XML parsing is now done with XML::Simple in stead of manually (which is fragile)
  - Better error handling


Bug Fixes
---------
* [#289](https://github.com/schubergphilis/Seccubus_v2/issues/289) - Online version test needs a unit test
* [#269](https://github.com/schubergphilis/Seccubus_v2/issues/269) - Correct handling of multiple address nodes in NMap XML
* [#298](https://github.com/schubergphilis/Seccubus_v2/issues/298) - OpenVAS6: fix scan and import to ivil 
* [#297](https://github.com/schubergphilis/Seccubus_v2/issues/297) - Port field abused to store port state
* [#307](https://github.com/schubergphilis/Seccubus_v2/issues/307) - OpenVAS integration was broken