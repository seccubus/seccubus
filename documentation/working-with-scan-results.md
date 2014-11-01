---
version: 1
category: documentation
layout: page
title: Working with scan results
---
# The first scan results

When your first scan (fired either via the crontab or manually)has finished
you will be sent an email with the scan results which will look something like
this:

    
    
    Host localhost
    
    
    ---
    
    
    Status: *** WARNING *** Newly discovered
    
    
    Added: 'Medium Strength Ciphers found' to remark
    
    
    Added: 'Apache' to remark
    
    
    Added: 'TeamSpeak?' to remark
    
    
    Added: 'Apache' to remark
    
    
    NEW     Open port       31
    
    
    NEW     Security Hole   1
    
    
    NEW     Security Note   56
    
    
    NEW     Security Warning        12

This email is intentially left ague, you will need to log into the web GUI to
see detailed results.

* * *

# The Web GUI

After you have logged into the web GUI. You will see a screen like this:
![Initial AutoNessus
screen](https://www.seccubus.com/uploads/2008/03/01-select-a-scan.png)

* * *

## Selecting a scan

In order to work with the scan you will have to click on the name of the scan
on the left. The bottom square will now show the scan information. ![Scan
information](https://www.seccubus.com/wp-content/uploads/2008/03/02-scan-
info.png) The scan information will show you all the times the scan has been
executed and allows you to download Nessus reports in html, xml and nbe format
and the text of the email set to you earlier (changes).

* * *

Editing the hosts file Sometimes it is handy to not only have the scanned IP
address, but also the hostsnames. For this purpose you can import a hosts file
into Seccubus. If you click on the ‘Edit hostfile’ link in the top of this
screen the host file editor wil appear. ![Host file
editor](https://www.seccubus.com/wp-content/uploads/2008/03/03-hostfile-
editor.png) You can fill this form in just as a regular unix
[/etc/hosts](http://linux.die.net/man/5/hosts) file. Anything after the IP
addres and whitspace is used to describe the host in future sections.

* * *

Selecting findings The other links on the top all allow you to select findings
based on their status. ![Two findings](https://www.seccubus.com/wp-
content/uploads/2008/03/04-two-findings.png) The statusses have tehe following
meaning:

  * NEW – This findings has been discovered for the first time ever for this port and this host
  * CHANGED – This findings has been reopened because either: 
    * It was previously marked NO ISSUE and its text has changed, or
    * It was previoulsy marked FIXED or GONE but it was found again on this host and port, or
    * It was previously marked CHANGED.
  * OPEN – THis finding has been discovered more the one for this host and port
  * GONE – This finding has not been found in the current scan, but was there in previous scans.
  * NO ISSUE – This status is selected by the user when a finding does not pose a security risk. Findings will keep the status “NO ISSUE” untill the finding text changes.
  * FIXED FINDINGS – This status is selected by the user to indicate that a finding has been fixed and that the plugin will nottrigger again on this port andthis host. Findings will keep this status until the plugin is triggered again for this port and this host.
  * HARD MASKED – This status is selected by the user when he does not ever want to see this finding again. This is also the default for some non sensical plugins.

* * *

## Updating a single finding

You can click on a single finding to see its details and/or update it. ![A
single finding](https://www.seccubus.com/wp-content/uploads/2008/03/05-single-
finding.png) Here you canchange the status of a finding and insert a
clarifying remark. This screen will also tell you when this finding was last
seen and the difference with the previous scan (if any) .

* * *

## Bul updates

It is also possible to do bulk updates of multiple findings in one go. In
order to do this tick the checkbox on the rightmost of the findings you want
to change. Select the status from the dropdown, type an (option remark),
uncheck the overwrite checkbox (if you want to append the comment in stead
over overwrite it) and click the ‘Bulk update selected’ button. ![Bulk update
GUI](https://www.seccubus.com/wp-content/uploads/2008/03/06-bulk-update-1.png)
After yo have clicked this button the follow screen will appear. ![Bulk update
output](https://www.seccubus.com/uploads/2008/03/06-bulk-update-2.png)

