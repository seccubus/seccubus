---
layout: post
title: Releasing version 2.10, The Miami Vice edition
---
Today I release Seccubus version 2.10 which I have dubbed ‘The Miami Vice’
edition because I’m currently visiting the Akamai Edge conference in Miami,
FL.

This release has some new features and bug fixes, and you can download it
[here](https://github.com/schubergphilis/Seccubus_v2/releases/tag/2.10).

10-10-2014 – 2.10 – Miami vice edition  
---  
* Password fields are used to store passwords and hide them in de GUI (#127)  
* Limited support for OpenVAS6 and OpenVAS7 thanks to @FGuillaume  
* Python script by @Ar0Xa to email findings from a scan  
* Fixed some bugs concerning issue #1

Bug Fixes  
---  
* #96 – Incorrect temp file usage Nikto scanner  
* #120 – Post install chcon action gives error  
* #124 – Multi file attachments  
* #125 – rpm dependancy name is wrong  
* #127 – Passwords can be hidden in the GUI  
* #134 – SSLlabs scanner did not handle submit errors  
* #135 – Host name creation not handled correctly with SSLlabs  
* #136 – Workspaces are now sorted by name  
* Extra cache control headers because of Chrome

