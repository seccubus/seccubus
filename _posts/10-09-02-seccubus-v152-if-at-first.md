---
layout: post
title: Seccubus v1.5.2 – If at first….
---
# Seccubus v1.5.2 released

If at first you don’t succeed. Unfortunatly there was an error in both
Seccubus 1.5.0 and Seccubus 1.5.1. We finally think we god the issues nailed.

Also this release also contains the scanmonitor script provided by Isac Balder
(see http://dc214.defcon.org/notes/scanmonitor.pl)

---

1-9-2010
---
Seccubus v1.5.2 - If at first you don't succeed...

Added Scanmonitor by Isac Balder
See: http://dc214.defcon.org/notes/scanmonitor.pl

Provided RELEASENOTES.txt

* Ticket [ 3057382 ] - RPM assumes dependancies on nessus and mod_perl
The RPM installed assumed dependancies on nessus and mod_perl. While most use
of Seccubus is with nessus, it can also be used with OpenVAS and/or Nikto
without havving nessus installed, so this is not a hard dependancy
* Ticket [ 3057381 ] - CONFIG path wrong in config.dist
In config.dist the CONFIG variable was set to /home/seccubus/bin this should
have read /home/seccubus/etc. Kudos to Stephen Stormont for spotting this.
