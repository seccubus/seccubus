---
layout: post
title: Seccubus v1.5.4 released
---
# Seccubus 1.5.4 – OpenVAS-Client 3.x compatibility release

Today I released version 1.5.4 of Seccubus, this is a OpenVAS-Client 3.x
compatibility release that does not fix any other issues. If you are not an
OpenVAS user there is no need to upgrade.

Currently there is only a tar.gz file on SourceForge, the two rpm files will
follow soon.

Here are the releasenotes:

---

7-2-2011 - OpenVAS-Client 3.x compatibility release
      
This release fixes an OpenVAS-Client 3.x compatibility issue reported and fixed by Brad Alexander
      
    Frank,
      
    Please find the attached do-scan script. The problem was that OpenVAS-clients
    versions 2 and before as well as nessus (all versions that I was able to test)
    use -v to determine the version, whereas OpenVAS-Client version 3 (and
    presumably version 4, which is in alpha/beta now) uses -V
    
    As a quick fix, I reversed the test, so that it tests for nessus rather than
    openvas-client, as follows
    Is it nikto? -> yes -> run nikto test

      | no
      V
    
    Is it nessus? -> yes -> run nessus
    
      |
      V
    
    It's openvas -> run openvas
    
      
    Note that I have the following versions of the tools to test against:
    
    OpenVAS-Client -> 2.0.5, 3.0.0 (server version 3.0.4) Nessus -> 2.2.10, 4.2.2 and 4.4.0
      
    In any case, let me know your comments on my changes. I can send you a diff 
    file, if you prefer, when I get home. The license, obviously, on my changes
    are gpl, but I got bitten on not specifically stating that on my blog.
    
    Thanks,
    --b
