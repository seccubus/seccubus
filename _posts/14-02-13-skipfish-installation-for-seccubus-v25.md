---
layout: post
title: Skipfish installation for Seccubus v2.5
---
This post will describe step by step how to configure Skipfish for Seccubus.

You can grab the latest release of Skipfish here:

https://code.google.com/p/skipfish/downloads/list

Before you compile the Skipfish src we need to edit 2 files so Skipfish can be
used in Seccubus.  
In my current setup the Seccubus files are located in /opt/seccubus and I’m
going to install the Skipfish in the /opt

Edit the Skipfish config file located in the src/config.h of Skipfish and add
the full path where you want use the Skipfish:

    /* Default paths to runtime files: */

    #define ASSETS_DIR “/opt/skipfish/assets”  
    #define DEF_WORDLIST “/opt/skipfish/skipfish.wl”

    /* Default signature file */  
    #define SIG_FILE “/opt/skipfish/signatures/signatures.conf”

    Now make the Skipfish installation and when it’s compiled copy the skipfish
    dir to /opt  
    The last file we need to edit is the /opt/skipfish/signatures/signatures.conf
    and add the path prefix:

    #############################################  
    ##  
    ## Master signature file.  
    ### The mime signatures warn about server responses that have an interesting  
    # mime. For example anything that is presented as php-source will likely  
    # be interesting  
    include /opt/skipfish/signatures/mime.sigs

    # The files signature will use the content to determine if a response  
    # is an interesting file. For example, a SVN file.  
    include /opt/skipfish/signatures/files.sigs

    # The messages signatures look for interesting server messages. Most  
    # are based on errors, such as caused by incorrect SQL queries or PHP  
    # execution failures.  
    include /opt/skipfish/signatures/messages.sigs

    # The apps signatures will help to find pages and applications who’s  
    # functionality is a security risk by default. For example, phpinfo()  
    # pages that leak information or CMS admin interfaces.  
    include /opt/skipfish/signatures/apps.sigs

    # Context signatures are linked to injection tests. They look for strings  
    # that are relevant to the current injection test and help to highlight  
    # potential vulnerabilities.  
    include /opt/skipfish/signatures/context.sigs

Skipfish is now installed and ready to use in Seccubus.

