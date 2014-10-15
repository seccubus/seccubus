---
layout: post
title: AutoNessus 1.3.2
---
# AutoNessus version 1.3.2 was just released!

I just released AutoNessus version 1.3.2 which contains mainly bugfixes. Most
important bugfix is Nessus4 compatibility

Here is the fuill changelog.

    
    
    3-9-2009  
    AutoNessus v1.3.2 - Fixing some bugs
    
    
      
    Ticket [ 2849220 ] - do-scan errors  
    Running the scan by hand results in  
    bin/do-scan: line 45: nessus: command not found  
      
    Added an echo to a wrong statement in do-scan
    
    
      
    Ticket [ 2849229 ] - Nessus 4 compatibility  
    The update-nessusrc script was not compatible with Nessus4. Downloaded a new  
    version from http://www.tifaware.com/perl/update-nessusrc/ and changed it to  
    be compatible with AutoNessus
    
    
      
    Ticket [ 2740544 ] - XSS protection in diff kills formatting  
    XSS filtering of diffs killed the markup inserted by ignored diffs. I now do  
    the XSS filtering before I insert the markup so that the markup does nto get  
    killed anymore
    
    
    Ticket [ 2793178 ] - Odd rendering of CVE references  
    Tenneable now shows both CVE references and links to CVE references in its  
    code:  
      
    RedHat reported a null-pointer dereference flaw while processing  
    monochrome ICC profiles (CVE-2009-0793). ....  
    See also :  
    http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2009-0581  
      
    CVE references will only be updated if not preceeded with a = sign.  
      
    Ticket [ 2783580 ] - Missing EMAIL= not handled gracefully  
    No email will be sent without email address  
      
    Ticket [ 2783579 ] - Characters missing from URL  
    Added @ and " as valid URL characters  
      
    Ticket [ 2568643 ] - No help availabel for undefined  
    Calling help only when ScanStatus changes

