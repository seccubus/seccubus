---
layout: post
title: Nessus 6 compatibility release, asset management, Custom SQL and more...
---

For those of you that have been waiting to upgrade to Nessus 6 or those of you that use the 
hosted version by Tennable you can now use them with Seccubus again.

This is mostly thanks to Alexander Smirnoff of Parallels Inc. who created the Nessus 6 scanner 
interface and also convinced his employer to sponsor the development of the asset management function
and the custom SQL function which is now available to administrative users.

From the entire set of Seccubus volunteers (@Arkenoi, @blabla1337, @SpaZ, @StevenSmiley and @Seccubus) 
a happy new year or a happy soltice depending on you believes.

Release notes
=============
Thanks for this release goes to Alexander Smirnoff (@Arkanoi) and his employer Parallels Inc.

Alexander whipped together the Nessus 6 compatibility, fixed issues with the Qualys SSLlabs scanner.
Further more his employer Parallels Inc. sponsored the development of the asset management and custom
SQL feature.

28-12-2014 - 2.11 - Nessus 6 compatibility, assets, custom SQL and more
======================================
* Nessus 6 compatibility release. Tennable decided to change the Nessus API between
versions 5 and 6, therefore the Nessus plugin did not work correctly with version 6
anymore. Alexander Smirnoff was kind enough to provide a new Nessus6 scanner plugin that
supports the new Nessus API.
* Added asset management and the ability to execute custom SQL to Seccubus
* Added indexes to findings (host,port,plugin) to speed up large DB queries

Bug Fixes
============================================
* #140 - Nessus 6 integration
* #141 - Multiple issues with Qualys SSLlabs scanner
* #144 - Perl-CGI is bundled with perl 5.8 rpm's so no need to bundle it
* #152 - Pull request for Asset management
* #159 - It was impossible to launch scan with policy that lacks template UUID
