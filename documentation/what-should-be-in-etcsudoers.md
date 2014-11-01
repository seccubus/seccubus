---
version: 2
category: documentation
layout: page
title: What should be in /etc/sudoers?
---
What should be in my sudoers file to enable nmap scans to be run with the
–sudo flag? Strict variant:

    
    
    Cmnd_Alias SECCUBUS =/usr/bin/nmap *, /bin/chown seccubus /tmp/seccubus.*, /bin/rm /tmp/seccubus.*
    seccubus ALL=(ALL) NOPASSWD: SECCUBUS
    

Allowing all commands:

    
    
    seccubus ALL=(ALL) NOPASSWD: ALL
    

