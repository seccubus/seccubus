---

category: user
layout: page
title: Permission denied errors
---
I often get reports that people have trouble running Seccubus and see this
type of error in the httpd_error log.

    
    
    [Tue Jul 17 12:31:59 2012] error client 1.2.3.4 Permission denied: exec of '/opt/Seccubus/www/seccubus/json/ConfigTest.pl' failed, referer: http://1.2.3.4/seccubus/seccubus/seccubus.html
    [Tue Jul 17 12:31:59 2012] error client 1.2.3.4 Permission denied: exec of '/opt/Seccubus/www/seccubus/json/UpToDate.pl' failed, referer: http://1.2.3.4/seccubus/seccubus/seccubus.html

Most of the time this is due to your SE linux policy that doesn’t allow the
httpd account to run binaries from the install directory.

If you are using Redhat of Centos try using the RPM files provided on our [download](https://github.com/schubergphilis/Seccubus_v2/releases) page, as these will set up the correct SE linux contexts. 

