Seccubus V2 Change Log

Seccubus V2 is currently in early Beta phase. This code is currently actively
maintained and developed and is the recommended branch. It works with
Nessus 4.x with both a home feed and professional feed license.

If you are looking for stable code you might want to use the V1 branch of this
project, but be aware that it only supports Nessus with a professional feed
and is not longer under active development.

07-01-2012 - 2.0.beta1
=======================
New features / Issues resolved
------------------------------
With this release Seccubus goes into BETA phase. It also marks the end of
active development for Seccubus V1 (last current version is 1.5.5)
Seccubus V1 is still maintained at a minimum level, meaning that if bugs are
found and they are not too complex to fix, they will be fixed, but no new
features will be added to the V1 branch of the product.

GUI rewrite
-----------
Old GUI is in /oldstyle
Complete GUI code was rewritten using JMVC framework
Those www api calls needed to make this current GUI work have been rewritten
to JSON
New, less confusing, layout of Findings screen

Bigs fixed (tickets closed):
----------------------------
49 - Incorrect status selection possible in GUI for Gone findings
https://sourceforge.net/apps/trac/seccubus/ticket/49
58 - Cannot give GONE findings the status CLOSED
https://sourceforge.net/apps/trac/seccubus/ticket/58

