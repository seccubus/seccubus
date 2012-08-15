Seccubus V2 is currently in Alpha phase. Even though we tested this code
ourselves do not expect production ready code yet.

15-08-2011 - 2.0.alpha3
New features / Issues resolved
* Major bug in the delta engine resolved. It turned out that statusses where
  not processed after a scan, but was called by the load_ivil utility.

Bugs fixed:
#36 - Nessus scans don't seem to see targets
https://sourceforge.net/apps/trac/seccubus/ticket/36
#12 - Gone hosts not not detected correctly
https://sourceforge.net/apps/trac/seccubus/ticket/12
#42 - Scan parameters --workspace and --scan should be added automatically
https://sourceforge.net/apps/trac/seccubus/ticket/42

