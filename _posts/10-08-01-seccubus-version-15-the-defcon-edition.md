---
layout: post
title: Seccubus version 1.5 – The DefCon edition
---
By this time I should be on stage at DefCon 18 in Las Vegas presenting and
releasing Seccubus version 1.5.

If you want to download this version go to the [download](https://sourceforge.
net/project/platformdownload.php?group_id=216367) section.

Highlights are:

  * Released during mij DefCon18 talk
  * Nikto compatibility
  * RPM isntallation file
  * Now able to handle Nessus compliance autput

Full changelog:

    
    
    01-08-2010
    
    
    Seccubus v1.5.0 - The Defcon 18 and Nikto compatibility release
    
    
      
    Ticket [ 2979354 ] - Nikto compatibility
    
    
      
    Creating a scan with "mode='nikto'" will fire off a Nikto scan from the server
    
    
    running Seccubus, if nikto is installed (remote scanners are currently not
    
    
    supported).
    
    
      
    The configuraiton file allows you to pass additional parameters to nikto.
    
    
      
    Ticket [ 2978649 ] - Seccubus cannot handle compliance plugin output
    
    
      
    It has turned out that in a Nessus .nbe file the same host/port/plugin
    
    
    combination can appear more then once, e.g. when dealing with compliancy
    
    
    plugines (e.g. plugin number 21157). Seccubus will now test if an entry for a
    
    
    certain host/port/plugin combination allready exists and if so it will append
    
    
    the finding to the entry in stead of overwriting the entry.
    
    
      
    Also the output of compliace type plugins is a bit large.
    
    
    If the plugin is one of the compliancy then the first word (sequence of
    
    
    non-space characters) is added to the plugin number
    
    
      
    Ticket [ 2978437 ] - Typo in line 46 of do-scan
    
    
    Corrected typo
    
    
      
    Ticket [ 2978573 ] - New ignored_diffs
    
    
    Updated
    
    
      
    Ticket [ 2981907 ] - Online up2date check
    
    
    up2date.pl makes an http connection to the seccubus website to determine is
    
    
    the current version of Seccubus is up to date.
    
    
      
    Ticket [ 2986053  ] - Findings >150 characters not truncated
    
    
    In certain circumstances, findings with > 150 characters were not propperly
    
    
    truncated in the web gui. This is now fixed
    
    
      
    Ticket [ 2986061 ] - Odd rendering of MS bulleting links
    
    
    Only render MS type text into a hyperlink if it is not preceeded by a slash.
    
    
      
    Ticket [ 2984464 ] - ignore ASP.Net_SessionId
    
    
    Added the line below to ignore_diffs
    
    
    [+-] d+s+value = .*?n?
    
    
      
    Ticket [ 3025145 ] - Provide RPM installer
    
    
    Thanks to Peter Slootweg an RPM is now also available for easy installation
    
    
      
    -------------------------------------------------------------------------------

