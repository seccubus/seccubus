---
layout: post
title: AutoNessus v1.3.0 is out
---
Here are the change notes:

    
    
    23-3-2009
    
    
    AutoNessus v1.3.0 - OpenVAS compatibility release
    
    
      
    Ticket [ 2316867 ] - OpenVAS compatibility
    
    
    AutoNessus is now OpenVAS compatible.
    
    
      
    In order to make AutoNessus work with OpenVAS you will need to change the
    
    
    NESSUSBIN parameter in either ~/etc/config or ~/var/<scanname>/config to point
    
    
    to your OpenVAS-Client binary. You also need to change the mode of to scan an
    
    
    append openvas to it (e.g. MODE=full becomes MODE=full-openvas)
    
    
      
    Changes where needed to the following files:
    
    
    * process-scan.pl -     Due to differendces between OpenVAS and Nessus .nbe
    
    
                            file format
    
    
    * do-scan -             Due to slightly different command line handling
    
    
                            between OpenVAS-Client and Nessus client
    
    
    * etc/config.dist -     To show an example OpenVAS setup
    
    
      
    Also additional nesssusrc files where needed because OpenVAS has a different a
    
    
    configuration file format.
    
    
      
    Ticket [ 2653614 ] - Problems with mode=portscan
    
    
    When you execute a mode=portscan scan and the portscan.nessusrc file contains
    
    
    an empty plugin section, nessus populates the plugin section with undesirable
    
    
    default settings. I have updated update-rcs to now populate the plugin section
    
    
    of the portscan.nessusrc with all current plugins with setting no.
    
    
      
    Ticket [ 2604472 ] - Predicatable diffs v1.2.5
    
    
    Added predicable diffs to ignored-diffs
    
    
      
    Ticket [ 2592187 ] - New autoremarks
    
    
    Added autoremarks
    
    
      
    Ticket [ 2609184 ] - XSS in view_finding.pl
    
    
    While the primary plug in output was properly sanitized, the diff output and
    
    
    historical plugin output was not properly sanitized.
    
    
      
    Script tags returned by Nessus plugins were not propperly escaped. Should an
    
    
    attacker be able to force a Nessus or OpenVAS plugin to return malicious
    
    
    script, this script would executed when it was displayed as a diff or as
    
    
    historical plugin output.
    
    
      
    While the attack was real and demonstrated via the output of plugin 14260
    
    
    (nikto) it was hard to execute.
    
    
      
    Ticket [ 2705701 ] - CVE entries were not properly formatted (missing ( )
    
    
    Fixed the regexp in add_external references

