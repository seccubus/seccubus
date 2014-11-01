---
version: 1
category: documentation
layout: page
title: Installation
---
The following steps are required in order to install Seccubus:

  * Get the tarball seccubus-<versio>.tar.gz via the download link at <http://www.seccubus.com> and place it in a temporary location (e.g./tmp/seccubus)
  * It is recommended that you run Seccubus via a dedicated seccubus user if you have not created it, create it now. Make sure it is part of apache’s group and apache is part of its group.

* * *

  * Extract the tarball
    
    
    # tar -xvzf seccubus-0.1.tar.gz  
    seccubus-0.1/  
    seccubus-0.1/bin/  
    <snip...>

* * *

  * cd into the newly created directory
  * Run perl makefile.PL to install
    
    
     # perl Makefile.PL  
    Checking if your kit is complete...  
    Looks good  
    Warning: prerequisite Algorithm::Diff 1.15 not found.  
    Writing Makefile for seccubus

  * run make
    
    
    # make  
    cp install.pl blib/lib/install.pl  
    cp dist_install.pl blib/lib/dist_install.pl  
    cp www/index.html blib/script/index.html  
    /usr/bin/perl5.8.8 "-MExtUtils::MY" -e "MY->fixin(shift)" blib/script/index.html  
    <snip...>

* * *

  * run the installer command ‘blib/script/install <directory>’ where <directory> is the directory you want Seccubus to install, e.g. /home/seccubus
    
    
    # blib/script/install.pl /home/seccubus  
    cp blib/script/EveryXXXWeek.sh /home/seccubus/bin  
    <snip...>
    
    
    Creating www directory  
    mkdir /home/seccubus/www  
    cp blib/script/seccubusweb.pm /home/seccubus/www  
    <snip...>
    
    
      
    Updating /home/seccubus/etc/config.dist  
    rm /home/seccubus/etc/config.dist.orig  
    rm: cannot remove `/home/seccubusetc/config.dist.orig': No such file or directory  
    mv /home/seccubus/etc/config.dist /home/seccubus/etc/config.dist.orig  
    sed -e 's:HOME=/home/seccubus:HOME=/home/seccubus:' /home/seccubus/etc/config.dist.orig >   
         /home/seccubus/etc/config.dist  
      
    Updating /home/seccubus/www/seccubusweb.pm  
    rm /home/seccubus/www/seccubusweb.pm.orig  
    rm: cannot remove `/home/seccubus/www/seccubusweb.pm.orig': No such file or directory  
    mv /home/seccubus/www/seccubusweb.pm /home/seccubus/www/seccubusweb.pm.orig  
    sed -e 's:our $HOME = "/home/seccubus":our $HOME = "/home/seccubus":'   
         /home/seccubus/www/seccubusweb.pm.orig >/home/seccubus/www/seccubusweb.pm  
    You do not have a config file please copy config.dist to config, and edit it to match your system  
      
    Installation finished  
    Please make sure you read INSTALL.txt to finalize the setup or continue with [Post installation instructions](https://www.seccubus.com/wordpress/?p=15)  
    

