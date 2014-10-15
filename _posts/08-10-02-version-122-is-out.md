---
layout: post
title: Version 1.2.2 is out
---
I just released version 1.2.2

Why did I bump a few versions over te last few days? Well:

  * I fixed a lot of bugs ![Smile](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-smile.gif)
  * I found new bugs ![Cry](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-cry.gif)
  * Fixed them ![Smile](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-smile.gif)
  * Found a security issueI missed ![Embarassed](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-embarassed.gif)
  * Fixed that ![Smile](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-smile.gif)
  * Found out that the installer was picking up the files I added ![Cry](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-cry.gif)
  * Fixed that ![Smile](https://www.seccubus.com/wp-content/uploads/2008/10/smiley-smile.gif)

So we should be o.k. now.

In general version 1.2.x bring you the following new features:

  * Smart status selection in the main screen – The GUI will tell you which followup status is a logical choice
  * Help – The GUI can now show you a quick explanation of what you are looking at
  * Comments do no get overwritten by default
  * Better feedback on which status is the current active one.

Here is the changelog. (You can find the bugtracker on our [sourceforge
page](http://sourceforge.net/projects/autonessus/))

———8X————————————————————————-

    
    
    2-10-2008  
    AutoNessus v1.2.2 - Fixed XSS bug
    
    
    BUG [ 2141884 ] XSS possible in bluk_update.pl  
    Checked parameter in an earlier state.
    
    
    -------------------------------------------------------------------------------
    
    
    1-10-2008  
    AutoNessus v1.2.1 - Fixed buggy installer
    
    
    BUG [ 2139601 ] www/js/cookie.js and www/getHelp.pl not includes  
    Updated MANIFEST and Makefile.PL  
    Also updated install.pl
    
    
    BUG [ 2139716 ] Help is off by default  
    Updated index.html
    
    
    -------------------------------------------------------------------------------
    
    
    30-9-2008  
    AutoNessus v1.2 - Bug fix release with new (minor) features
    
    
    BUG [ 2100199 ] ASP.NET customer error predicatable diff not ignored  
    Added the following line to etc/ignored_diffs  
    [+-] d+s[HttpExceptioni]: The file '/.*?' does not exist.\rn?
    
    
    BUG [ 1996774 ] Comment overwrite should be off by default  
    Checkbox is now not checked by default
    
    
    BUG [ 1996757 ] Current "Mode" is not visible in the web GUI  
    Updated index.html
    
    
    BUG [ 2130293 ] Add a short helptext to each status  
    Created a new file called Cookie.js  
    Created a new file called getHelp.pl
    
    
    BUG [ 2043133 ] Make status selection smart  
    Updated the downdown routine from autonessusweb.pm
    
    
    BUG [ 1996755 ] AutoRemark does not correctly check if comment allready pres  
    BUG [ 1996754 ] AutoRemark sometimes seems to overwrite comments  
    Updated process_scan.pl

