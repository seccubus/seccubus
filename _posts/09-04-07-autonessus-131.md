---
layout: post
title: AutoNessus 1.3.1
---
# AutoNessus 1.3.1 released today

I realsed AutoNessus 1.3.1 which fixes an issue introduced in AutoNessus
1.3.0. You only need to upgrade this release if the previous released caused
your scanning to fail of your previous relase was lower then 1.3.0.

**Changelog**
    
    
    7-4-2009  
    AutoNessus v1.3.1 - Nessus 2.2.5 Compatibility  
      
    Ticket [ 2740102 ] Nessus v 2.2.5 issue  
    It seems that the OpenVAS compatibility release broke downwards compatibility  
    with Nessus 2.2.5 (guess which version happened to be installed at the office)  
      
    AutoNessus now detects if the OpenVAS or Nessus client is used and switches  
    the command line arguments based on that.

