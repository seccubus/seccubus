---
version: 2
category: user
layout: page
title: Tips when using MariaDB
---
MariaDB by default does not allow updates that are bigger then 50mb.

If you want to import larger scans into Seccubus you will need to modify a
this setting:

MariaDB [(none)]> SET GLOBAL max_allowed_packet = 1073741824;

This will increase this limit to about 1GB.

