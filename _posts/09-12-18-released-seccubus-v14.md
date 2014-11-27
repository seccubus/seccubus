---
layout: post
title: Released Seccubus v1.4
---
# Seccubus v1.4 has been released

Seccubus v1.4 has just been released on
[SoureForge](https://sourceforge.net/projects/seccubus/files/). Besides the
rechristening of the tool, and some small enhancements this release also fixes
a directory traversal vulnerability that allowed an attacker to download
arbitrary files from the server with the rights of the apache process.

Here is the full changelog for this release:

---

17-12-2009  
===

Seccubus v1.4 - Thy new name is...  
      
* Ticket [ 2916275 ] - Rechristen tool Seccubus  
* Ticket [ 2916290 ] - Directory traversal vulnerability in get_report.pl  
get_report.pl failed to do proper input validation when constructing a  
filename from user input. This lead to a directory traversal vulnerability  
which enable a remote (authenticated) user to read arbitrary files on the  
server with the rights of apache process.  
While Seccubus supports user authentication it does not enforce that  
authentication is configured upon installation of Seccubus  
* Ticket [ 2916282 ] - do-scan enhancement, create dirs if they don't exist  
If the directories findings and output are not present in var/<scanname> e.g.  
because the user did not copy .skel, but created files manually, do-scan will  
now create them for him.
