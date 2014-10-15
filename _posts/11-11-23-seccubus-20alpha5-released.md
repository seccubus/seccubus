---
layout: post
title: Seccubus 2.0.alpha5 released
---
It’s has been quite for a while, but today we are releasing Seccubus
2.0.alpha5. This release marks the true start of the GUI rewrite using the
JavascriptMVC framework (see: http://javascriptmvc.com/) so a lot of the
changes in this release are not immediately visible to everyone. If you want
to peek at the new GUI in progress, you can see it by appending
‘/seccubus/seccubus.html’ to your regular Seccubus url.

You can download the new version from: https://sourceforge.net/projects/seccub
us/files/Seccubus_v2/Seccubus-2.0.alpha5/ in tarball and rpm format.

Release notes:

    
    
    24-11-2011 - 2.0.alpha5
    
    
    ---
    
    
    New features / Issues resolved
    
    
    ------------------------------
    
    
    Perl compile tests and JMVC unit tests are now part to the build process
    
    
    In the RPM install files in the scanner directories did not run because of
    
    
    incorrect permissions (fixed)
    
    
    All scanners but Nessus were broken due to an untested fix by the author
    
    
     
    
    
    GUI rewrite
    
    
    -----------
    
    
    New GUI is in /seccubus/seccubus.html
    
    
    First parts of the GUI rewritten using JMVC framework
    
    
    Updated JMVC to get more clear build errors
    
    
    Integrated JMVC building into the distribution building scripts
    
    
     
    
    
    Bugs fixed (tickets closed):
    
    
    ----------------------------
    
    
    #55 - Spec file is missing dependancies
    
    
    <https://sourceforge.net/apps/trac/seccubus/ticket/55>
    
    
    #56 - Scanner files not executable after install
    
    
    <https://sourceforge.net/apps/trac/seccubus/ticket/56>
    
    
    #59 - Nikto scanner not running
    
    
    <https://sourceforge.net/apps/trac/seccubus/ticket/59>

