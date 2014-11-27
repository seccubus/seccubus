---
layout: post
title: Seccubus v1.4.1 – Nessus 4.2 compatibility release
---
I just released Seccubus version 1.4.1 on our sourceforge page. The main goal
of this release was to fix compatibility with Nessus 4.2

Thansk to Isac Balder, who provided me with a patched update-nessusrc file,
Seccubus can now be used with Nessus 4.2, but there is a catch. Nessus 4.2 no
longer provides the port 1241 interface to users with a home license. Since
Seccubus uses the port 1241 interface you have to either have a **professional
feed** license **or keep using Nessus version 4.0**.

I was an unpleasant surprise to find out that Tennable pulled the port 1241
interface from the home feed version. I have found a [blog post on “The Blog
Self()”](http://blog.upbeat.fr/post/407107943/automating-scans-on-nessus-4-2)
which explains how to automate scans with Nessus 4.2 so I hope to incorporate
that in the near future into either Seccubus v1, v2 or both.

Here is the relevant portion of the change log:

---
    
18-03-2010
===
Seccubus v1.4.1 - Nessus 4.2 compatibility release - Thanks Isac Balder
    
* Ticket [ 2954813 ] - Parsing of hostnames
The get_hostnames routine of SeccubusWeb.pm does not parse the hostnames  
file correctly if it is a symlink to /etc/hosts.
An entry like:  
1.2.3.4 abcmadm1 abcmadm1.abc.local cvs #This is a comment
Returns 'abcmadm1 abcmadm1.abc.local cvs #This is a comment' as the  
hostname.
* Ticket [ 2962660 ] - update-nessusrc not comptible with Nessus 4.2
Update-nessusrc did not handle Nessus 4.2 port 1241 connections right
Thanks to Isac Balder for providing a fixes update-nessusrc file
* Ticket [ 2954186 ] - Still some AutoNessus references
Removed last autonessus references (I hope)
