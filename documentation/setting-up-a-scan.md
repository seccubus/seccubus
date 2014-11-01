---
version: 1
category: documentation
layout: page
title: Setting up a scan
---
Before you set up a scan you need to have the following information:

  * IP Address(es) or hostname(s) to be scanned
  * Nessus daemon to be used (if different from the daemon specified in etc/config)
  * Email adres to mail the results to (if different then the one provided inetc/config)
  * (Optional) Commands to execute before and after the scan
  * Who has or does not have permission to see this scan in the GUI
  * When the scan needs to run

This chater assumes you want to setup a scan called localhost which scans
127.0.0.1 and mails the results back to root@localhost.

All the example commands assume that you have the identity of the user
seccubus

# Copying the skeleton directory

The var directory contains a .skel directory that contains all the
subdirectories you need. Copy this directory to a directory with the name of
your scan.

    
    
    >cd ~/var
    
    
    > cp -r .skel localhost 

# Modifying the hosts file

The file var/<scanname>/hosts specifies which targets to scan. Each line
contains a single target which can be any of the following:

  * hostname – e.g. localhost or www.seccubus.com
  * ip address – e.g. 127.0.0.1
  * subnet – e.g. 127.0.0.0/24 
  * range – e.g. 127.0.0.1-255

# Modifying the per scan configuraiton file

The file var/<scanname>/config contains configuration directives which are
valid for this specific scan only. Any parameter from etc/config can be
overwritten here. Usefull parameters are:

** Parameter** | **Meaning  
**  
---|---  
MODE  | Mode wil determine which configuration from etc if used if mode is set
to full full-nessusrc will be used, alternatives are safe and portscan which
will cause Seccubus to use safe-nessusrc or portscan-nessusrc. You can supply
your own nessusrc files if you want to as well.  
EMAIL | Override the default email address for this scan  
PRESCAN | A unix command that will be executed prio to the scan  
POSTSCAN |

A unix command that will be executed after the scan  
  
In the example the config file will look like this.

    
    
    MODE="full"
    
    
    EMAIL="root@localhost"

# Setting GUI permissions

If only certain users have permission to see a scan in the GUI you have to
options:

  * var/<scanname>/.allow – use this file to specify (one per line) the usernames of te users that can access this scan – other users will not be able to access the scan
  * var/<scanname>/.deny – use this file to specify (one per line) the usernames of te users that cannot access this scan – other users will be able to access the scan

A user will have access when:

  * No .allow and .deny files exist
  * His name is in .allow (if it exists) and
  * His name is not in .deny (if it exists)

# Scheduling the scan via crontab

The scans are actually run via the ‘bin/do-scan <scanname>’ command. In order
to start the localhost scan each night at 1:10 you would specify:

10 1 * * * bin/do-scan localhost

Type ‘[man 5 crontab](http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5)‘ on the
unix command prompt to learn more about scheduling tasks via cron.

## Every odd/even/fourth week

Crontab by default does not allow you to schedule jobs based on the [ISO
weeknumer](http://www.proesite.com/timex/wkcalc.htm).In order allow you to
schedule command on e.g. 6:00 on every wednessday of the odd weeks, Seccubus
includes the script called bin/EveryXXXWeek.pl.

EveryXXXWeek.pl has the following command syntax.

EveryXXXWeek.pl “<unix command>” <divider> <remainder> so e.g. to run “echo
yes” in odd weeks you could type: ‘bin/EveryXXXWeek.pl “echo yes” 2 1′. In tis
case it would take the current week number and divide it by 2. If the remained
is 1 if will execute “echo yes”.

To schedule a scan called localhost on 6:00 on every wednessday of the odd
weeks specify the following in crontab.

    
    
    0 6 * * wed bin/EveryXXXWeek.pl "bin/do-scan localhost" 2 1

## Every x-th someday of the month.

Cron also does allow you to schedule something on e.g. the second friday of
each month. One would expect that the following would work.

    
    
    0 0 8-14 * fri bin/do-scan localhost

Whoevery this would run this command every day between the 8th and 14th day of
the month and on every friday. So Seccubus does come with EveryXXXDay.sh its
syntax is:

EveryXXXday.sh “<unix command>” <daynum> where daynum is a 0 or 7 for sunday,
1 for monday, etc.

So to run the localhost scan on the second friday of each month we would need
the following entry crontab entry.

    
    
    0 0 8-14 * * bin/EveryXXDay.sh "bin/do-scan localhost" 5

# Running a scan manually

Scan can be run manually by typing

    
    
    > cd ~; bin/do-scan locahost

As the seccubus user.

