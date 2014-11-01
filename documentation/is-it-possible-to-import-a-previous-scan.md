---
version: 1
category: documentation
layout: page
title: Is it possible to import a previous scan
---
Older Nessus scan results can be imported into Seccubus if you have a .nbe
file.

Caution: make sure you import the scans in the order they were executed, or
Seccubus’ delta engine may produce unwanted results.

Say you want to import two scans into Seccubus under the scanname “Incubus”.

First scan

NBE file: first.nbe  
Date scanned: 12 Jan 2010 02:00

Second scan

NBE file: second.nbe|  
Date scanned 12 Feb 2010 02:00

This is how you do it.

#Log in as the user running seccubus.  
#Go to the scan directory for “Incubus”  
> cd ~/var/Incubus  
# Copy the first nbe file to the output directory name the file as the date
<yyyymmddhhmm.nb>  
> cp ~/first.nbe output/201001120200.nbe  
# Convert the files to html and xml  
> /opt/nessus/bin/nessus -c ~/etc/full-nessusrc -i output/201001120200.nbe -o
201001120200.xml  
> /opt/nessus/bin/nessus -c ~/etc/full-nessusrc -i output/201001120200.nbe -o
201001120200.html  
# Run process scan  
> ~/bin/processs-scan.pl Incubus <your-email@drress.com>  
# Correct file permission  
> find . -type f |xargs chmod 660  
> find . -type d |xargs chmod 775

# Copy the second nbe file to the output directory name the file as the date
<yyyymmddhhmm.nb>  
> cp ~/first.nbe output/201002120200.nbe  
# Convert the files to html and xml  
> /opt/nessus/bin/nessus -c ~/etc/full-nessusrc -i output/201002120200.nbe -o
201002120200.xml  
> /opt/nessus/bin/nessus -c ~/etc/full-nessusrc -i output/201002120200.nbe -o
201002120200.html  
# Run process scan  
> ~/bin/processs-scan.pl Incubus <your-email@drress.com>  
# Correct file permission  
> find . -type f |xargs chmod 660  
> find . -type d |xargs chmod 775

Your are done

