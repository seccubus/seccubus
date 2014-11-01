---
version: 1
category: documentation
layout: page
title: What does MODE=nikto do?
---
# What does MODE=nikto do?

Normally if you specify a MODE= directive in a configuraiton file, it means
that the Nessus or OpenVAS client uses that specific -nessusrc file to
initiate the scan. THis behaviour has changes as of Seccubus v1.5.0, which
provides native support for Nikto scans.

The do-scan script is hard coded to detect the MODE=nikto statement and do the
following:

  * Find the nikto scanner specified by the NIKTOBIN directive
  * Append the additional Nikto options specified by the NIKTOOPTS directive
  * Lauch the Nikto scanner on the host running Seccubus to scan the hosts specified in the $VAR/hosts file

These Nikto results will be processed in the same manner as Nessus and OpenVAS
findings. XML and HTML reports will not be available in this mode.

If you have configured your Nessus or OpenVAS scanner to include the Nikto
plugin and have Nikto installed on the scannign system it will also be
executed when you perform a MODE=full or MODE=safe scan. There are however
some differences:

**MODE=nikto** | **MODE=full or MODE=safe   
**  
---|---  
Will only lauch Nikto | Will lauch Nikto and all other (safe) plugins in
Nessus/OpenVAS  
Nikto will be run from the machine running Seccubus | Nikto will run from the
machine running Nessus/OpenVAS  
Each line in the Nikto output will be converted to a finding in Seccubus | The
Nikto finding will include all the lines of the Nikto output  
If you scan name based virtual hosts you only scan the Webserver port with
different names | If you scan name based virtual hosts you do a full portscan
on the host running the name based virtual host of each different URL

