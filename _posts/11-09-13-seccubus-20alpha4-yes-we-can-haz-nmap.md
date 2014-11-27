---
layout: post
title: Seccubus-2.0.alpha4 – Yes, we can haz NMAP
---
Long overdue, and mainly because [Zate Berg](http://twitter.com/#!/zate) would
have otherwise used another tool ![;\)](https://www.seccubus.com/wp-
includes/images/smilies/icon_wink.gif) we now have support for NMAP in
Seccubus v2.0

This release also adds support for compliancy scans from Nessus and som minor
bug files.

Get it on our [Source Forge download page.](https://sourceforge.net/projects/s
eccubus/files/Seccubus_v2/Seccubus-2.0.aplha4/)

Release notes:

---
    
13-09-2011 - 2.0.alpha4
===

New features / Issues resolved
---
* Nmap support
Scanning with is supported from the same server that is running the Nessus Seccubus GUI
* The results of the Nessus Policy Compliance family of plugins is now
supported
These plugins are different in the sense that they return multiple results
all direntified by a single pluginID
    
Bigs fixed (tickets closed):
---
* #8 - Integrate nmap scans into Seccubus
<https://sourceforge.net/apps/trac/seccubus/ticket/8>
* #50 - scanners/nessus/scan should give a clear error message when ruby is
not on system
<http://sourceforge.net/apps/trac/seccubus/ticket/50>
    

