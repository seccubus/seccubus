---

category: faq
layout: page
title: Permission denied errors after installing Seccubus v2
---
I often get reports that people have trouble running Seccubus and see this
type of error in the httpd_error log.

    
    
    [Tue Jul 17 12:31:59 2012] [error] [client 1.2.3.4](https://github.com/schubergphilis/Seccubus_v2/issues/13)Permission denied: exec of '/opt/Seccubus/www/seccubus/json/ConfigTest.pl' failed, referer: [http://1.2.3.4/seccubus/seccubus/seccubus.html
    ](http://1.2.3.4/seccubus/seccubus/seccubus.html)[Tue Jul 17 12:31:59 2012] [error] [client 1.2.3.4](https://github.com/schubergphilis/Seccubus_v2/issues/13)Permission denied: exec of '/opt/Seccubus/www/seccubus/json/UpToDate.pl' failed, referer: <http://1.2.3.4/seccubus/seccubus/seccubus.html>

Most of the time this is due to your SE linux policy that doesn’t allow the
httpd account to run binaries from the install directory.

