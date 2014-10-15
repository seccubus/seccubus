---
layout: post
title: Seccubus 2.0.alpha2 released
---
I just released the tarballs of Seccubus 2.0.alpha2 the RPM’s will follow
shortly. You can download it from the [download
area](https://sourceforge.net/projects/seccubus/files/Seccubus_v2/).

Release notes:

    
    
    2011-04-28 - Seccubus v2.0.alpha2
    
    Today the second Alpha version of Seccubus sees the light of day. As the name
    suggests this is an Alpha release with the associated quality. If you are
    running Seccubus V1 in a production environment we strongly suggest to not move
    to Seccubus V2 unless you have a specific reason to do so.
    
    This second Alpha release addresses some speed issues and some issues with
    Nessus scanning.
    
    Changelog for Alpha2
    --------------------
    17-03-2011 - 2.0.alpha2
    
    New features / Issues resolved
    Fixed slow speed of updates to multiple findings
    Scanning with Nessus should work a lot better in this version
    
    Bug fixed:
    #30 - Document running scans
    <https://sourceforge.net/apps/trac/seccubus/ticket/30>
    #32 - load_ivil command line argument 'scan' is ignored
    <https://sourceforge.net/apps/trac/seccubus/ticket/32>
    #34 - Default port for OpenVAS scanning not set correctly
    <https://sourceforge.net/apps/trac/seccubus/ticket/34>
    #35 - ivil does not import title of Nessus finiding
    <https://sourceforge.net/apps/trac/seccubus/ticket/35>
    #37 - @HOSTS gets expanded to /tmp/seccus.hosts.PID in stead of
    /tmp/seccubus.hosts.PID
    <https://sourceforge.net/apps/trac/seccubus/ticket/37>
    #38 - nessus2ivil should not die on unknown attribute
    <https://sourceforge.net/apps/trac/seccubus/ticket/38>
    

