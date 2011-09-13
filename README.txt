Seccubus V2 is currently in Alpha phase. Even though we tested this code
ourselves do not expect production ready code yet.

13-09-2011 - 2.0.alpha4
New features / Issues resolved
* Nmap support
  Scanning with is supported from the same server that is running the Nessus
  Seccubus GUI
* The results of the Nessus Policy Compliance family of plugins is now
  supported
  These plugins are different in the sense that they return multiple results
  all direntified by a single pluginID

Bigs fixed (tickets closed):
#8 - Integrate nmap scans into Seccubus
https://sourceforge.net/apps/trac/seccubus/ticket/8
#50 - scanners/nessus/scan should give a clear error message when ruby is
not on system
http://sourceforge.net/apps/trac/seccubus/ticket/50

