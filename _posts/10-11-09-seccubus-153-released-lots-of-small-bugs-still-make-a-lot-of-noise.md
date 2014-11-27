---
layout: post
title: Seccubus 1.5.3 released – Lots of small bugs, still make a lot of noise
---
Hello everybody,

I just released version 1.5.3 which fixes lots of little bugs that I did not
want to wait for Seccubus version 2 to fix. Please have a look at the release
notes below and upgrade if you need to.

---

9-11-2010
---
Seccubus v1.5.3 - Lots of small bugs, still make a lot of noise
    
* Ticket [ 3105978 ] - POSTSCAN canot be used to mail html report
Moved evaluation of POSTSCAN parameter till after HTMl reprots are generated
* Ticket [ 3085944 ] - CWE: references not hyperlinked
Added a line to SeccubusWeb.pm to render the missing links
* Ticket [ 3061224 ] - When nikto asks for input MODE=nikto scans "hang"
Added the Nikto option -ask auto to the default config file. Users who allready have such a configuration file are encouraged to add this line themselves
* Ticket [ 3060441 ] - MODE=safe line in do-scan overwrite settings in config
Moved MODE=safe to top of file
* Ticket [ 3054350 ] - Certain OpenVAS packages use -V for version (in stead of -v)
Redirected stderr to stdout so error does nto show in output anymore
* Ticket [ 3011447 ] - Unsupported report type 'xml'
Report type no longer gets rendered for Nessus, just of OpenVas
