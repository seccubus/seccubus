Seccubus V2 README

Seccubus V2 is currently in Beta phase. This code is currently actively
maintained and developed and is the recommended branch. It works with
Nessus 4.x and 5.x with both a home feed and professional feed license.

If you are looking for stable code you might want to use the V1 branch of this
project, but be aware that it only supports Nessus with a professional feed
and is not longer under active development.

10-6-2012 - 2.0.beta4
=====================

New features / Issues resolved
------------------------------
Fixed major performance issues
Fixed installer bug

Bigs fixed (tickets closed):
----------------------------
83 - convert_v2_v2 does not work with default install directory from RPM
(/var/lib/seccubus)
84 - getWorkspaces slow with large database
85 - getScans slow with large databases
86 - getFindings slow with workspaces with lots of findings

