---
version: 1
category: documentation
layout: page
title: Post installation setup
---
After the installation, there are a couple of things that you need to do:

  * Changing file ownership and permissions
  * Setting up the www directory
  * Setting up the web server
  * Edit etc/config
  * Update www/seccubus.pm
  * Setting up update cron jobs

* * *

Changing file ownership and permissions

Your webserver will need to be able to read and execute files in the www
directory and read and write files in the var directory.

Assuming apache is your webserver user and seccubus is the user running
Seccubus you will need to do the following:

# cd ~seccubus

    
    
    # chown -R seccubus:apache www var
    
    
    # cd var
    
    
    # find . -type f -exec chmod 664 {} ;
    
    
    # find . -type d -exec chmod 775 {} ;
    
    
    # cd ../www
    
    
    # chmod 770 *

* * *

Moving the www directory

By default the Seccubus installer stores the files for the Web GUI in a www
subdirectory of you install directory, this could be a place where your
webserver cannot go. You can move the directory to a place where it can be
read by the webserver and replace the www directory with a symlink. E.g. in
the demo setup we have chosen to install in /home/seccubus but we want the
demo gui to be in /var/www/seccubus.com/htdocs/demo

    
    
    # cd ~seccubus  
    # mv www /var/www/seccubus.com/htdocs/demo  
    # ln -s /var/www/seccubus.com/htdocs/demo/ www

If you do not create a symlink like this you may experience upgrade problems
in the future.

* * *

Setting up the webserver

By default your webserver will not run the .pl files, but simply serve them.
You need to put the following directive in the right part of you apache
configuration:

    
    
    AddHandler cgi-script .pl  
    

Then in the directory directive you have to add “ExecCGI” to the “Options”
directive. You may also want to use the Indexes directive.

You could create the file seccubus.conf and put it in your apache conf.d
directory (usually somethig like (/etc/apache2/conf.d). This file should than
have the following content:

————————————

AddHandler cgi-script .pl

Options ExecCGI

Order deny,allow

————————————

* * *

Update etc/config

The etc directory in your installdir contains the file config which contains
the default configuration parameters of Seccubus which can be overwritten with
per scan settings.

If you do not allready have a configfile, you can copy config.dist to config.
The installer script will allready have updated the path to your installation
directory.

You will have to update the following parameters:

Configuration directive | What to put there  
---|---  
      
    
    HOST=''                                 # This is the host running your nessusd 

| Up the IP address or hostname of the host running the nessus scanner here.
If you havenessus installed on the same box you can set it to localhost  
      
    
    PORT=1241                               # Nessusd port (1241 = default)

| This is the port you nessus daemon is listening on. 1241 is the default.  
      
    
     USER=''                                 # Nessusd user name

| This is the default user name you will use to authenticate to your nessus
daemon  
      
    
    PASS=''                                 # Nessusd password

| This is the default user name you will use to authenticate to your nessus
daemon  
      
    
    NESSUSBIN=/usr/bin/nessus               # The full path to your nessus client

| THis is the full path to your nessus client binary  
      
    
    EMAIL=''                                # This is the default email address

| Default email address to mail results to  
      
    
    HOME=/home/seccubus/                     # Home location of seccubus

| This is set to the install directory by the installer script  
      
    
    VAR=$HOME/var                           # This is where the 'database' lives

| THis should point to thevar directory where the ‘database’ lives  
      
    
    SENDMAIL=/usr/sbin/sendmail             # Path to sendmail

| The full path of you sendmail binary.  
  
* * *

Update autopnessus.pm

The seccubusweb.pm file in www contains a line like this:

    
    
    # You need to point this to where seccubus lives  
    our $HOME = "/home/seccubus/"; 

This tells the web GUI part where to find the database. Normally this line
should be set by the install script.

You should now be ready to setup the first scan.

* * *

Setting up update cron jobs

In order to make sure your configuration files are updated it is recommended
to setup a cronjob that runs bin/update-rcs e.g.

0 21 * * * ~/bin/update-rcs

This will update etc/full -nessusrc and etc/safe-nessusrc with theplug id’s
and preferences of the plugin’s loaded by the nessus daemon. update-rcs uses
you primary nessus scanner which you specified in etc/config.

