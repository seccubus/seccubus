---
layout: post
title: Seccubus 2.0.beta3 – The Black Hat edition
---
# Seccubus 2.0.beta3 released (a.k.a. The BlackHat edition)

At this moment I am presenting the new version of Seccubus a Black hat Europe,
The Arsenal.

Seccubus 2.0.beta3 bring us one step closer to non-beta state and is packed
with new features and fixes:

---
    
    
16-3-2012 - 2.0.beta3 (a.k.a. the Blackhat edition)
===

New features / Issues resolved
------------------------------
* Nessus5 tested and found compatilble
* Findings can now be opened and edited individually
* The edit finding dialog shows the change history of the finding
* Long(ish) findings now render with a more link that allows you to expand the
the finding, causing the findigns table to generally dispaly more compact.
* Clarified the purpose of status buttons, filters and bul update form in GUI.
* Added the capability to filter on severity, finding text and remark text
* Added the ability for scan scripts to add attachments to runs
* All scan scripts add attachments to runs
* Script to convert Seccubus v1 data to V2 data adds attachments to runs
* Scan history can now be viewed in the GUI and attachments can be dowloaded
* IP numbers now sort correctly
* Restyled status buttons and edit button
* Removed www/oldstyle GUI
* Removed Seccubus.Scan.List

Bigs fixed (tickets closed):
----------------------------
* 60 - Not all items from a Nikto scan appear to create a finding in Seccubus
<https://sourceforge.net/apps/trac/seccubus/ticket/60>
* 62 - Default locations for config.xml does not include ~seccubus/etc/config.xml
<https://sourceforge.net/apps/trac/seccubus/ticket/62>
* 67 - Links in top right of UI do nothing
<https://sourceforge.net/apps/trac/seccubus/ticket/67>
* 71 - Scan result should "window shade" in the UI to hide lengthy text
<https://sourceforge.net/apps/trac/seccubus/ticket/71>
* 75 - Bulk update: Comments only get added when you select overwrite
<https://sourceforge.net/apps/trac/seccubus/ticket/75>
* 74 - Minor bugs in nmap2ivil when using nmap 5.21
<https://sourceforge.net/apps/trac/seccubus/ticket/74>
