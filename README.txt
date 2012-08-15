Seccubus V2 Change Log

Seccubus V2 is currently in early Beta phase. This code is currently actively
maintained and developed and is the recommended branch. It works with 
Nessus 4.x with both a home feed and professional feed license.

If you are looking for stable code you might want to use the V1 branch of this
project, but be aware that it only supports Nessus with a professional feed
and is not longer under active development.

15-8-2012 - 2.0.beta5 
=====================
This is basically version 2.0.beta4 with a nasty critical error removed.

New features / Issues resolved
------------------------------
Removed an error that caused the previous version to fail

Bigs fixed (tickets closed):
----------------------------
91 - Scan_ids is a mandatory parameter

10-6-2012 - 2.0.beta4 
=====================

New features / Issues resolved
------------------------------
Fixed major performance issues
Fixed installer bug

Bigs fixed (tickets closed):
----------------------------
82 - Install.pl fails to write all necesary files
83 - convert_v2_v2 does not work with default install directory from RPM (/var/lib/seccubus)
84 - getWorkspaces slow with large database
85 - getScans slow with large databases
86 - getFindings slow with workspaces with lots of findings
